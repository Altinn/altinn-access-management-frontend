import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type UserListItemProps } from '@altinn/altinn-components';

import {
  getFormattedDateOfBirthLabel,
  isSubUnitByType,
  formatEntityDisplayName,
} from '@/resources/utils/reporteeUtils';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import type { ActionError } from '@/resources/hooks/useActionError';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type {
  AddAgentAccessPackagesFn,
  AddAgentResourcesFn,
  Agent,
  Client,
  RemoveAgentAccessPackagesFn,
  RemoveAgentResourcesFn,
} from '@/rtk/features/clientApi';
import { PartyType } from '@/dataObjects/dtos/Party';

import { useRoleMetadata } from '../UserRoles/useRoleMetadata';
import { isNewUser } from '../isNewUser';
import { UserListItems, type UserListItemData } from '../UserListItems/UserListItems';
import {
  ClientPackageInfoModal,
  type ClientPackageModalData,
} from '../DelegationModal/AccessPackages/ClientPackageInfoModal';
import {
  ClientAccessItems,
  type ClientPackageEntry,
  type ClientResourceEntry,
} from '../ClientResourceList/ClientAccessItems';
import {
  ClientResourceInfoModal,
  type ClientResourceModalData,
} from '../DelegationModal/SingleRights/ClientResourceInfoModal';
import { useClientResourceActions } from '../ClientResourceList/useClientResourceActions';
import { useRestoreFocusContext, useRestoreFocusOnDataChange } from '../RestoreFocus';

import { useClientAccessPackageActions } from './useClientAccessPackageActions';

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

type SelectedAgentResource = {
  itemId: string;
  agentId: string;
  refId: string;
  resource: ServiceResource;
  toPartyName: string;
  onDelegate?: (
    onSuccess?: () => void,
    onError?: (error?: ActionError) => void,
  ) => void | Promise<void>;
  onRevoke?: (
    onSuccess?: () => void,
    onError?: (error?: ActionError) => void,
  ) => void | Promise<void>;
};

const getUserListItemType = (agentType: PartyType): UserListItemProps['type'] => {
  return agentType === PartyType.Person ? 'person' : 'company';
};

