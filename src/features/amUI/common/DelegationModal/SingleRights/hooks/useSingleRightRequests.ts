import { useState, useEffect } from 'react';
import {
  useCreateResourceRequestMutation,
  useGetSentRequestsQuery,
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
  onCreateRequestError?: (resource: ServiceResource) => void;
  onDeleteRequestError?: (resource: ServiceResource) => void;
}

export const useSingleRightRequests = ({
  canRequestRights,
  onCreateRequestError,
  onDeleteRequestError,
}: UseSingleRightRequestsProps) => {
  const [loadingByResourceId, setLoadingByResourceId] = useState<Record<string, boolean>>({});
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
    isLoading: isLoadingRequests,
    isError: isLoadError,
  } = useGetSentRequestsQuery(
    {
      ...requestQueryParams,
      status: ['Pending'],
      type: 'resource',
    },
    {
      skip: !canRequestRights || !requestQueryParams?.party || !requestQueryParams?.to,
    },
  );

  useEffect(() => {
    // Clear loading states when query refetch completes, or if pending requests fail to load (might happen after a create or delete)
    if (!isRefetching || isLoadError) {
      setLoadingByResourceId({});
    }
  }, [isRefetching, isLoadError]);

  const [createNewRequest] = useCreateResourceRequestMutation();
  const [deleteSentRequest] = useWithdrawRequestMutation();

  const getRequestId = (resourceId: string): string | undefined => {
    return getSingleRightRequestId(singleRightRequests, resourceId, requestQueryParams?.to);
  };

  const createRequest = (resource: ServiceResource) => {
    setLoadingByResourceId((prev) => ({
      ...prev,
      [resource.identifier]: true,
    }));

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
        setLoadingByResourceId((prev) => ({
          ...prev,
          [resource.identifier]: false,
        }));
        if (onCreateRequestError) {
          onCreateRequestError(resource);
        } else {
          openSnackbar({
            message: t('delegation_modal.request.sent_request_error', {
              resource: resource.title,
            }),
            color: 'danger',
          });
        }
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

    setLoadingByResourceId((prev) => ({
      ...prev,
      [resource.identifier]: true,
    }));

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
        setLoadingByResourceId((prev) => ({
          ...prev,
          [resource.identifier]: false,
        }));
        if (onDeleteRequestError) {
          onDeleteRequestError(resource);
        } else {
          openSnackbar({
            message: t('delegation_modal.request.withdraw_request_error', {
              resource: resource.title,
            }),
            color: 'danger',
          });
        }
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
    singleRightRequests,
    isLoadingRequests,
  };
};
