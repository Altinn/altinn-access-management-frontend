import { useTranslation } from 'react-i18next';
import { SnackbarDuration, useSnackbar } from '@altinn/altinn-components';

import type { DelegationErrorDetails } from '@/resources/hooks/useDelegateAccessPackage';
import { useDelegateAccessPackage } from '@/resources/hooks/useDelegateAccessPackage';
import { useRevokeAccessPackage } from '@/resources/hooks/useRevokeAccessPackage';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';
import type { ActionError } from '@/resources/hooks/useActionError';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

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
  const isLoading = isDelegationLoading || isRevokeLoading;

  const { t } = useTranslation();
  const { toParty: toPartyFromContext, fromParty, actingParty } = usePartyRepresentation();
  const { openSnackbar } = useSnackbar();

  const handleDelegateSuccess = (accessPackage: AccessPackage, toParty: Party) => {
    if (onDelegateSuccess) onDelegateSuccess(accessPackage, toParty);
    else {
      openSnackbar({
        message: t('access_packages.package_delegation_success', {
          name: toParty.name,
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
          name: toParty.name,
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
          name: toParty.name,
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
          name: toParty.name,
          accessPackage: accessPackage.name,
        }),
        color: 'danger',
        duration: SnackbarDuration.infinite,
      });
    }
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

  const onRequest = () => console.error('requestPackage is not implemented');

  return { onDelegate, onRevoke, onRequest, isDelegationLoading, isRevokeLoading, isLoading };
};
