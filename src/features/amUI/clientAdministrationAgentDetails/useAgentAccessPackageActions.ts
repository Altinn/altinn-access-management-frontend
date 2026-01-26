import { useCallback } from 'react';
import { SnackbarDuration, useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type {
  AddAgentAccessPackagesFn,
  RemoveAgentAccessPackagesFn,
} from '@/rtk/features/clientApi';

type UseAgentAccessPackageActionsParams = {
  toPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackagesFn;
  removeAgentAccessPackages: RemoveAgentAccessPackagesFn;
};

export const useAgentAccessPackageActions = ({
  toPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
  removeAgentAccessPackages,
}: UseAgentAccessPackageActionsParams) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();

  const addAgentAccessPackage = useCallback(
    async (
      clientId: string,
      roleCode: string,
      packageId: string,
      clientName: string,
      accessPackageName: string,
    ) => {
      if (!toPartyUuid || !actingPartyUuid) {
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
            name: clientName,
            accessPackage: accessPackageName,
          }),
          color: 'success',
        });
      } catch (error) {
        openSnackbar({
          message: t('client_administration_page.delegate_package_error', {
            name: clientName,
            accessPackage: accessPackageName,
          }),
          color: 'danger',
          duration: SnackbarDuration.infinite,
        });
      }
    },
    [actingPartyUuid, addAgentAccessPackages, openSnackbar, t, toPartyUuid],
  );

  const removeAgentAccessPackage = useCallback(
    async (
      clientId: string,
      roleCode: string,
      packageId: string,
      clientName: string,
      accessPackageName: string,
    ) => {
      if (!toPartyUuid || !actingPartyUuid) {
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
            name: clientName,
            accessPackage: accessPackageName,
          }),
          color: 'success',
        });
      } catch (error) {
        openSnackbar({
          message: t('client_administration_page.remove_package_error', {
            name: clientName,
            accessPackage: accessPackageName,
          }),
          color: 'danger',
          duration: SnackbarDuration.infinite,
        });
      }
    },
    [actingPartyUuid, openSnackbar, removeAgentAccessPackages, t, toPartyUuid],
  );

  return { addAgentAccessPackage, removeAgentAccessPackage };
};
