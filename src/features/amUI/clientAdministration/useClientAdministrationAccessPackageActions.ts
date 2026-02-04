import { useCallback } from 'react';
import { SnackbarDuration, useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import {
  useAddAgentAccessPackagesMutation,
  useRemoveAgentAccessPackagesMutation,
} from '@/rtk/features/clientApi';

interface AccessPackageActionParams {
  roleCode: string;
  packageId: string;
  agentName: string;
  accessPackageName: string;
  fromPartyUuid?: string;
  toPartyUuid?: string;
  actingPartyUuid?: string;
}

export const useClientAdministrationAccessPackageActions = () => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();

  const [addAgentAccessPackages, { isLoading: isAddingAgentAccessPackages }] =
    useAddAgentAccessPackagesMutation();
  const [removeAgentAccessPackages, { isLoading: isRemovingAgentAccessPackages }] =
    useRemoveAgentAccessPackagesMutation();

  const addAccessPackage = useCallback(
    async ({
      roleCode,
      packageId,
      agentName,
      accessPackageName,
      fromPartyUuid,
      toPartyUuid,
      actingPartyUuid,
    }: AccessPackageActionParams) => {
      try {
        await addAgentAccessPackages({
          from: fromPartyUuid!,
          to: toPartyUuid!,
          party: actingPartyUuid!,
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
    [addAgentAccessPackages, openSnackbar],
  );

  const removeAccessPackage = useCallback(
    async ({
      roleCode,
      packageId,
      agentName,
      accessPackageName,
      fromPartyUuid,
      toPartyUuid,
      actingPartyUuid,
    }: AccessPackageActionParams) => {
      try {
        await removeAgentAccessPackages({
          from: fromPartyUuid!,
          to: toPartyUuid!,
          party: actingPartyUuid!,
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
    [openSnackbar, removeAgentAccessPackages],
  );

  return {
    addAccessPackage,
    removeAccessPackage,
    isLoading: isAddingAgentAccessPackages || isRemovingAgentAccessPackages,
  };
};
