import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDisplayName, SnackbarDuration, useSnackbar } from '@altinn/altinn-components';

import type { DelegationErrorDetails } from '@/resources/hooks/useDelegateAccessPackage';
import { useDelegateAccessPackage } from '@/resources/hooks/useDelegateAccessPackage';
import { useRevokeAccessPackage } from '@/resources/hooks/useRevokeAccessPackage';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';
import type { ActionError } from '@/resources/hooks/useActionError';
import {
  useCreatePackageRequestMutation,
  useGetSentRequestsQuery,
  useWithdrawRequestMutation,
} from '@/rtk/features/requestApi';
import { getRequestPartyQueryParams } from '@/resources/utils/singleRightRequestUtils';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { PartyType } from '@/rtk/features/userInfoApi';

interface useAccessPackageActionsProps {
  onDelegateSuccess?: (accessPackage: AccessPackage, toParty: Party) => void;
  onDelegateError?: (accessPackage: AccessPackage, errorInfo: ActionError, toParty?: Party) => void;
  onRevokeSuccess?: (accessPackage: AccessPackage, toParty: Party) => void;
  onRevokeError?: (accessPackage: AccessPackage, errorInfo: ActionError, toParty?: Party) => void;
}

export const useAccessPackageActions = ({
  onDelegateSuccess,
  onDelegateError,
  onRevokeSuccess,
  onRevokeError,
}: useAccessPackageActionsProps) => {
  const { delegatePackage, isLoading: isDelegationLoading } = useDelegateAccessPackage();
  const { revokePackage, isLoading: isRevokeLoading } = useRevokeAccessPackage();
  const [createPackageRequest, { isLoading: isRequestLoading }] = useCreatePackageRequestMutation();
  const [withdrawRequest] = useWithdrawRequestMutation();
  const [loadingByPackageId, setLoadingByPackageId] = useState<Record<string, boolean>>({});
  const isLoading = isDelegationLoading || isRevokeLoading;

  const { t } = useTranslation();
  const { toParty: toPartyFromContext, fromParty, actingParty } = usePartyRepresentation();
  const { openSnackbar } = useSnackbar();
  const requestQueryParams = getRequestPartyQueryParams(
    actingParty?.partyUuid,
    fromParty?.partyUuid,
  );

  const { data: packageRequests, refetch: refetchPackageRequests } = useGetSentRequestsQuery(
    {
      ...requestQueryParams,
      status: ['Pending'],
      type: 'package',
    },
    {
      skip: !requestQueryParams.party || !requestQueryParams.to,
    },
  );

  const formatToPartyName = (party: Party) => {
    return formatDisplayName({
      fullName: party.name,
      type: party?.partyTypeName === PartyType.Person ? 'person' : 'company',
    });
  };

  const handleDelegateSuccess = (accessPackage: AccessPackage, toParty: Party) => {
    if (onDelegateSuccess) onDelegateSuccess(accessPackage, toParty);
    else {
      openSnackbar({
        message: t('access_packages.package_delegation_success', {
          name: formatToPartyName(toParty),
          accessPackage: accessPackage.name,
        }),
        color: 'success',
      });
    }
  };

  const handleDelegateError = (
    accessPackage: AccessPackage,
    toParty: Party,
    httpStatus: string,
    timestamp: string,
    details?: DelegationErrorDetails,
  ) => {
    if (onDelegateError)
      onDelegateError(accessPackage, { httpStatus, timestamp, details }, toParty);
    else {
      openSnackbar({
        message: t('access_packages.package_delegation_error', {
          name: formatToPartyName(toParty),
          accessPackage: accessPackage.name,
        }),
        color: 'danger',
        duration: SnackbarDuration.infinite,
      });
    }
  };

  const handleRevokeSuccess = (accessPackage: AccessPackage, toParty: Party) => {
    if (onRevokeSuccess) onRevokeSuccess(accessPackage, toParty);
    else {
      openSnackbar({
        message: t('access_packages.package_deletion_success', {
          name: formatToPartyName(toParty),
          accessPackage: accessPackage.name,
        }),
        color: 'success',
      });
    }
  };

  const handleRevokeError = (
    accessPackage: AccessPackage,
    toParty: Party,
    httpStatus: string,
    timestamp: string,
  ) => {
    if (onRevokeError) onRevokeError(accessPackage, { httpStatus, timestamp }, toParty);
    else {
      openSnackbar({
        message: t('access_packages.package_deletion_error', {
          name: formatToPartyName(toParty),
          accessPackage: accessPackage.name,
        }),
        color: 'danger',
        duration: SnackbarDuration.infinite,
      });
    }
  };

  const getPackageRequestKey = (accessPackage: AccessPackage) =>
    accessPackage.urn ?? accessPackage.id;

  const getRequestId = (accessPackage: AccessPackage): string | undefined => {
    const packageId = getPackageRequestKey(accessPackage);
    return packageRequests?.find(
      (request) =>
        request.packageId === packageId &&
        request.to.id === requestQueryParams.to &&
        request.status === 'Pending',
    )?.id;
  };

  const onDelegate = async (accessPackage: AccessPackage, toParty?: Party) => {
    if (!fromParty || !actingParty) {
      return;
    }
    const targetToParty = toParty ?? toPartyFromContext;
    if (!targetToParty) return;

    delegatePackage(
      targetToParty,
      fromParty,
      actingParty,
      accessPackage,
      () => {
        handleDelegateSuccess(accessPackage, targetToParty);
      },
      (httpStatus, details) => {
        handleDelegateError(
          accessPackage,
          targetToParty,
          httpStatus.toString(),
          new Date().toISOString(),
          details,
        );
      },
    );
  };

  const onRevoke = async (accessPackage: AccessPackage, toParty?: Party) => {
    if (!fromParty || !actingParty) {
      return;
    }
    const targetToParty = toParty ?? toPartyFromContext;
    if (!targetToParty) return;

    revokePackage(
      targetToParty,
      fromParty,
      actingParty,
      accessPackage,
      () => {
        handleRevokeSuccess(accessPackage, targetToParty);
      },
      (httpStatus) => {
        handleRevokeError(
          accessPackage,
          targetToParty,
          httpStatus.toString(),
          new Date().toISOString(),
        );
      },
    );
  };

  const onRequest = async (accessPackage: AccessPackage) => {
    if (!fromParty || !actingParty) {
      return;
    }
    const packageId = getPackageRequestKey(accessPackage);
    if (loadingByPackageId[packageId]) return;

    setLoadingByPackageId((prev) => ({
      ...prev,
      [packageId]: true,
    }));

    try {
      await createPackageRequest({
        party: actingParty.partyUuid,
        to: fromParty.partyUuid,
        package: packageId,
      }).unwrap();

      setLoadingByPackageId((prev) => {
        const copy = { ...prev };
        delete copy[packageId];
        return copy;
      });
      openSnackbar({
        message: t('delegation_modal.request.sent_request_success', {
          resource: accessPackage.name,
        }),
        color: 'success',
      });
    } catch {
      setLoadingByPackageId((prev) => ({
        ...prev,
        [packageId]: false,
      }));
      openSnackbar({
        message: t('delegation_modal.request.sent_request_error', {
          resource: accessPackage.name,
        }),
        color: 'danger',
        duration: SnackbarDuration.infinite,
      });
    }
  };

  const deleteRequest = async (accessPackage: AccessPackage) => {
    const requestId = getRequestId(accessPackage);
    const packageId = getPackageRequestKey(accessPackage);
    if (loadingByPackageId[packageId]) return;

    if (!requestId) {
      refetchPackageRequests();
      return;
    }

    setLoadingByPackageId((prev) => ({
      ...prev,
      [packageId]: true,
    }));

    try {
      await withdrawRequest({
        party: requestQueryParams.party,
        id: requestId,
      }).unwrap();

      setLoadingByPackageId((prev) => {
        const copy = { ...prev };
        delete copy[packageId];
        return copy;
      });
      openSnackbar({
        message: t('delegation_modal.request.withdraw_request_success', {
          resource: accessPackage.name,
        }),
        color: 'success',
      });
    } catch {
      setLoadingByPackageId((prev) => ({
        ...prev,
        [packageId]: false,
      }));

      openSnackbar({
        message: t('delegation_modal.request.withdraw_request_error', {
          resource: accessPackage.name,
        }),
        color: 'danger',
      });
    }
  };

  return {
    onDelegate,
    onRevoke,
    onRequest,
    deleteRequest,
    hasPendingRequest: (accessPackage: AccessPackage) => !!getRequestId(accessPackage),
    isLoadingRequest: (accessPackage: AccessPackage) =>
      !!loadingByPackageId[getPackageRequestKey(accessPackage)],
    isDelegationLoading,
    isRevokeLoading,
    isRequestLoading,
    isLoading,
  };
};
