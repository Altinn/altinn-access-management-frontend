import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DsHeading,
  DsParagraph,
  formatDisplayName,
  SnackbarDuration,
  useSnackbar,
} from '@altinn/altinn-components';
import { PlusCircleIcon } from '@navikt/aksel-icons';

import type { Client, useAddAgentAccessPackagesMutation } from '@/rtk/features/clientApi';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import { isSubUnitByType } from '@/resources/utils/reporteeUtils';
import { buildClientParentNameById, buildClientSortKey } from '../common/clientSortUtils';

import { AccessPackageListItems, type AccessPackageListItemData } from './AccessPackageListItems';
import { UserListItems } from './UserListItems';

type AddAgentAccessPackages = ReturnType<typeof useAddAgentAccessPackagesMutation>[0];
type ClientAccessItem = Client['access'][number];
type UserListItemType = 'company' | 'person';

type ClientAdministrationAgentClientsListProps = {
  clients: Client[];
  isAddingAgentAccessPackages: boolean;
  toPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackages;
};

const getUserListItemType = (clientType: string): UserListItemType => {
  return clientType.toLowerCase() === 'organisasjon' ? 'company' : 'person';
};

const sortClientsByKey = (clients: Client[], parentNameById: Map<string, string>): Client[] =>
  [...clients].sort((a, b) =>
    buildClientSortKey(a, parentNameById).localeCompare(buildClientSortKey(b, parentNameById)),
  );

export const ClientAdministrationAgentClientsList = ({
  clients,
  isAddingAgentAccessPackages,
  toPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
}: ClientAdministrationAgentClientsListProps) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { getAccessPackageById } = useAccessPackageLookup();
  const noDelegationsText = t('client_administration_page.no_delegations');
  const delegateLabel = t('client_administration_page.delegate_package_button');
  const delegateDisabled = isAddingAgentAccessPackages || !toPartyUuid || !actingPartyUuid;

  const addAgentAccessPackageHandler = async (
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
  };

  const parentNameById = buildClientParentNameById(clients);
  const sortedClients = sortClientsByKey(clients, parentNameById);

  const buildAccessPackageItems = (
    clientId: string,
    clientName: string,
    access: ClientAccessItem,
  ): AccessPackageListItemData[] => {
    return access.packages.map((pkg) => {
      const accessPackage = getAccessPackageById(pkg.id);
      const accessPackageName = accessPackage?.name ?? pkg.name;
      return {
        id: accessPackage?.id ?? pkg.id,
        size: 'sm',
        name: accessPackageName,
        controls: (
          <Button
            variant='tertiary'
            disabled={delegateDisabled}
            onClick={() => {
              addAgentAccessPackageHandler(
                clientId,
                access.role.code,
                pkg.urn ?? pkg.id,
                clientName,
                accessPackageName,
              );
            }}
          >
            <PlusCircleIcon />
            {delegateLabel}
          </Button>
        ),
      };
    });
  };

  const renderAccessContent = (client: Client) => {
    if (client.access.length === 0) {
      return <DsParagraph data-size='sm'>{noDelegationsText}</DsParagraph>;
    }

    return client.access.map((access) => {
      const clientName = formatDisplayName({
        fullName: client.client.name,
        type: getUserListItemType(client.client.type),
      });
      const accessPackageItems = buildAccessPackageItems(client.client.id, clientName, access);

      return (
        <React.Fragment key={`${client.client.id}-${access.role.id}`}>
          <DsHeading>{access.role.code}</DsHeading>
          {accessPackageItems.length === 0 ? (
            <DsParagraph data-size='sm'>{noDelegationsText}</DsParagraph>
          ) : (
            <AccessPackageListItems items={accessPackageItems} />
          )}
        </React.Fragment>
      );
    });
  };

  const userListItems = sortedClients.map((client) => {
    const clientId = client.client.id;
    const isSubUnit = isSubUnitByType(client.client.variant);
    const userType = getUserListItemType(client.client.type);
    return {
      id: clientId,
      name: formatDisplayName({
        fullName: client.client.name,
        type: userType,
      }),
      type: userType,
      subUnit: isSubUnit,
      collapsible: true,
      as: Button,
      children: renderAccessContent(client),
    };
  });

  return <UserListItems items={userListItems} />;
};
