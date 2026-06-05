import { useCallback } from 'react';
import { useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type {
  AddAgentAccessPackagesFn,
  RemoveAgentAccessPackagesFn,
} from '@/rtk/features/clientApi';

type UseClientAccessPackageActionsParams = {
  fromPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackagesFn;
  removeAgentAccessPackages: RemoveAgentAccessPackagesFn;
};

export const useClientAccessPackageActions = ({
  fromPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
  removeAgentAccessPackages,
}: UseClientAccessPackageActionsParams) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();

  const addClientAccessPackage = useCallback(
    async (
      agentId: string,
      roleCode: string,
      packageId: string,
      agentName: string,
      accessPackageName: string,
      onSuccess?: () => void,
      onError?: () => void,
    ) => {
      if (!fromPartyUuid || !actingPartyUuid) {
        onError?.();
        return;
      }

      try {
        await addAgentAccessPackages({
          from: fromPartyUuid,
          to: agentId,
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
    [actingPartyUuid, addAgentAccessPackages, fromPartyUuid, openSnackbar, t],
  );

  const removeClientAccessPackage = useCallback(
    async (
      agentId: string,
      roleCode: string,
      packageId: string,
      agentName: string,
      accessPackageName: string,
      onSuccess?: () => void,
      onError?: () => void,
    ) => {
      if (!fromPartyUuid || !actingPartyUuid) {
        onError?.();
        return;
      }

      try {
        await removeAgentAccessPackages({
          from: fromPartyUuid,
          to: agentId,
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
    [actingPartyUuid, fromPartyUuid, openSnackbar, removeAgentAccessPackages, t],
  );

  return { addClientAccessPackage, removeClientAccessPackage };
};
