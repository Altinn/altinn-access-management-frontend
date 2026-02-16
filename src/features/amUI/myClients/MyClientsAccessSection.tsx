import React, { useCallback } from 'react';
import { Snackbar, SnackbarDuration, useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { ClientAccessList, type ClientAccessPackageAction } from '../common/ClientAccessList';
import { useRemoveMyClientAccessPackagesMutation, type Client } from '@/rtk/features/clientApi';

type MyClientsAccessSectionProps = {
  clients: Client[];
  actingPartyUuid: string;
  currentUserName: string;
};

export const MyClientsAccessSection = ({
  clients,
  actingPartyUuid,
  currentUserName,
}: MyClientsAccessSectionProps) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const [removeMyClientAccessPackages, { isLoading: isRemovingMyClientAccessPackages }] =
    useRemoveMyClientAccessPackagesMutation();

  const onRemoveAccessPackage = useCallback(
    async ({ clientId, roleCode, packageId, accessPackageName }: ClientAccessPackageAction) => {
      if (!actingPartyUuid) {
        return;
      }

      try {
        await removeMyClientAccessPackages({
          provider: actingPartyUuid,
          from: clientId,
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
          message: t('my_clients_page.remove_package_success_snackbar', {
            name: currentUserName,
            accessPackage: accessPackageName,
          }),
          color: 'success',
        });
      } catch {
        openSnackbar({
          message: t('my_clients_page.remove_package_error', {
            name: currentUserName,
            accessPackage: accessPackageName,
          }),
          color: 'danger',
          duration: SnackbarDuration.infinite,
        });
      }
    },
    [actingPartyUuid, currentUserName, openSnackbar, removeMyClientAccessPackages, t],
  );

  return (
    <>
      <ClientAccessList
        clients={clients}
        accessStateClients={clients}
        removeDisabled={isRemovingMyClientAccessPackages || !actingPartyUuid}
        onRemoveAccessPackage={onRemoveAccessPackage}
        requireDelegableForActions={false}
        searchPlaceholder={t('my_clients_page.search_placeholder')}
      />
      <Snackbar />
    </>
  );
};
