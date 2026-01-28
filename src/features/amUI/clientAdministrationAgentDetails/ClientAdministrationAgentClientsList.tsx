import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessPackageListItemProps,
  Button,
  type UserListItemProps,
  type Color,
} from '@altinn/altinn-components';

import type {
  AddAgentAccessPackagesFn,
  Client,
  RemoveAgentAccessPackagesFn,
} from '@/rtk/features/clientApi';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import { isSubUnitByType } from '@/resources/utils/reporteeUtils';
import { buildClientParentNameById, buildClientSortKey } from '../common/clientSortUtils';
import { useRoleMetadata } from '../common/UserRoles/useRoleMetadata';

import { useAgentAccessPackageActions } from './useAgentAccessPackageActions';
import { UserListItems, type UserListItemData } from './UserListItems';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { AccessPackageListItems } from './AccessPackageListItems';

type ClientAdministrationAgentClientsListProps = {
  clients: Client[];
  agentAccessPackages: Client[];
  isLoading: boolean;
  toPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackagesFn;
  removeAgentAccessPackages: RemoveAgentAccessPackagesFn;
};

const getUserListItemType = (clientType: string): UserListItemProps['type'] => {
  return clientType.toLowerCase() === 'organisasjon' ? 'company' : 'person';
};

const sortClientsByKey = (clients: Client[], parentNameById: Map<string, string>): Client[] =>
  [...clients].sort((a, b) =>
    buildClientSortKey(a, parentNameById).localeCompare(buildClientSortKey(b, parentNameById)),
  );

export const ClientAdministrationAgentClientsList = ({
  clients,
  agentAccessPackages,
  isLoading,
  toPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
  removeAgentAccessPackages,
}: ClientAdministrationAgentClientsListProps) => {
  const { t } = useTranslation();
  const { getAccessPackageById } = useAccessPackageLookup();
  const { getRoleMetadata } = useRoleMetadata();

  const delegateDisabled = isLoading || !toPartyUuid || !actingPartyUuid;
  const removeDisabled = isLoading || !toPartyUuid || !actingPartyUuid;

  const { addAgentAccessPackage, removeAgentAccessPackage } = useAgentAccessPackageActions({
    toPartyUuid,
    actingPartyUuid,
    addAgentAccessPackages,
    removeAgentAccessPackages,
  });

  const parentNameById = buildClientParentNameById(clients);
  const sortedClients = sortClientsByKey(clients, parentNameById);

  const userListItems: UserListItemData[] = sortedClients.map((client) => {
    const clientId = client.client.id;
    const isSubUnit = isSubUnitByType(client.client.variant);
    const userType = getUserListItemType(client.client.type);

    const nodes = client.access.reduce((acc, access) => {
      if (access.packages.length === 0) return acc;

      const roleName = getRoleMetadata(access.role.id)?.name ?? access.role.name;
      const packages = access.packages?.map<AccessPackageListItemProps>((pkg) => {
        const hasAccess = agentAccessPackages.some((aap) => {
          return (
            aap.client.id === clientId &&
            aap.access.some((p) => p.packages.some((ap) => ap.id === pkg.id))
          );
        });
        const accessPackage = getAccessPackageById(pkg.id);
        return {
          id: pkg.id,
          name: accessPackage?.name || t('client_administration_page.unknown_access_package'),
          type: client.client.type.toLowerCase() === 'organisasjon' ? 'company' : 'person',
          isSubUnit,
          interactive: false,
          description:
            access.role.code !== 'rettighetshaver'
              ? t('client_administration_page.via_role', { role: roleName })
              : '',
          as: 'div',
          color: (hasAccess ? 'company' : 'neutral') as Color,
          controls: hasAccess ? (
            <Button
              variant='tertiary'
              disabled={removeDisabled}
              onClick={() => {
                removeAgentAccessPackage(
                  clientId,
                  access.role.code,
                  pkg.urn ?? '',
                  client.client.name,
                  accessPackage?.name || t('client_administration_page.unknown_access_package'),
                );
              }}
            >
              <MinusCircleIcon />
              {t('client_administration_page.remove_package_button')}
            </Button>
          ) : (
            <Button
              variant='tertiary'
              disabled={delegateDisabled}
              onClick={() => {
                addAgentAccessPackage(
                  clientId,
                  access.role.code,
                  pkg.urn ?? '',
                  client.client.name,
                  accessPackage?.name || t('client_administration_page.unknown_access_package'),
                );
              }}
            >
              <PlusCircleIcon />
              {t('client_administration_page.delegate_package_button')}
            </Button>
          ),
        };
      });

      if (packages) {
        acc.push(...packages.filter((pkg): pkg is AccessPackageListItemProps => pkg !== null));
      }

      return acc;
    }, [] as AccessPackageListItemProps[]);

    return {
      id: clientId,
      name: client.client.name,
      type: userType,
      subUnit: isSubUnit,
      deleted: client.client.isDeleted,
      collapsible: true,
      as: Button,
      children: <AccessPackageListItems items={nodes} />,
      description: t('client_administration_page.organization_identifier', {
        orgnr: client.client.organizationIdentifier,
      }),
    };
  });

  return <UserListItems items={userListItems} />;
};
