import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type AccessPackageListItemProps,
  type UserListItemProps,
  formatDisplayName,
} from '@altinn/altinn-components';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import { getFormattedDateOfBirthLabel, isSubUnitByType } from '@/resources/utils/reporteeUtils';
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
import { PartyType } from '@/rtk/features/userInfoApi';

import { useRoleMetadata } from '../UserRoles/useRoleMetadata';
import { isNewUser } from '../isNewUser';
import { UserListItems, type UserListItemData } from '../UserListItems/UserListItems';
import {
  ClientPackageInfoModal,
  type ClientPackageModalData,
} from '../DelegationModal/AccessPackages/ClientPackageInfoModal';
import { ClientAccessSections } from '../ClientResourceList/ClientAccessSections';
import { type ClientResourceListItemData } from '../ClientResourceList/ClientResourceListItems';
import {
  buildPackageItem,
  buildResourceItem,
  clientActionControlId,
  restoreFocusOnSuccess,
} from '../ClientResourceList/buildAccessItems';
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
  // Keeps DOM ids unique when the same agent is rendered in more than one list on the page.
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

const getUserListItemType = (agentType: string): UserListItemProps['type'] => {
  return agentType.toLowerCase() === 'person' ? 'person' : 'company';
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
  const { getAccessPackageById } = useAccessPackageLookup();
  const { getRoleMetadata } = useRoleMetadata();
  const isMobileOrSmaller = useIsMobileOrSmaller();

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

  const userListItems: UserListItemData[] = sortedAgents.map((agent) => {
    const agentId = agent.agent.id;
    const idPrefix = listKey ? `${listKey}:${agentId}` : agentId;
    const isRecentlyAdded = isNewUser(agent.agentAddedAt);
    const isSubUnit = isSubUnitByType(agent.agent.variant);
    const userType = getUserListItemType(agent.agent.type);
    const agentName = formatDisplayName({
      fullName: agent.agent.name,
      type: agent.agent.type === 'Person' ? 'person' : 'company',
    });
    const nodes = clientAccess.reduce((acc, access) => {
      if (access.packages.length === 0) return acc;

      const roleName = getRoleMetadata(access.role.id)?.name ?? access.role.name;

      const packages = access.packages.map<AccessPackageListItemProps>((pkg) => {
        const hasAccess = agentHasPackage(agentId, pkg.id);
        const accessPackage = getAccessPackageById(pkg.id);
        const delegable = accessPackage?.isDelegable ?? false;
        const packageName = accessPackage?.name || pkg.name;
        const roleDescription =
          access.role.code !== 'rettighetshaver'
            ? t('client_administration_page.via_role', { role: roleName })
            : undefined;
        const itemId = `${idPrefix}:${pkg.id}`;
        const requestFocus = () =>
          requestPackageFocus(clientActionControlId(itemId), restoreFocusFallbackId);

        const onDelegate = (onSuccess?: () => void, onError?: () => void) =>
          addClientAccessPackage(
            agentId,
            access.role.code,
            pkg.urn ?? '',
            agentName,
            packageName,
            onSuccess,
            onError,
          );
        const onRevoke = (onSuccess?: () => void, onError?: () => void) =>
          removeClientAccessPackage(
            agentId,
            access.role.code,
            pkg.urn ?? '',
            agentName,
            packageName,
            onSuccess,
            onError,
          );

        const onOpenModal =
          accessPackage && delegable
            ? () => {
                setSelected({
                  itemId,
                  data: {
                    party: {
                      partyId: 0,
                      partyUuid: agentId,
                      name: agent.agent.name,
                      orgNumber: agent.agent.organizationIdentifier ?? undefined,
                      partyTypeName:
                        agent.agent.type.toLowerCase() === 'person'
                          ? PartyType.Person
                          : PartyType.Organization,
                      dateOfBirth: agent.agent.dateOfBirth ?? undefined,
                      variant: agent.agent.variant ?? undefined,
                    },
                    accessPackage,
                    userHasAccess: hasAccess,
                    roleDescription,
                    onDelegate,
                    onRevoke,
                  },
                });
                modalRef.current?.showModal();
              }
            : undefined;

        return buildPackageItem({
          id: itemId,
          accessPackage,
          packageName,
          hasAccess,
          showAction: delegable,
          isMobileOrSmaller,
          addDisabled: actionsDisabled,
          removeDisabled: actionsDisabled,
          onDelegate: restoreFocusOnSuccess(delegable ? onDelegate : undefined, requestFocus),
          onRevoke: restoreFocusOnSuccess(delegable ? onRevoke : undefined, requestFocus),
          onOpenModal,
          t,
        });
      });

      acc.push(...packages);

      return acc;
    }, [] as AccessPackageListItemProps[]);

    const resourceNodes = clientAccess.reduce((acc, access) => {
      (access.resources ?? []).forEach((clientResource) => {
        const resource = clientResource.details;
        if (!resource) return;

        const hasAccess = agentHasResource(agentId, clientResource.refId);
        const delegable = resource.delegable && !!addAgentResources && !!removeAgentResources;
        const itemId = `${idPrefix}:${access.role.code}:${clientResource.refId}`;
        const requestFocus = () =>
          requestResourceFocus(clientActionControlId(itemId), restoreFocusFallbackId);

        const delegationInput = {
          clientId: fromPartyUuid ?? '',
          agentId,
          roleCode: access.role.code,
          resourceId: clientResource.refId,
          agentName,
          resourceName: resource.title,
        };
        const onDelegate = (onSuccess?: () => void, onError?: (error?: ActionError) => void) =>
          addClientResource(delegationInput, onSuccess, onError);
        const onRevoke = (onSuccess?: () => void, onError?: (error?: ActionError) => void) =>
          removeClientResource(delegationInput, onSuccess, onError);

        acc.push(
          buildResourceItem({
            id: itemId,
            resource,
            hasAccess,
            showAction: delegable,
            isMobileOrSmaller,
            addDisabled: actionsDisabled,
            removeDisabled: actionsDisabled,
            onDelegate: restoreFocusOnSuccess(delegable ? onDelegate : undefined, requestFocus),
            onRevoke: restoreFocusOnSuccess(delegable ? onRevoke : undefined, requestFocus),
            onOpenModal: () => {
              setSelectedResource({
                itemId,
                agentId,
                refId: clientResource.refId,
                resource,
                toPartyName: agentName,
                onDelegate: delegable ? onDelegate : undefined,
                onRevoke: delegable ? onRevoke : undefined,
              });
              resourceModalRef.current?.showModal();
            },
            t,
          }),
        );
      });

      return acc;
    }, [] as ClientResourceListItemData[]);

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
        <ClientAccessSections
          packageItems={nodes}
          resourceItems={resourceNodes}
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
        userHasAccess: agentHasPackage(
          selected.data.party.partyUuid,
          selected.data.accessPackage.id,
        ),
      }
    : undefined;

  // Request focus synchronously before clearing state, so the originating item is targeted even
  // if its row has moved to another section while the modal was open.
  const closeModal = (itemId: string) => {
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
          if (selected) closeModal(selected.itemId);
          setSelected(null);
        }}
      />
      <ClientResourceInfoModal
        ref={resourceModalRef}
        data={resourceModalData}
        onClose={() => {
          if (selectedResource) closeModal(selectedResource.itemId);
          setSelectedResource(null);
        }}
      />
    </>
  );
};