const getAgentSortKey = (agent: Agent): string =>
  `${isNewUser(agent.agentAddedAt) ? '0' : '1'}:${agent.agent.name.toLowerCase()}`;

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

  const { addClientAccessPackage, removeClientAccessPackage } = useClientAccessPackageActions({
    fromPartyUuid,
    actingPartyUuid,
    addAgentAccessPackages,
    removeAgentAccessPackages,
  });

  const { addClientResource, removeClientResource } = useClientResourceActions({
    actingPartyUuid,
    addAgentResources,
    removeAgentResources,
  });

  const modalRef = useRef<HTMLDialogElement>(null);
  const resourceModalRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<{
    itemId: string;
    data: ClientPackageModalData;
  } | null>(null);
  const [selectedResource, setSelectedResource] = useState<SelectedAgentResource | null>(null);
  const restoreFocus = useRestoreFocusContext();
  const requestPackageFocus = useRestoreFocusOnDataChange(clientAccessPackages);
  const requestResourceFocus = useRestoreFocusOnDataChange(clientResources);

  const clientAccess = client?.access ?? [];

  const packageIdsByAgentId = useMemo(() => {
    const map = new Map<string, Set<string>>();
    (clientAccessPackages ?? []).forEach((agent) => {
      const packageIds = new Set<string>();
      agent.access.forEach((access) => {
        access.packages.forEach((pkg) => {
          packageIds.add(pkg.id);
        });
      });
      map.set(agent.agent.id, packageIds);
    });
    return map;
  }, [clientAccessPackages]);

  const agentHasPackage = (agentId: string, packageId: string) =>
    packageIdsByAgentId.get(agentId)?.has(packageId) ?? false;

  const resourceRefIdsByAgentId = useMemo(() => {
    const map = new Map<string, Set<string>>();
    (clientResources ?? []).forEach((agent) => {
      const refIds = new Set<string>();
      agent.access.forEach((access) => {
        (access.resources ?? []).forEach((resource) => {
          refIds.add(resource.refId);
        });
      });
      map.set(agent.agent.id, refIds);
    });
    return map;
  }, [clientResources]);

  const agentHasResource = (agentId: string, refId: string) =>
    resourceRefIdsByAgentId.get(agentId)?.has(refId) ?? false;

  const sortedAgents = useMemo(
    () => [...agents].sort((a, b) => getAgentSortKey(a).localeCompare(getAgentSortKey(b))),
    [agents],
  );

  const openPackageModal = (entry: ClientPackageEntry) => {
    setSelected({
      itemId: entry.itemId,
      data: {
        party: entry.party,
        accessPackage: entry.accessPackage,
        userHasAccess: entry.hasAccess,
        roleDescription: entry.roleDescription,
        onDelegate: entry.onDelegate,
        onRevoke: entry.onRevoke ?? (() => {}),
      },
    });
    modalRef.current?.showModal();
  };

  const openResourceModal = (entry: ClientResourceEntry) => {
    setSelectedResource({
      itemId: entry.itemId,
      agentId: entry.party.id,
      refId: entry.resource.identifier,
      resource: entry.resource,
      toPartyName: formatEntityDisplayName(entry.party),
      onDelegate: entry.onDelegate,
      onRevoke: entry.onRevoke,
    });
    resourceModalRef.current?.showModal();
  };

  const userListItems: UserListItemData[] = sortedAgents.map((agent) => {
    const agentId = agent.agent.id;
    const idPrefix = listKey ? `${listKey}:${agentId}` : agentId;
    const isRecentlyAdded = isNewUser(agent.agentAddedAt);
    const isSubUnit = isSubUnitByType(agent.agent.unitType);
    const userType = getUserListItemType(agent.agent.type);
    const agentName = formatEntityDisplayName(agent.agent);

    const packages = clientAccess.flatMap((access) => {
      const roleName = getRoleMetadata(access.role.id)?.name ?? access.role.name;
      return access.packages.flatMap<ClientPackageEntry>((pkg) => {
        // The client endpoints only send the package id and urn, so a package we can't look up has
        // no name or resources to show.
        const accessPackage = getAccessPackageByUrn(pkg.urn);
        if (!accessPackage) return [];
        const delegable = accessPackage.isDelegable ?? false;
        return {
          itemId: `${idPrefix}:${access.role.code}:${pkg.id}`,
          party: agent.agent,
          accessPackage,
          hasAccess: agentHasPackage(agentId, pkg.id),
          showAction: delegable,
          roleDescription:
            access.role.code !== 'rettighetshaver'
              ? t('client_administration_page.via_role', { role: roleName })
              : undefined,
          onDelegate: delegable
            ? (onSuccess, onError) =>
                addClientAccessPackage(
                  agentId,
                  access.role.code,
                  pkg.urn,
                  agentName,
                  accessPackage.name,
                  onSuccess,
                  onError,
                )
            : undefined,
          onRevoke: delegable
            ? (onSuccess, onError) =>
                removeClientAccessPackage(
                  agentId,
                  access.role.code,
                  pkg.urn,
                  agentName,
                  accessPackage.name,
                  onSuccess,
                  onError,
                )
            : undefined,
        };
      });
    });

    const resources = clientAccess.flatMap((access) =>
      (access.resources ?? []).flatMap<ClientResourceEntry>((clientResource) => {
        const resource = clientResource.details;
        if (!resource) return [];

        const delegable = resource.delegable && !!addAgentResources && !!removeAgentResources;
        const delegationInput = {
          clientId: fromPartyUuid ?? '',
          agentId,
          roleCode: access.role.code,
          resourceId: clientResource.refId,
          agentName,
          resourceName: resource.title,
        };
        return {
          itemId: `${idPrefix}:${access.role.code}:${clientResource.refId}`,
          party: agent.agent,
          resource,
          hasAccess: agentHasResource(agentId, clientResource.refId),
          showAction: delegable,
          onDelegate: delegable
            ? (onSuccess, onError) => addClientResource(delegationInput, onSuccess, onError)
            : undefined,
          onRevoke: delegable
            ? (onSuccess, onError) => removeClientResource(delegationInput, onSuccess, onError)
            : undefined,
        };
      }),
    );

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
      children: (
        <ClientAccessItems
          packages={packages}
          resources={resources}
          addDisabled={actionsDisabled}
          removeDisabled={actionsDisabled}
          requestPackageFocus={requestPackageFocus}
          requestResourceFocus={requestResourceFocus}
          restoreFocusFallbackId={restoreFocusFallbackId}
          onOpenPackageModal={openPackageModal}
          onOpenResourceModal={openResourceModal}
        />
      ),
      description:
        userType === 'company'
          ? t('client_administration_page.organization_identifier', {
              orgnr: agent.agent.organizationIdentifier,
            })
          : userType === 'person'
            ? getFormattedDateOfBirthLabel(agent.agent.dateOfBirth)
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

  // Resolve the selected item's access live from the unfiltered access state, so the modal stays
  // correct after a mutation even when its row leaves the filtered ("has access" / "all") tab.
  const modalData: ClientPackageModalData | undefined = selected
    ? {
        ...selected.data,
        userHasAccess: agentHasPackage(selected.data.party.id, selected.data.accessPackage.id),
      }
    : undefined;

  // Request focus synchronously before clearing state, so the originating item is targeted even
  // if its row has moved to another section while the modal was open.
  const restoreFocusOnClose = (itemId: string) => {
    restoreFocus?.requestFocus(itemId, restoreFocusFallbackId);
  };

  const resourceModalData: ClientResourceModalData | undefined = selectedResource
    ? {
        resource: selectedResource.resource,
        userHasAccess: agentHasResource(selectedResource.agentId, selectedResource.refId),
        toPartyName: selectedResource.toPartyName,
        onDelegate: selectedResource.onDelegate,
        onRevoke: selectedResource.onRevoke,
      }
    : undefined;

  return (
    <>
      <UserListItems
        items={userListItems}
        emptyText={emptyText}
        searchString={searchString}
        expandedIds={expandedIds}
        onToggleExpanded={onToggleExpanded}
      />
      <ClientPackageInfoModal
        ref={modalRef}
        data={modalData}
        onClose={() => {
          if (selected) restoreFocusOnClose(selected.itemId);
          setSelected(null);
        }}
      />
      <ClientResourceInfoModal
        ref={resourceModalRef}
        data={resourceModalData}
        onClose={() => {
          if (selectedResource) restoreFocusOnClose(selectedResource.itemId);
          setSelectedResource(null);
        }}
      />
    </>
  );
};
