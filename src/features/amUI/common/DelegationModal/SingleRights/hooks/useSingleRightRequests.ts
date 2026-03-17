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
import { useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { usePartyRepresentation } from '../../../PartyRepresentationContext/PartyRepresentationContext';

interface UseSingleRightRequestsProps {
  canRequestRights?: boolean;
}

export const useSingleRightRequests = ({ canRequestRights }: UseSingleRightRequestsProps) => {
  const [loadingByResourceId, setLoadingByResourceId] = useState<Record<string, boolean>>({});
  const { fromParty, actingParty } = usePartyRepresentation();

  const requestQueryParams = getRequestPartyQueryParams(
    actingParty?.partyUuid,
    fromParty?.partyUuid,
  );

  const { openSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const { data: singleRightRequests, isFetching: isRefetching } =
    useGetPendingSingleRightRequestsQuery(
      {
        ...requestQueryParams,
      },
      {
        skip: !canRequestRights || !requestQueryParams?.actingParty || !requestQueryParams?.to,
      },
    );

  useEffect(() => {
    // Clear loading states when query refetch completes
    if (!isRefetching) {
      setLoadingByResourceId({});
    }
  }, [isRefetching]);

  const [createNewRequest] = useCreateSingleRightRequestMutation();
  const [deleteSentRequest] = useDeleteSingleRightRequestMutation();

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

    setLoadingByResourceId((prev) => ({
      ...prev,
      [resource.identifier]: true,
    }));

    deleteSentRequest({
      actingParty: requestQueryParams.actingParty,
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
    createRequest,
    deleteRequest,
    hasPendingRequest: (resourceId: string) => !!getRequestId(resourceId),
    isLoadingRequest,
  };
};
