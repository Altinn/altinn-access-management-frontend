import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessPackageListItemProps,
  type Color,
  formatDate,
  formatDisplayName,
  type UserListItemProps,
} from '@altinn/altinn-components';

import type {
  AddAgentAccessPackagesFn,
  Agent,
  Client,
  RemoveAgentAccessPackagesFn,
} from '@/rtk/features/clientApi';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import { isSubUnitByType } from '@/resources/utils/reporteeUtils';

import { AccessPackageListItems } from '../AccessPackageListItems/AccessPackageListItems';
import { usePackageAccessControls } from '../AccessInfoModal/usePackageAccessControls';
import { isNewUser } from '../isNewUser';
import { UserListItems, type UserListItemData } from '../UserListItems/UserListItems';
import { useRoleMetadata } from '../UserRoles/useRoleMetadata';
import { useClientAgentAccessPackageActions } from './useClientAgentAccessPackageActions';

export type ClientAgentsAccessListProps = {
  agents: Agent[];
  clientAccessPackages: Agent[];
  client?: Client;
  isLoading: boolean;
  fromPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackagesFn;
  removeAgentAccessPackages: RemoveAgentAccessPackagesFn;
  emptyText?: string;
  addUserButton?: React.ReactNode;
};

const getUserListItemType = (agentType: string): UserListItemProps['type'] => {
  return agentType.toLowerCase() === 'person' ? 'person' : 'company';
};

const getAgentSortKey = (agent: Agent): string =>
  `${isNewUser(agent.agentAddedAt) ? '0' : '1'}:${agent.agent.name.toLowerCase()}`;

const buildPackageIdsByAgentId = (clientAccessPackages: Agent[]) => {
  const map = new Map<string, Set<string>>();
  clientAccessPackages.forEach((agent) => {
    const packageIds = new Set<string>();
    agent.access.forEach((access) => {
      access.packages.forEach((pkg) => {
        packageIds.add(pkg.id);
      });
    });
    map.set(agent.agent.id, packageIds);
  });
  return map;
};

export const ClientAgentsAccessList = ({
  agents,
  clientAccessPackages,
  client,
  isLoading,
  fromPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
  removeAgentAccessPackages,
  emptyText,
  addUserButton,
}: ClientAgentsAccessListProps) => {
  const { t } = useTranslation();
  const { getAccessPackageById } = useAccessPackageLookup();
  const { getRoleMetadata } = useRoleMetadata();
  const { getItemActionProps, modal } = usePackageAccessControls();

  const delegateDisabled = isLoading || !fromPartyUuid || !actingPartyUuid;
  const removeDisabled = isLoading || !fromPartyUuid || !actingPartyUuid;

  const { addClientAccessPackage, removeClientAccessPackage } = useClientAgentAccessPackageActions({
    fromPartyUuid,
    actingPartyUuid,
    addAgentAccessPackages,
    removeAgentAccessPackages,
  });

  const clientAccess = client?.access ?? [];
  const clientType = client?.client.type ?? '';
  const clientIsSubUnit = isSubUnitByType(client?.client.variant);
  const packageType = clientType.toLowerCase() === 'organisasjon' ? 'company' : 'person';

  const packageIdsByAgentId = useMemo(
    () => buildPackageIdsByAgentId(clientAccessPackages),
    [clientAccessPackages],
  );

  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      return getAgentSortKey(a).localeCompare(getAgentSortKey(b));
    });
  }, [agents]);

  const userListItems: UserListItemData[] = sortedAgents.map((agent) => {
    const agentId = agent.agent.id;
    const isRecentlyAdded = isNewUser(agent.agentAddedAt);
    const isSubUnit = isSubUnitByType(agent.agent.variant);
    const userType = getUserListItemType(agent.agent.type);

    const nodes = clientAccess.reduce((acc, access) => {
      if (access.packages.length === 0) return acc;

      const roleName = getRoleMetadata(access.role.id)?.name ?? access.role.name;
      const agentName = formatDisplayName({
        fullName: agent.agent.name,
        type: agent.agent.type === 'Person' ? 'person' : 'company',
      });

      const packages = access.packages?.map<AccessPackageListItemProps>((pkg) => {
        const hasAccess = packageIdsByAgentId.get(agentId)?.has(pkg.id) ?? false;
        const accessPackage = getAccessPackageById(pkg.id);
        const delegable = accessPackage?.isDelegable ?? false;
        const packageName = accessPackage?.name || pkg.name;
        const isViaRole = access.role.code !== 'rettighetshaver';

        return {
          id: pkg.id,
          name: packageName,
          type: packageType,
          isSubUnit: clientIsSubUnit,
          titleAs: 'h3',
          description: isViaRole
            ? t('client_administration_page.via_role', { role: roleName })
            : '',
          color: (hasAccess ? 'company' : 'neutral') as Color,
          ...getItemActionProps({
            packageName,
            accessPackage,
            toPartyName: agentName,
            hasAccess,
            canAct: delegable,
            isViaRole,
            roleName,
            addDisabled: delegateDisabled,
            removeDisabled,
            onAdd: () =>
              addClientAccessPackage(
                agentId,
                access.role.code,
                pkg.urn ?? '',
                agentName,
                packageName,
              ),
            onRemove: () =>
              removeClientAccessPackage(
                agentId,
                access.role.code,
                pkg.urn ?? '',
                agentName,
                packageName,
              ),
          }),
        };
      });

      if (packages) {
        acc.push(...packages.filter((pkg): pkg is AccessPackageListItemProps => pkg !== null));
      }

      return acc;
    }, [] as AccessPackageListItemProps[]);

    return {
      id: agentId,
      name: agent.agent.name,
      type: userType,
      subUnit: isSubUnit,
      deleted: agent.agent.isDeleted ?? undefined,
      collapsible: true,
      interactive: true,
      titleAs: 'h2',
      as: 'button',
      children: <AccessPackageListItems items={nodes} />,
      description:
        userType === 'company'
          ? t('client_administration_page.organization_identifier', {
              orgnr: agent.agent.organizationIdentifier,
            })
          : userType === 'person'
            ? `${t('common.date_of_birth')} ${formatDate(agent.agent.dateOfBirth ?? '')}`
            : undefined,
      badge: isRecentlyAdded
        ? {
            label: t('client_administration_page.new_agent_tag'),
            color: 'success',
            variant: 'base',
          }
        : undefined,
    };
  });

  return (
    <>
      <UserListItems
        items={userListItems}
        searchPlaceholder={t('client_administration_page.agent_search_placeholder')}
        addUserButton={addUserButton}
        emptyText={emptyText}
      />
      {modal}
    </>
  );
};
