import { useState, useEffect } from 'react';
import {
  useCreateSingleRightRequestMutation,
  useDeleteSingleRightRequestMutation,
  useGetPendingSingleRightRequestsQuery,
} from '@/rtk/features/requestApi';
import {
  getRequestPartyQueryParams,
  getSingleRightRequestId,
} from '@/resources/utils/singleRightRequestUtils';
import { DelegationAction } from '../../../DelegationModal/EditModal';
import { useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

interface UseSingleRightRequestsProps {
  actingParty?: string;
  toParty?: string;
  fromParty?: string;
  availableActions?: DelegationAction[];
}

export const useSingleRightRequests = ({
  actingParty,
  toParty,
  fromParty,
  availableActions,
}: UseSingleRightRequestsProps) => {
  const [loadingByResourceId, setLoadingByResourceId] = useState<Record<string, boolean>>({});

  const requestQueryParams = getRequestPartyQueryParams(actingParty, fromParty);

  const { openSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const { data: singleRightRequests, isFetching: isRefetching } =
    useGetPendingSingleRightRequestsQuery(
      {
        ...requestQueryParams,
      },
      {
        skip:
          !availableActions?.includes(DelegationAction.REQUEST) ||
          !requestQueryParams?.actingParty ||
          !requestQueryParams?.to,
      },
    );

  useEffect(() => {
    // Clear loading states when query refetch completes
    if (!isRefetching) {
      setLoadingByResourceId({});
    }
  }, [isRefetching]);

  const [createRequest] = useCreateSingleRightRequestMutation();
  const [deleteSentRequest] = useDeleteSingleRightRequestMutation();

  const getRequestId = (resourceId: string): string | undefined => {
    return getSingleRightRequestId(singleRightRequests, resourceId, toParty);
  };

  const requestFromList = (resource: ServiceResource) => {
    setLoadingByResourceId((prev) => ({
      ...prev,
      [resource.identifier]: true,
    }));

    return createRequest({
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
        openSnackbar({
          message: t('delegation_modal.request.sent_request_error', {
            resource: resource.title,
          }),
          color: 'danger',
        });
      });
  };

  const deleteRequestFromList = (resource: ServiceResource) => {
    const requestId = getRequestId(resource.identifier);
    if (!requestId) {
      return Promise.reject(new Error('Request ID not found'));
    }

    setLoadingByResourceId((prev) => ({
      ...prev,
      [resource.identifier]: true,
    }));

    return deleteSentRequest({
      actingParty: actingParty || '',
      requestId: requestId,
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
    singleRightRequests,
    isRefetching,
    loadingByResourceId,
    requestFromList,
    deleteRequestFromList,
    getRequestId,
    isLoadingRequest,
  };
};
