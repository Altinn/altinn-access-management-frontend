import { useState, useEffect, useCallback } from 'react';
import { SnackbarDuration, useSnackbar } from '@altinn/altinn-components';
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
  const [processedRequests, setProcessedRequests] = useState<Record<string, ProcessedStatus>>({});
  const [delegationChecks, setDelegationChecks] = useState<
    Record<string, DelegationCheckedRight[]>
  >({});
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);
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
  }, [requestPartyUuid]);

  // Capture snapshot on first successful load (only when fetch has settled for current params)
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

  // Run delegation checks for all snapshotted resources
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
    (resourceId?: string, packageId?: string) => {
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
      await approveRequest({ party: actingParty.partyUuid, id: requestId }).unwrap();
      const id = resourceId ?? packageId ?? '';
      setProcessedRequests((prev) => ({ ...prev, [id]: 'approved' }));
      setSelectedResource(null);
      openSnackbar({
        message: t('request_page.request_approved'),
        color: 'success',
        duration: SnackbarDuration.normal,
      });
    } catch {
      openSnackbar({
        message: t('request_page.approve_failed'),
        color: 'danger',
        duration: SnackbarDuration.infinite,
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
      await rejectRequest({ party: actingParty.partyUuid, id: requestId }).unwrap();
      const id = resourceId ?? packageId ?? '';
      setProcessedRequests((prev) => ({ ...prev, [id]: 'rejected' }));
      setSelectedResource(null);
      openSnackbar({
        message: t('request_page.request_rejected'),
        color: 'success',
        duration: SnackbarDuration.normal,
      });
    } catch {
      openSnackbar({
        message: t('request_page.reject_failed'),
        color: 'danger',
        duration: SnackbarDuration.infinite,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSelection = ({
    resource,
    package: pkg,
  }: {
    resource?: ServiceResource;
    package?: AccessPackage;
  }) => {
    if (resource) {
      const status = processedRequests[resource.identifier];
      if (status) return; // Don't allow selecting already processed requests
      setSelectedResource(resource);
      setSelectedPackage(null);
    } else if (pkg) {
      const status = processedRequests[pkg.id];
      if (status) return; // Don't allow selecting already processed requests
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
    cannotApprove,
    handleClose,
    handleApprove,
    handleReject,
    handleSelection,
  };
};
