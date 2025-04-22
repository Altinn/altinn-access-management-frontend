import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@altinn/altinn-components';

import { useDelegateAccessPackage } from '@/resources/hooks/useDelegateAccessPackage';
import { useRevokeAccessPackage } from '@/resources/hooks/useRevokeAccessPackage';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';
import type { ActionError } from '@/resources/hooks/useActionError';

interface useAccessPackageActionsProps {
  toUuid: string;
  onDelegateSuccess?: (accessPackage: AccessPackage, toParty: Party) => void;
  onDelegateError?: (accessPackage: AccessPackage, errorInfo: ActionError) => void;
  onRevokeSuccess?: (accessPackage: AccessPackage, toParty: Party) => void;
  onRevokeError?: (accessPackage: AccessPackage, errorInfo: ActionError) => void;
}

export const useAccessPackageActions = ({
  toUuid,
  onDelegateSuccess,
  onDelegateError,
  onRevokeSuccess,
  onRevokeError,
}: useAccessPackageActionsProps) => {
  const { delegatePackage, isLoading: isDelegationLoading } = useDelegateAccessPackage();
  const { revokePackage, isLoading: isRevokeLoading } = useRevokeAccessPackage();
  const isLoading = isDelegationLoading || isRevokeLoading;

  const { t } = useTranslation();
  const { data: toParty } = useGetPartyByUUIDQuery(toUuid ?? '');
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
  ) => {
    if (onDelegateError) onDelegateError(accessPackage, { httpStatus, timestamp });
    else {
      openSnackbar({
        message: t('access_packages.package_delegation_error', {
          name: toParty.name,
          accessPackage: accessPackage.name,
        }),
        color: 'alert',
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
      });
    }
  };

  const onDelegate = async (accessPackage: AccessPackage) => {
    if (!toParty) {
      return;
    }
    delegatePackage(
      toParty,
      accessPackage,
      () => {
        handleDelegateSuccess(accessPackage, toParty);
      },
      (httpStatus) => {
        handleDelegateError(
          accessPackage,
          toParty,
          httpStatus.toString(),
          new Date().toISOString(),
        );
      },
    );
  };

  const onRevoke = async (accessPackage: AccessPackage) => {
    if (!toParty) {
      return;
    }
    revokePackage(
      toParty,
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
