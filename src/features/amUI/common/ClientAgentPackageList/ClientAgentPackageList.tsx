import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getFormattedDateOfBirthLabel,
  isSubUnitByType,
  formatEntityDisplayName,
  getAvatarType,
} from '@/resources/utils/reporteeUtils';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import type {
  AddAgentAccessPackagesFn,
  AddAgentResourcesFn,
  Agent,
  Client,
  RemoveAgentAccessPackagesFn,
  RemoveAgentResourcesFn,
} from '@/rtk/features/clientApi';

import { useRoleMetadata } from '../UserRoles/useRoleMetadata';
import { isNewUser } from '../isNewUser';
import { indexHeldAccess } from '../ClientBulkDelegation/getClientBulkItems';
import type { ClientAccessEntry, ClientAccessRecipient } from '../ClientAccess/clientAccessEntry';
import { ClientAccessRows, type ClientAccessRow } from '../ClientAccess/ClientAccessRows';
import { useClientAccessAction } from '../ClientAccess/useClientAccessAction';

type ClientAgentPackageListProps = {
  agents: Agent[];
  clientAccessPackages: Agent[];
  clientResources?: Agent[];
  client?: Client;
  isLoading: boolean;
  fromPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackagesFn;
  removeAgentAccessPackages: RemoveAgentAccessPackagesFn;
  addAgentResources?: AddAgentResourcesFn;
  removeAgentResources?: RemoveAgentResourcesFn;
  // rowKey is unique per list, see listKey.
  renderAgentActions?: (
    agent: Agent,
    rowKey: string,
    restoreFocusFallbackId?: string,
  ) => React.ReactNode;
  emptyText?: string;
  searchString?: string;
  expandedIds?: string[];
  onToggleExpanded?: (id: string) => void;
  // Recently added agents are listed both under "recently added" and in a main section; listKey
  // keeps their DOM ids unique.
  listKey?: string;
  // Focus target when the acted-on row is no longer reachable here, typically the section heading.
  restoreFocusFallbackId?: string;
};

const getAgentSortKey = (agent: Agent): string =>
  `${isNewUser(agent.agentAddedAt) ? '0' : '1'}:${agent.agent.name.toLowerCase()}`;

/** The client page's list: one row per agent, each showing the client's access for that agent. */
export const ClientAgentPackageList = ({
  agents,
  clientAccessPackages,
  clientResources,
  client,
  isLoading,
  fromPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
  removeAgentAccessPackages,
  addAgentResources,
  removeAgentResources,
  renderAgentActions,
  emptyText,
  searchString,
  expandedIds,
  onToggleExpanded,
  listKey,
  restoreFocusFallbackId,
}: ClientAgentPackageListProps) => {
  const { t } = useTranslation();
  const { getAccessPackageByUrn } = useAccessPackageLookup();
  const { getRoleMetadata } = useRoleMetadata();

  const actionsDisabled = isLoading || !fromPartyUuid || !actingPartyUuid;
  const canActOnResources = !!addAgentResources && !!removeAgentResources;

  const runAction = useClientAccessAction({
    actingPartyUuid,
    addAgentAccessPackages,
    removeAgentAccessPackages,
    addAgentResources,
    removeAgentResources,
  });

  const heldPackages = useMemo(
    () => indexHeldAccess(clientAccessPackages, (held) => held.agent.id),
    [clientAccessPackages],
  );
  const heldResources = useMemo(
    () => indexHeldAccess(clientResources ?? [], (held) => held.agent.id),
    [clientResources],
  );

  const sortedAgents = useMemo(
    () => [...agents].sort((a, b) => getAgentSortKey(a).localeCompare(getAgentSortKey(b))),
    [agents],
  );

  const buildEntries = (recipient: ClientAccessRecipient, idPrefix: string) =>
    (client?.access ?? []).flatMap<ClientAccessEntry>((access) => {
      const roleName = getRoleMetadata(access.role.id)?.name ?? access.role.name;
      const shared = { clientId: fromPartyUuid ?? '', recipient, roleCode: access.role.code };

      const packages = access.packages.flatMap<ClientAccessEntry>((pkg) => {
        // The client endpoints only send the package id and urn, so a package we can't look up has
        // no name or resources to show.
        const accessPackage = getAccessPackageByUrn(pkg.urn);
        if (!accessPackage) return [];
        return {
          ...shared,
          kind: 'package',
          itemId: `${idPrefix}:${access.role.code}:${pkg.id}`,
          roleDescription:
            access.role.code !== 'rettighetshaver'
              ? t('client_administration_page.via_role', { role: roleName })
              : undefined,
          accessId: pkg.urn,
          accessPackage,
          canAct: accessPackage.isDelegable ?? false,
        };
      });

      const resources = (access.resources ?? []).flatMap<ClientAccessEntry>((clientResource) => {
        const resource = clientResource.details;
        if (!resource) return [];
        return {
          ...shared,
          kind: 'resource',
          itemId: `${idPrefix}:${access.role.code}:${clientResource.refId}`,
          accessId: clientResource.refId,
          resource,
          canAct: resource.delegable && canActOnResources,
        };
      });

      return [...packages, ...resources];
    });

  const rows: ClientAccessRow[] = sortedAgents.map((agent) => {
    const agentId = agent.agent.id;
    const idPrefix = listKey ? `${listKey}:${agentId}` : agentId;
    const userType = getAvatarType(agent.agent);
    const recipient: ClientAccessRecipient = {
      id: agentId,
      name: formatEntityDisplayName(agent.agent),
      type: agent.agent.type,
    };

    return {
      id: agentId,
      name: recipient.name,
      type: userType,
      subUnit: isSubUnitByType(agent.agent.unitType),
      deleted: agent.agent.isDeleted ?? undefined,
      collapsible: true,
      interactive: true,
      titleAs: 'h2',
      as: 'button',
      entries: buildEntries(recipient, idPrefix),
      actions: renderAgentActions?.(agent, idPrefix, restoreFocusFallbackId),
      description:
        userType === 'company'
          ? t('client_administration_page.organization_identifier', {
              orgnr: agent.agent.organizationIdentifier,
            })
          : userType === 'person'
            ? getFormattedDateOfBirthLabel(agent.agent.dateOfBirth)
            : undefined,
      badge: isNewUser(agent.agentAddedAt)
        ? {
            label: t('client_administration_page.new_agent_tag'),
            color: 'success',
            variant: 'base',
          }
        : undefined,
    };
  });

  return (
    <ClientAccessRows
      rows={rows}
      heldPackages={heldPackages}
      heldResources={heldResources}
      heldBy='agent'
      runAction={runAction}
      addDisabled={actionsDisabled}
      removeDisabled={actionsDisabled}
      emptyText={emptyText}
      searchString={searchString}
      expandedIds={expandedIds}
      onToggleExpanded={onToggleExpanded}
      restoreFocusFallbackId={restoreFocusFallbackId}
    />
  );
};
