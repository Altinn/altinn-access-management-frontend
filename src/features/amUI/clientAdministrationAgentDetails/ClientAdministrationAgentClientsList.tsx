import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DsHeading, DsParagraph, formatDisplayName } from '@altinn/altinn-components';
import { PlusCircleIcon } from '@navikt/aksel-icons';

import type { Client, useAddAgentAccessPackagesMutation } from '@/rtk/features/clientApi';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import { isSubUnitByType } from '@/resources/utils/reporteeUtils';
import { buildClientParentNameById, buildClientSortKey } from '../common/clientSortUtils';

import { AccessPackageListItems, type AccessPackageListItemData } from './AccessPackageListItems';
import { UserListItems } from './UserListItems';

type AddAgentAccessPackages = ReturnType<typeof useAddAgentAccessPackagesMutation>[0];

type ClientAdministrationAgentClientsListProps = {
  clients: Client[];
  isAddingAgentAccessPackages: boolean;
  toPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackages;
};
export const ClientAdministrationAgentClientsList = ({
  clients,
  isAddingAgentAccessPackages,
  toPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
}: ClientAdministrationAgentClientsListProps) => {
  const { t } = useTranslation();
  const { getAccessPackageById } = useAccessPackageLookup();

  const addAgentAccessPackageHandler = (clientId: string, roleCode: string, packageId: string) => {
    if (!toPartyUuid || !actingPartyUuid) {
      return;
    }

    addAgentAccessPackages({
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
    });
  };

  const parentNameById = buildClientParentNameById(clients);
  const sortedClients = clients
    .map((client) => ({
      client,
      sortKey: buildClientSortKey(client, parentNameById),
    }))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ client }) => client);

  const userListItems = sortedClients.map((client) => {
    const clientId = client.client.id;
    const noDelegationsText = t('client_administration_page.no_delegations');
    const isSubUnit = Boolean(client.client.parent?.id) && isSubUnitByType(client.client.variant);

    const accessContent =
      client.access.length === 0 ? (
        <DsParagraph data-size='sm'>{noDelegationsText}</DsParagraph>
      ) : (
        client.access.map((access) => {
          const accessPackageItems: AccessPackageListItemData[] = access.packages.map((pkg) => {
            const accessPackage = getAccessPackageById(pkg.id);
            return {
              id: accessPackage?.id ?? pkg.id,
              size: 'sm',
              name: accessPackage?.name ?? pkg.name,
              controls: (
                <Button
                  variant='tertiary'
                  disabled={isAddingAgentAccessPackages || !toPartyUuid || !actingPartyUuid}
                  onClick={() => {
                    addAgentAccessPackageHandler(clientId, access.role.code, pkg.urn ?? pkg.id);
                  }}
                >
                  <PlusCircleIcon />
                  {t('client_administration_page.delegate_package_button')}
                </Button>
              ),
            };
          });

          return (
            <>
              <DsHeading>{access.role.code}</DsHeading>
              {accessPackageItems.length === 0 ? (
                <DsParagraph data-size='sm'>{noDelegationsText}</DsParagraph>
              ) : (
                <AccessPackageListItems items={accessPackageItems} />
              )}
            </>
          );
        })
      );

    console.log('client.client.type: ', client.client.type);
    return {
      id: clientId,
      name: formatDisplayName({
        fullName: client.client.name,
        type: client.client.type.toLowerCase() === 'organisasjon' ? 'company' : 'person',
      }),
      type: client.client.type.toLowerCase() === 'organisasjon' ? 'company' : 'person',
      subUnit: isSubUnit,
      collapsible: true,
      as: Button,
      children: accessContent,
    };
  });

  return <UserListItems items={userListItems} />;
};
