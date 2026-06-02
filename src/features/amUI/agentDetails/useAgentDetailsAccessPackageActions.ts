import { useCallback } from 'react';
import { useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type {
  AddAgentAccessPackagesFn,
  RemoveAgentAccessPackagesFn,
} from '@/rtk/features/clientApi';

type UseAgentDetailsAccessPackageActionsParams = {
  toPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackagesFn;
  removeAgentAccessPackages: RemoveAgentAccessPackagesFn;
};

export const useAgentDetailsAccessPackageActions = ({
  toPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
  removeAgentAccessPackages,
}: UseAgentDetailsAccessPackageActionsParams) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();

  const addAgentAccessPackage = useCallback(
    async (
      clientId: string,
      roleCode: string,
      packageId: string,
      agentName: string,
      accessPackageName: string,
      onSuccess?: () => void,
      onError?: () => void,
    ) => {
      if (!toPartyUuid || !actingPartyUuid) {
        onError?.();
        return;
      }

      try {
        await addAgentAccessPackages({
          from: clientId,
          to: toPartyUuid,
          party: actingPartyUuid,
          payload: {
            values: [
              {
                role: roleCode,
                packages: [packageId],
              },
            ],
          },
        }).unwrap();
        openSnackbar({
          message: t('client_administration_page.delegate_package_success_snackbar', {
            name: agentName,
            accessPackage: accessPackageName,
          }),
          color: 'success',
        });
        onSuccess?.();
      } catch {
        openSnackbar({
          message: t('client_administration_page.delegate_package_error', {
            name: agentName,
            accessPackage: accessPackageName,
          }),
          color: 'danger',
        });
        onError?.();
      }
    },
    [actingPartyUuid, addAgentAccessPackages, openSnackbar, t, toPartyUuid],
  );

  const removeAgentAccessPackage = useCallback(
    async (
      clientId: string,
      roleCode: string,
      packageId: string,
      agentName: string,
      accessPackageName: string,
      onSuccess?: () => void,
      onError?: () => void,
    ) => {
      if (!toPartyUuid || !actingPartyUuid) {
        onError?.();
        return;
      }

      try {
        await removeAgentAccessPackages({
          from: clientId,
          to: toPartyUuid,
          party: actingPartyUuid,
          payload: {
            values: [
              {
                role: roleCode,
                packages: [packageId],
              },
            ],
          },
        }).unwrap();
        openSnackbar({
          message: t('client_administration_page.remove_package_success_snackbar', {
            name: agentName,
            accessPackage: accessPackageName,
          }),
          color: 'success',
        });
        onSuccess?.();
      } catch {
        openSnackbar({
          message: t('client_administration_page.remove_package_error', {
            name: agentName,
            accessPackage: accessPackageName,
          }),
          color: 'danger',
        });
        onError?.();
      }
    },
    [actingPartyUuid, openSnackbar, removeAgentAccessPackages, t, toPartyUuid],
  );

  return { addAgentAccessPackage, removeAgentAccessPackage };
};
