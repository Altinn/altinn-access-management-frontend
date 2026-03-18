import { useState, useEffect, useRef } from 'react';
import {
  useCreateResourceRequestMutation,
  useGetPendingSingleRightRequestsQuery,
  useWithdrawRequestMutation,
} from '@/rtk/features/requestApi';
import {
  getRequestPartyQueryParams,
  getSingleRightRequestId,
} from '@/resources/utils/singleRightRequestUtils';
import { useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { usePartyRepresentation } from '../../../PartyRepresentationContext/PartyRepresentationContext';

interface UseSingleRightRequestsProps {
  canRequestRights?: boolean;
}

// Tracks the state snapshot when a mutation was initiated
interface MutationSnapshot {
  hadRequest: boolean; // Whether request existed at mutation time
  resourceId: string;
}

export const useSingleRightRequests = ({ canRequestRights }: UseSingleRightRequestsProps) => {
  const [loadingByResourceId, setLoadingByResourceId] = useState<Record<string, boolean>>({});
  // Track mutation snapshots so we know what state changed
  const mutationSnapshotsRef = useRef<MutationSnapshot[]>([]);

  const { fromParty, actingParty } = usePartyRepresentation();

  const requestQueryParams = getRequestPartyQueryParams(
    actingParty?.partyUuid,
    fromParty?.partyUuid,
  );

  const { openSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const {
    data: singleRightRequests,
    isFetching: isRefetching,
    isError: isQueryError,
  } = useGetPendingSingleRightRequestsQuery(
    {
      ...requestQueryParams,
    },
    {
      skip: !canRequestRights || !requestQueryParams?.party || !requestQueryParams?.to,
    },
  );

  // Monitor refetch completion and clear loading states when mutations complete
  useEffect(() => {
    if (!isRefetching && mutationSnapshotsRef.current.length > 0) {
      setLoadingByResourceId((prev) => {
        const updated = { ...prev };
        const currentRequestIds = new Set(singleRightRequests?.map((req) => req.resourceId) || []);

        // Check each mutation snapshot to see if its state changed
        mutationSnapshotsRef.current.forEach((snapshot) => {
          const hasRequestNow = currentRequestIds.has(snapshot.resourceId);

          // For CREATE: mutation is complete when request now exists (hadRequest was false, now true)
          // For DELETE: mutation is complete when request no longer exists (hadRequest was true, now false)
          // If query failed, we assume mutation succeeded (we already got success response from mutation itself)
          // so we clear loading anyway to avoid stuck state
          if (isQueryError || snapshot.hadRequest !== hasRequestNow) {
            delete updated[snapshot.resourceId];
          }
        });

        // Clear the mutation snapshots once processed
        mutationSnapshotsRef.current = [];

        return updated;
      });
    }
  }, [isRefetching, singleRightRequests, isQueryError]);

  const [createNewRequest] = useCreateResourceRequestMutation();
  const [deleteSentRequest] = useWithdrawRequestMutation();

  const getRequestId = (resourceId: string): string | undefined => {
    return getSingleRightRequestId(singleRightRequests, resourceId, requestQueryParams?.to);
  };

  const createRequest = (resource: ServiceResource) => {
    // Capture the state before mutation
    const hadRequestBefore = !!getRequestId(resource.identifier);

    setLoadingByResourceId((prev) => ({
      ...prev,
      [resource.identifier]: true,
    }));

    // Store the snapshot for when refetch completes
    mutationSnapshotsRef.current.push({
      resourceId: resource.identifier,
      hadRequest: hadRequestBefore,
    });

    createNewRequest({
      ...requestQueryParams,
      resource: resource.identifier,
    })
      .unwrap()
      .then(() =>
        openSnackbar({
          message: t('delegation_modal.request.sent_request_success', {
            resource: resource.title,
          }),
          color: 'success',
        }),
      )
      .catch(() => {
        // Clear immediately on error since refetch won't fix it
        setLoadingByResourceId((prev) => ({
          ...prev,
          [resource.identifier]: false,
        }));
        // Remove from pending snapshots since we're handling the error
        mutationSnapshotsRef.current = mutationSnapshotsRef.current.filter(
          (s) => s.resourceId !== resource.identifier,
        );
        openSnackbar({
          message: t('delegation_modal.request.sent_request_error', {
            resource: resource.title,
          }),
          color: 'danger',
        });
      });
  };

  const deleteRequest = (resource: ServiceResource) => {
    const requestId = getRequestId(resource.identifier);
    if (!requestId) {
      openSnackbar({
        message: t('delegation_modal.request.withdraw_request_error', {
          resource: resource.title,
        }),
        color: 'danger',
      });
      return;
    }

    // Capture the state before mutation
    const hadRequestBefore = !!requestId;

    setLoadingByResourceId((prev) => ({
      ...prev,
      [resource.identifier]: true,
    }));

    // Store the snapshot for when refetch completes
    mutationSnapshotsRef.current.push({
      resourceId: resource.identifier,
      hadRequest: hadRequestBefore,
    });

    deleteSentRequest({
      party: requestQueryParams.party,
      id: requestId,
    })
      .unwrap()
      .then(() => {
        openSnackbar({
          message: t('delegation_modal.request.withdraw_request_success', {
            resource: resource.title,
          }),
          color: 'success',
        });
      })
      .catch(() => {
        // Clear immediately on error since refetch won't fix it
        setLoadingByResourceId((prev) => ({
          ...prev,
          [resource.identifier]: false,
        }));
        // Remove from pending snapshots since we're handling the error
        mutationSnapshotsRef.current = mutationSnapshotsRef.current.filter(
          (s) => s.resourceId !== resource.identifier,
        );
        openSnackbar({
          message: t('delegation_modal.request.withdraw_request_error', {
            resource: resource.title,
          }),
          color: 'danger',
        });
      });
  };

  const isLoadingRequest = (resourceId: string): boolean => {
    return loadingByResourceId[resourceId];
  };

  return {
    createRequest,
    deleteRequest,
    hasPendingRequest: (resourceId: string) => !!getRequestId(resourceId),
    isLoadingRequest,
  };
};
