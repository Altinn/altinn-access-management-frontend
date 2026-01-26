import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DsParagraph, formatDisplayName } from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';

import type {
  Client,
  useAddAgentAccessPackagesMutation,
  useRemoveAgentAccessPackagesMutation,
} from '@/rtk/features/clientApi';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import { isSubUnitByType } from '@/resources/utils/reporteeUtils';
import { buildClientParentNameById, buildClientSortKey } from '../common/clientSortUtils';

import { AccessPackageListItems, type AccessPackageListItemData } from './AccessPackageListItems';
import { useAgentAccessPackageActions } from './useAgentAccessPackageActions';
import { UserListItems } from './UserListItems';

type AddAgentAccessPackages = ReturnType<typeof useAddAgentAccessPackagesMutation>[0];
type RemoveAgentAccessPackages = ReturnType<typeof useRemoveAgentAccessPackagesMutation>[0];
type ClientAccessItem = Client['access'][number];
type UserListItemType = 'company' | 'person';

type ClientAdministrationAgentClientsListProps = {
  clients: Client[];
  agentAccessPackages: Client[];
  isLoading: boolean;
  toPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackages;
  removeAgentAccessPackages: RemoveAgentAccessPackages;
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
  agentAccessPackages,
  isLoading,
  toPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
  removeAgentAccessPackages,
}: ClientAdministrationAgentClientsListProps) => {
  const { t } = useTranslation();
  const { getAccessPackageById } = useAccessPackageLookup();
  const noDelegationsText = t('client_administration_page.no_delegations');
  const delegateLabel = t('client_administration_page.delegate_package_button');
  const removeLabel = t('client_administration_page.remove_package_button');
  const delegateDisabled = isLoading || !toPartyUuid || !actingPartyUuid;
  const removeDisabled = isLoading || !toPartyUuid || !actingPartyUuid;

  const { addAgentAccessPackage, removeAgentAccessPackage } = useAgentAccessPackageActions({
    toPartyUuid,
    actingPartyUuid,
    addAgentAccessPackages,
    removeAgentAccessPackages,
  });

  const delegatedPackagesByClientRole = useMemo(() => {
    const map = new Map<string, Set<string>>();
    agentAccessPackages.forEach((client) => {
      client.access.forEach((access) => {
        const key = `${client.client.id}-${access.role.code}`;
        const existing = map.get(key) ?? new Set<string>();
        access.packages.forEach((pkg) => {
          if (pkg.id) {
            existing.add(pkg.id);
          }
          if (pkg.urn) {
            existing.add(pkg.urn);
          }
        });
        map.set(key, existing);
      });
    });
    return map;
  }, [agentAccessPackages]);

  const parentNameById = buildClientParentNameById(clients);
  const sortedClients = sortClientsByKey(clients, parentNameById);

  const buildAccessPackageItems = (
    clientId: string,
    clientName: string,
    access: ClientAccessItem,
  ): {
    items: AccessPackageListItemData[];
    delegableCount: number;
    delegatedCount: number;
  } => {
    const delegatedKey = `${clientId}-${access.role.code}`;
    const delegatedPackageIds = delegatedPackagesByClientRole.get(delegatedKey);
    const items = access.packages
      .map((pkg) => {
        const packageId = pkg.urn ?? pkg.id;
        if (!packageId) {
          return null;
        }
        const accessPackage = getAccessPackageById(pkg.id);
        const accessPackageName = accessPackage?.name ?? pkg.name;
        const isDelegated =
          delegatedPackageIds?.has(packageId) ||
          delegatedPackageIds?.has(pkg.id) ||
          (pkg.urn ? delegatedPackageIds?.has(pkg.urn) : false);
        return {
          id: accessPackage?.id ?? pkg.id,
          size: 'sm',
          name: accessPackageName,
          color: isDelegated ? 'company' : undefined,
          controls: isDelegated ? (
            <Button
              variant='tertiary'
              disabled={removeDisabled}
              onClick={() => {
                removeAgentAccessPackage(
                  clientId,
                  access.role.code,
                  packageId,
                  clientName,
                  accessPackageName,
                );
              }}
            >
              <MinusCircleIcon />
              {removeLabel}
            </Button>
          ) : (
            <Button
              variant='tertiary'
              disabled={delegateDisabled}
              onClick={() => {
                addAgentAccessPackage(
                  clientId,
                  access.role.code,
                  packageId,
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
      })
      .filter((item): item is AccessPackageListItemData => item !== null);
    const delegableCount = items.length;
    const delegatedCount = items.filter((item) => item.color === 'company').length;
    return { items, delegableCount, delegatedCount };
  };

  const renderAccessContent = (client: Client) => {
    if (client.access.length === 0) {
      return {
        nodes: <DsParagraph data-size='sm'>{noDelegationsText}</DsParagraph>,
        totalDelegable: 0,
        totalDelegated: 0,
      };
    }

    let totalDelegable = 0;
    let totalDelegated = 0;
    const nodes = client.access
      .filter((access) => access.packages && access.packages.length > 0)
      .map((access) => {
        const clientName = formatDisplayName({
          fullName: client.client.name,
          type: getUserListItemType(client.client.type),
        });
        const { items, delegableCount, delegatedCount } = buildAccessPackageItems(
          client.client.id,
          clientName,
          access,
        );
        totalDelegable += delegableCount;
        totalDelegated += delegatedCount;

        return (
          <React.Fragment key={`${client.client.id}-${access.role.id}`}>
            {items.length === 0 ? (
              <DsParagraph data-size='sm'>{noDelegationsText}</DsParagraph>
            ) : (
              <AccessPackageListItems items={items} />
            )}
          </React.Fragment>
        );
      });
    return { nodes, totalDelegable, totalDelegated };
  };

  const userListItems = sortedClients.map((client) => {
    const clientId = client.client.id;
    const isSubUnit = isSubUnitByType(client.client.variant);
    const userType = getUserListItemType(client.client.type);
    const { nodes, totalDelegable, totalDelegated } = renderAccessContent(client);
    const tagText = totalDelegable > 0 ? `${totalDelegated} av ${totalDelegable}` : undefined;
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
      children: nodes,
      roleNames: tagText ? [tagText] : undefined,
    };
  });

  return <UserListItems items={userListItems} />;
};
