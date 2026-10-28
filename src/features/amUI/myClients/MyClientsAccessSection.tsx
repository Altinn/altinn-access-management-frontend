import React, { useCallback, useState } from 'react';
import { useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { PartyType } from '@/dataObjects/dtos/Party';
import {
  useRemoveMyClientAccessPackagesMutation,
  useRemoveMyClientResourcesMutation,
  type Client,
} from '@/rtk/features/clientApi';
import { getActionError } from '@/resources/hooks/useActionError';

import { ClientAccessList } from '../common/ClientAccessList/ClientAccessList';
import {
  getAccessName,
  type RunClientAccessAction,
} from '../common/ClientAccess/clientAccessEntry';
import { ClientAdminSearchField } from '../common/ClientAdminSearchField/ClientAdminSearchField';

type MyClientsAccessSectionProps = {
  clients: Client[];
  actingPartyUuid: string;
  currentUserName: string;
};

// Focus lands on the search field when a revoked access removed the client row it belonged to.
const MY_CLIENTS_SEARCH_ID = 'my_clients_search';

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

  // Only removal is offered here: you can't give yourself access on behalf of a client.
  const runAction = useCallback<RunClientAccessAction>(
    async (mode, entry) => {
      if (mode !== 'remove' || !actingPartyUuid) {
        return { ok: false };
      }

      const request = { provider: actingPartyUuid, from: entry.clientId };
      const snackbarValues = { name: currentUserName, accessName: getAccessName(entry) };
      try {
        if (entry.kind === 'package') {
          await removeMyClientAccessPackages({
            ...request,
            payload: { values: [{ role: entry.roleCode, packages: [entry.accessId] }] },
          }).unwrap();
        } else {
          await removeMyClientResources({
            ...request,
            payload: { values: [{ role: entry.roleCode, resources: [entry.accessId] }] },
          }).unwrap();
        }
        openSnackbar({
          message: t('my_clients_page.remove_success_snackbar', snackbarValues),
          color: 'success',
        });
        return { ok: true };
      } catch (error) {
        openSnackbar({
          message: t('my_clients_page.remove_error', snackbarValues),
          color: 'danger',
        });
        return { ok: false, error: getActionError(error) };
      }
    },
    [
      actingPartyUuid,
      currentUserName,
      openSnackbar,
      removeMyClientAccessPackages,
      removeMyClientResources,
      t,
    ],
  );

  return (
    <>
      <ClientAdminSearchField
        setSearchString={setSearchString}
        searchPlaceholder={t('my_clients_page.search_placeholder')}
        inputId={MY_CLIENTS_SEARCH_ID}
      />
      <ClientAccessList
        clients={clients}
        accessStateClients={clients}
        recipient={{ id: actingPartyUuid, name: currentUserName, type: PartyType.Person }}
        runAction={runAction}
        canDelegate={false}
        removeDisabled={
          isRemovingMyClientAccessPackages || isRemovingMyClientResources || !actingPartyUuid
        }
        requireDelegableForActions={false}
        searchString={searchString}
        restoreFocusFallbackId={MY_CLIENTS_SEARCH_ID}
      />
    </>
  );
};
