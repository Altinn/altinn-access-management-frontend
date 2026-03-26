import { useState, useEffect, useCallback } from 'react';
import { SnackbarDuration, useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import type { Request, ProcessedStatus } from '../types';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  useApproveRequestMutation,
  useRejectRequestMutation,
  useGetEnrichedReceivedResourceRequestsQuery,
  type EnrichedRequestDto,
} from '@/rtk/features/requestApi';
import {
  useLazyDelegationCheckQuery,
  type ServiceResource,
  type DelegationCheckedRight,
} from '@/rtk/features/singleRights/singleRightsApi';

export const useRequestReview = (request: Request | null, onClose: () => void) => {
  const { t } = useTranslation();
  const { actingParty } = usePartyRepresentation();
  const [approveRequest] = useApproveRequestMutation();
  const [rejectRequest] = useRejectRequestMutation();
  const [lazyDelegationCheck] = useLazyDelegationCheckQuery();
  const { openSnackbar } = useSnackbar();

  const {
    data: resourceRequests,
    isLoading: isLoadingRequests,
    isFetching: isFetchingRequests,
  } = useGetEnrichedReceivedResourceRequestsQuery(
    { party: actingParty?.partyUuid || '', from: request?.partyUuid || '', status: ['Pending'] },
    { skip: !actingParty?.partyUuid || !request?.partyUuid },
  );

  // Snapshot: capture first non-empty result, keep it stable while modal is open
  const [snapshotRequests, setSnapshotRequests] = useState<EnrichedRequestDto[]>([]);
  const [selectedResource, setSelectedResource] = useState<ServiceResource | null>(null);
  const [processedRequests, setProcessedRequests] = useState<Record<string, ProcessedStatus>>({});
  const [delegationChecks, setDelegationChecks] = useState<
    Record<string, DelegationCheckedRight[]>
  >({});
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);

  // Reset state only when switching to a different party (not on every object reference change)
  const requestPartyUuid = request?.partyUuid;
  useEffect(() => {
    setSnapshotRequests([]);
    setSelectedResource(null);
    setProcessedRequests({});
    setDelegationChecks({});
    setActionLoading(null);
  }, [requestPartyUuid]);

  // Capture snapshot on first successful load (only when fetch has settled for current params)
  useEffect(() => {
    if (
      !isFetchingRequests &&
      resourceRequests &&
      resourceRequests.length > 0 &&
      snapshotRequests.length === 0
    ) {
      setSnapshotRequests(resourceRequests);
    }
  }, [resourceRequests, isFetchingRequests, snapshotRequests.length]);

  // Run delegation checks for all snapshotted resources
  useEffect(() => {
    if (snapshotRequests.length === 0) return;
    snapshotRequests.forEach(async (req) => {
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
    (resourceId: string) => {
      const checks = delegationChecks[resourceId];
      return checks?.some((check) => check.result === false) ?? false;
    },
    [delegationChecks],
  );

  const handleClose = () => {
    setSnapshotRequests([]);
    setSelectedResource(null);
    setProcessedRequests({});
    setDelegationChecks({});
    setActionLoading(null);
    onClose();
  };

  const findRequestId = (resourceIdentifier: string): string | undefined =>
    snapshotRequests.find((r) => r.resource.identifier === resourceIdentifier)?.id;

  const handleApprove = async (resource: ServiceResource) => {
    const requestId = findRequestId(resource.identifier);
    if (!requestId || !actingParty?.partyUuid) return;
    setActionLoading('approve');
    try {
      await approveRequest({ party: actingParty.partyUuid, id: requestId }).unwrap();
      setProcessedRequests((prev) => ({ ...prev, [resource.identifier]: 'approved' }));
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

  const handleReject = async (resource: ServiceResource) => {
    const requestId = findRequestId(resource.identifier);
    if (!requestId || !actingParty?.partyUuid) return;
    setActionLoading('reject');
    try {
      await rejectRequest({ party: actingParty.partyUuid, id: requestId }).unwrap();
      setProcessedRequests((prev) => ({ ...prev, [resource.identifier]: 'rejected' }));
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

  const handleSelection = (resource: ServiceResource) => {
    const status = processedRequests[resource.identifier];
    if (status) return; // Don't allow selecting already processed requests
    setSelectedResource(resource);
  };

  const snapshotResources = snapshotRequests.map((r) => r.resource);

  return {
    isLoadingRequests,
    isFetchingRequests,
    snapshotResources,
    selectedResource,
    setSelectedResource,
    processedRequests,
    actionLoading,
    cannotApprove,
    handleClose,
    handleApprove,
    handleReject,
    handleSelection,
  };
};
