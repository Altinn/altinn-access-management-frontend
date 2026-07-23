import { useState, useEffect, useCallback } from 'react';
import { useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import type { Request, ProcessedStatus } from '../types';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  useApproveRequestMutation,
  useRejectRequestMutation,
  useGetEnrichedReceivedResourceRequestsQuery,
  type EnrichedResourceRequest,
  useGetEnrichedReceivedPackageRequestsQuery,
  EnrichedPackageRequest,
} from '@/rtk/features/requestApi';
import {
  useLazyDelegationCheckQuery,
  type ServiceResource,
  type DelegationCheckedRight,
} from '@/rtk/features/singleRights/singleRightsApi';
import { useAccessPackageDelegationCheck } from '../../common/DelegationCheck/AccessPackageDelegationCheckContext';
import { AccessPackage } from '@/rtk/features/accessPackageApi';

type SnapshotRequests = {
  resourceRequests: EnrichedResourceRequest[];
  packageRequests: EnrichedPackageRequest[];
};

export type ProcessedRequest = {
  status: ProcessedStatus;
  handledAt: string;
};

export const useRequestReview = (request: Request | null, onClose: () => void) => {
  const { t } = useTranslation();
  const { actingParty } = usePartyRepresentation();
  const [approveRequest] = useApproveRequestMutation();
  const [rejectRequest] = useRejectRequestMutation();
  const [lazyDelegationCheck] = useLazyDelegationCheckQuery();
  const { openSnackbar } = useSnackbar();

  const {
    data: resourceRequests,
    isLoading: isLoadingResourceRequests,
    isFetching: isFetchingResourceRequests,
  } = useGetEnrichedReceivedResourceRequestsQuery(
    { party: actingParty?.partyUuid || '', from: request?.partyUuid || '', status: ['Pending'] },
    { skip: !actingParty?.partyUuid || !request?.partyUuid },
  );
  const {
    data: packageRequests,
    isLoading: isLoadingPackageRequests,
    isFetching: isFetchingPackageRequests,
  } = useGetEnrichedReceivedPackageRequestsQuery(
    { party: actingParty?.partyUuid || '', from: request?.partyUuid || '', status: ['Pending'] },
    { skip: !actingParty?.partyUuid || !request?.partyUuid },
  );

  // Snapshot: capture first non-empty result, keep it stable while modal is open
  const [snapshotRequests, setSnapshotRequests] = useState<SnapshotRequests>({
    resourceRequests: [],
    packageRequests: [],
  });
  const [selectedResource, setSelectedResource] = useState<ServiceResource | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<AccessPackage | null>(null);
  const [processedRequests, setProcessedRequests] = useState<Record<string, ProcessedRequest>>({});
  const [delegationChecks, setDelegationChecks] = useState<
    Record<string, DelegationCheckedRight[]>
  >({});
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState<'approveAll' | 'rejectAll' | null>(
    null,
  );
  const { canDelegatePackage } = useAccessPackageDelegationCheck();

  // Reset state only when switching to a different party (not on every object reference change)
  const requestPartyUuid = request?.partyUuid;
  useEffect(() => {
    setSnapshotRequests({ resourceRequests: [], packageRequests: [] });
    setSelectedResource(null);
    setSelectedPackage(null);
    setProcessedRequests({});
    setDelegationChecks({});
    setActionLoading(null);
    setBulkActionLoading(null);
  }, [requestPartyUuid]);

  useEffect(() => {
    if (
      !isFetchingResourceRequests &&
      !isFetchingPackageRequests &&
      resourceRequests &&
      packageRequests &&
      snapshotRequests.resourceRequests.length === 0 &&
      snapshotRequests.packageRequests.length === 0 &&
      (resourceRequests.length > 0 || packageRequests.length > 0)
    ) {
      setSnapshotRequests({ resourceRequests, packageRequests });
    }
  }, [
    resourceRequests,
    packageRequests,
    isFetchingResourceRequests,
    isFetchingPackageRequests,
    snapshotRequests.resourceRequests.length,
    snapshotRequests.packageRequests.length,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (snapshotRequests.resourceRequests.length === 0) return;
    snapshotRequests.resourceRequests.forEach(async (req) => {
      const resourceId = req.resource.identifier;
      if (delegationChecks[resourceId]) return;
      try {
        const result = await lazyDelegationCheck(resourceId).unwrap();
        setDelegationChecks((prev) => ({ ...prev, [resourceId]: result }));
      } catch {
        // If delegation check fails, treat as no data
      }
    });
  }, [snapshotRequests]); // eslint-disable-line react-hooks/exhaustive-deps

  const cannotApprove = useCallback(
    ({ resourceId, packageId }: { resourceId?: string; packageId?: string }) => {
      if (packageId) {
        const packageCheck = canDelegatePackage(packageId);
        if (packageCheck === undefined) return false; // allow if no data
        return !packageCheck.result;
      } else if (resourceId) {
        const checks = delegationChecks[resourceId];
        return checks?.some((check) => check.result === false) ?? false;
      }
      return false;
    },
    [delegationChecks, canDelegatePackage],
  );

  const handleClose = () => {
    setSnapshotRequests({ resourceRequests: [], packageRequests: [] });
    setSelectedResource(null);
    setSelectedPackage(null);
    setProcessedRequests({});
    setDelegationChecks({});
    setActionLoading(null);
    setBulkActionLoading(null);
    onClose();
  };

  const findRequestId = (
    resourceIdentifier?: string,
    packageIdentifier?: string,
  ): string | undefined => {
    if (resourceIdentifier) {
      return snapshotRequests.resourceRequests.find(
        (r) => r.resource.identifier === resourceIdentifier,
      )?.id;
    }
    if (packageIdentifier) {
      return snapshotRequests.packageRequests.find((p) => p.package.id === packageIdentifier)?.id;
    }
    return undefined;
  };

  const handleApprove = async ({
    resourceId,
    packageId,
  }: {
    resourceId?: string;
    packageId?: string;
  }) => {
    if (!resourceId && !packageId) return;
    if (resourceId && packageId) return; // Should not happen, but guard against it

    const requestId = findRequestId(resourceId, packageId);
    if (!requestId || !actingParty?.partyUuid) return;
    setActionLoading('approve');

    try {
      const result = await approveRequest({
        party: actingParty.partyUuid,
        id: requestId,
      }).unwrap();
      const id = resourceId ?? packageId ?? '';
      setProcessedRequests((prev) => ({
        ...prev,
        [id]: { status: 'approved', handledAt: result.lastUpdated },
      }));
      openSnackbar({
        message: t('request_page.request_approved'),
        color: 'success',
      });
    } catch {
      openSnackbar({
        message: t('request_page.approve_failed'),
        color: 'danger',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async ({
    resourceId,
    packageId,
  }: {
    resourceId?: string;
    packageId?: string;
  }) => {
    const requestId = findRequestId(resourceId, packageId);
    if (!requestId || !actingParty?.partyUuid) return;
    setActionLoading('reject');
    try {
      const result = await rejectRequest({
        party: actingParty.partyUuid,
        id: requestId,
      }).unwrap();
      const id = resourceId ?? packageId ?? '';
      setProcessedRequests((prev) => ({
        ...prev,
        [id]: { status: 'rejected', handledAt: result.lastUpdated },
      }));
      openSnackbar({
        message: t('request_page.request_rejected'),
        color: 'success',
      });
    } catch {
      openSnackbar({
        message: t('request_page.reject_failed'),
        color: 'danger',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const executeBulkAction = async (
    type: 'approve_all' | 'reject_all',
    items: { id: string; key: string }[],
  ) => {
    if (!actingParty?.partyUuid) return;
    const partyUuid = actingParty.partyUuid;
    const mutate = type === 'approve_all' ? approveRequest : rejectRequest;
    const status: ProcessedStatus = type === 'approve_all' ? 'approved' : 'rejected';
    setBulkActionLoading(type === 'approve_all' ? 'approveAll' : 'rejectAll');
    try {
      const results = await Promise.allSettled(
        items.map(async ({ id, key }) => {
          const result = await mutate({ party: partyUuid, id }).unwrap();
          setProcessedRequests((prev) => ({
            ...prev,
            [key]: { status, handledAt: result.lastUpdated },
          }));
        }),
      );
      const anyFailed = results.some((r) => r.status === 'rejected');
      openSnackbar({
        message: t(
          anyFailed ? `request_page.${type}_partial_failed` : `request_page.${type}_success`,
        ),
        color: anyFailed ? 'danger' : 'success',
      });
    } finally {
      setBulkActionLoading(null);
    }
  };

  const handleApproveAll = () =>
    executeBulkAction('approve_all', [
      ...snapshotRequests.resourceRequests
        .filter(
          (r) =>
            !processedRequests[r.resource.identifier] &&
            !cannotApprove({ resourceId: r.resource.identifier }),
        )
        .map((r) => ({ id: r.id, key: r.resource.identifier })),
      ...snapshotRequests.packageRequests
        .filter(
          (p) => !processedRequests[p.package.id] && !cannotApprove({ packageId: p.package.id }),
        )
        .map((p) => ({ id: p.id, key: p.package.id })),
    ]);

  const handleRejectAll = () =>
    executeBulkAction('reject_all', [
      ...snapshotRequests.resourceRequests
        .filter((r) => !processedRequests[r.resource.identifier])
        .map((r) => ({ id: r.id, key: r.resource.identifier })),
      ...snapshotRequests.packageRequests
        .filter((p) => !processedRequests[p.package.id])
        .map((p) => ({ id: p.id, key: p.package.id })),
    ]);

  const handleSelection = ({
    resource,
    package: pkg,
  }: {
    resource?: ServiceResource;
    package?: AccessPackage;
  }) => {
    if (resource) {
      setSelectedResource(resource);
      setSelectedPackage(null);
    } else if (pkg) {
      setSelectedPackage(pkg);
      setSelectedResource(null);
    }
  };

  const resetSelection = () => {
    setSelectedResource(null);
    setSelectedPackage(null);
  };

  const snapshotResources = snapshotRequests.resourceRequests.map((r) => r.resource);
  const snapshotPackages = snapshotRequests.packageRequests.map((p) => p.package);

  const isLoadingRequests = isLoadingResourceRequests || isLoadingPackageRequests;
  const isFetchingRequests = isFetchingResourceRequests || isFetchingPackageRequests;

  const pendingResourceIds = snapshotResources
    .map((r) => r.identifier)
    .filter((id) => !processedRequests[id]);
  const pendingPackageIds = snapshotPackages
    .map((p) => p.id)
    .filter((id) => !processedRequests[id]);
  const hasPendingRequests = pendingResourceIds.length > 0 || pendingPackageIds.length > 0;
  const hasApprovableRequests =
    pendingResourceIds.some((id) => !cannotApprove({ resourceId: id })) ||
    pendingPackageIds.some((id) => !cannotApprove({ packageId: id }));

  return {
    isLoadingRequests,
    isFetchingRequests,
    snapshotResources,
    snapshotPackages,
    selectedResource,
    selectedPackage,
    resetSelection,
    processedRequests,
    actionLoading,
    bulkActionLoading,
    cannotApprove,
    hasPendingRequests,
    hasApprovableRequests,
    handleClose,
    handleApprove,
    handleReject,
    handleApproveAll,
    handleRejectAll,
    handleSelection,
  };
};
