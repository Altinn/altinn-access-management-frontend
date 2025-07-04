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
  onDelegateError?: (accessPackage: AccessPackage, errorInfo: ActionError) => void;
  onRevokeSuccess?: (accessPackage: AccessPackage, toParty: Party) => void;
  onRevokeError?: (accessPackage: AccessPackage, errorInfo: ActionError) => void;
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
  const { toParty, fromParty, actingParty } = usePartyRepresentation();
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
    if (onDelegateError) onDelegateError(accessPackage, { httpStatus, timestamp, details });
    else {
      openSnackbar({
        message: t('access_packages.package_delegation_error', {
          name: toParty.name,
          accessPackage: accessPackage.name,
        }),
        color: 'alert',
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
    if (onRevokeError) onRevokeError(accessPackage, { httpStatus, timestamp });
    else {
      openSnackbar({
        message: t('access_packages.package_deletion_error', {
          name: toParty.name,
          accessPackage: accessPackage.name,
        }),
        color: 'alert',
        duration: SnackbarDuration.infinite,
      });
    }
  };

  const onDelegate = async (accessPackage: AccessPackage) => {
    if (!toParty || !fromParty || !actingParty) {
      return;
    }
    delegatePackage(
      toParty,
      fromParty,
      actingParty,
      accessPackage,
      () => {
        handleDelegateSuccess(accessPackage, toParty);
      },
      (httpStatus, details) => {
        handleDelegateError(
          accessPackage,
          toParty,
          httpStatus.toString(),
          new Date().toISOString(),
          details,
        );
      },
    );
  };

  const onRevoke = async (accessPackage: AccessPackage) => {
    if (!toParty || !fromParty || !actingParty) {
      return;
    }
    revokePackage(
      toParty,
      fromParty,
      actingParty,
      accessPackage,
      () => {
        handleRevokeSuccess(accessPackage, toParty);
      },
      (httpStatus) => {
        handleRevokeError(accessPackage, toParty, httpStatus.toString(), new Date().toISOString());
      },
    );
  };

  const onRequest = () => console.error('requestPackage is not implemented');

  return { onDelegate, onRevoke, onRequest, isDelegationLoading, isRevokeLoading, isLoading };
};
