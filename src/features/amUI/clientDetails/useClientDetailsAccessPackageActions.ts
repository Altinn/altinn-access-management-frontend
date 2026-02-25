import { useCallback } from 'react';
import { SnackbarDuration, useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type {
  AddAgentAccessPackagesFn,
  RemoveAgentAccessPackagesFn,
} from '@/rtk/features/clientApi';

type UseClientDetailsAccessPackageActionsParams = {
  fromPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackagesFn;
  removeAgentAccessPackages: RemoveAgentAccessPackagesFn;
};

export const useClientDetailsAccessPackageActions = ({
  fromPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
  removeAgentAccessPackages,
}: UseClientDetailsAccessPackageActionsParams) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();

  const addClientAccessPackage = useCallback(
    async (
      agentId: string,
      roleCode: string,
      packageId: string,
      agentName: string,
      accessPackageName: string,
    ) => {
      if (!fromPartyUuid || !actingPartyUuid) {
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
      } catch (error) {
        openSnackbar({
          message: t('client_administration_page.delegate_package_error', {
            name: agentName,
            accessPackage: accessPackageName,
          }),
          color: 'danger',
          duration: SnackbarDuration.infinite,
        });
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
    ) => {
      if (!fromPartyUuid || !actingPartyUuid) {
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
      } catch (error) {
        openSnackbar({
          message: t('client_administration_page.remove_package_error', {
            name: agentName,
            accessPackage: accessPackageName,
          }),
          color: 'danger',
          duration: SnackbarDuration.infinite,
        });
      }
    },
    [actingPartyUuid, fromPartyUuid, openSnackbar, removeAgentAccessPackages, t],
  );

  return { addClientAccessPackage, removeClientAccessPackage };
};
