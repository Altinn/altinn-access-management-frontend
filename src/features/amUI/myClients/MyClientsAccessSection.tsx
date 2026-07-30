import React, { useCallback, useState } from 'react';
import { useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import {
  ClientAccessList,
  type ClientAccessPackageAction,
  type ClientResourceAction,
} from '../common/ClientAccessList/ClientAccessList';
import {
  useRemoveMyClientAccessPackagesMutation,
  useRemoveMyClientResourcesMutation,
  type Client,
} from '@/rtk/features/clientApi';
import { ClientAdminSearchField } from '../common/ClientAdminSearchField/ClientAdminSearchField';
import { getActionError, type ActionError } from '@/resources/hooks/useActionError';

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
  const [removeMyClientResources, { isLoading: isRemovingMyClientResources }] =
    useRemoveMyClientResourcesMutation();

  const [searchString, setSearchString] = useState<string>('');

  const onRemoveAccessPackage = useCallback(
    async (
      { clientId, roleCode, packageId, accessPackageName }: ClientAccessPackageAction,
      onSuccess?: () => void,
      onError?: () => void,
    ) => {
      if (!actingPartyUuid) {
        onError?.();
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
        onSuccess?.();
      } catch {
        openSnackbar({
          message: t('my_clients_page.remove_package_error', {
            name: currentUserName,
            accessPackage: accessPackageName,
          }),
          color: 'danger',
        });
        onError?.();
      }
    },
    [actingPartyUuid, currentUserName, openSnackbar, removeMyClientAccessPackages, t],
  );

  const onRemoveResource = useCallback(
    async (
      { clientId, roleCode, resourceId, resourceName }: ClientResourceAction,
      onSuccess?: () => void,
      onError?: (error?: ActionError) => void,
    ) => {
      if (!actingPartyUuid) {
        onError?.();
        return;
      }

      try {
        await removeMyClientResources({
          provider: actingPartyUuid,
          from: clientId,
          payload: {
            values: [
              {
                role: roleCode,
                resources: [resourceId],
              },
            ],
          },
        }).unwrap();
        openSnackbar({
          message: t('my_clients_page.remove_package_success_snackbar', {
            name: currentUserName,
            accessPackage: resourceName,
          }),
          color: 'success',
        });
        onSuccess?.();
      } catch (error) {
        openSnackbar({
          message: t('my_clients_page.remove_package_error', {
            name: currentUserName,
            accessPackage: resourceName,
          }),
          color: 'danger',
        });
        onError?.(getActionError(error));
      }
    },
    [actingPartyUuid, currentUserName, openSnackbar, removeMyClientResources, t],
  );

  return (
    <>
      <ClientAdminSearchField
        setSearchString={setSearchString}
        searchPlaceholder={t('my_clients_page.search_placeholder')}
      />
      <ClientAccessList
        clients={clients}
        accessStateClients={clients}
        removeDisabled={
          isRemovingMyClientAccessPackages || isRemovingMyClientResources || !actingPartyUuid
        }
        onRemoveAccessPackage={onRemoveAccessPackage}
        onRemoveResource={onRemoveResource}
        requireDelegableForActions={false}
        searchString={searchString}
      />
    </>
  );
};
