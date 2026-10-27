import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getFormattedDateOfBirthLabel,
  formatEntityDisplayName,
  formatOrgNr,
  isSubUnitByType,
  getAvatarType,
} from '@/resources/utils/reporteeUtils';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import type { ActionError } from '@/resources/hooks/useActionError';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { Client } from '@/rtk/features/clientApi';

import { buildClientParentNameById, buildClientSortKey } from '../clientSortUtils';
import { useRoleMetadata } from '../UserRoles/useRoleMetadata';
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
import { useRestoreFocusContext, useRestoreFocusOnDataChange } from '../RestoreFocus';

export type ClientAccessPackageAction = {
  clientId: string;
  roleCode: string;
  packageId: string;
  accessPackageName: string;
};

export type ClientResourceAction = {
  clientId: string;
  roleCode: string;
  resourceId: string;
  resourceName: string;
};

type SelectedClientResource = {
  itemId: string;
  clientId: string;
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

type ClientAccessListProps = {
  clients: Client[];
  accessStateClients?: Client[];
  resourceAccessClients?: Client[];
  addDisabled?: boolean;
  removeDisabled?: boolean;
  onAddAccessPackage?: (
    action: ClientAccessPackageAction,
    onSuccess?: () => void,
    onError?: (error?: ActionError) => void,
  ) => void | Promise<void>;
  onRemoveAccessPackage?: (
    action: ClientAccessPackageAction,
    onSuccess?: () => void,
    onError?: (error?: ActionError) => void,
  ) => void | Promise<void>;
  onAddResource?: (
    action: ClientResourceAction,
    onSuccess?: () => void,
    onError?: (error?: ActionError) => void,
  ) => void | Promise<void>;
  onRemoveResource?: (
    action: ClientResourceAction,
    onSuccess?: () => void,
    onError?: (error?: ActionError) => void,
  ) => void | Promise<void>;
  renderClientActions?: (client: Client, restoreFocusFallbackId?: string) => React.ReactNode;
  requireDelegableForActions?: boolean;
  emptyAccessText?: string;
  emptyText?: string;
  searchString?: string;
  expandedIds?: string[];
  onToggleExpanded?: (id: string) => void;
  // Focus target when the acted-on row is no longer reachable here, typically the section heading.
  restoreFocusFallbackId?: string;
};

const sortClientsByKey = (clients: Client[], parentNameById: Map<string, string>): Client[] =>
  [...clients].sort((a, b) =>
    buildClientSortKey(a, parentNameById).localeCompare(buildClientSortKey(b, parentNameById)),
  );

export const ClientAccessList = ({
  clients,
  accessStateClients,
  resourceAccessClients,
  addDisabled = false,
  removeDisabled = false,
  onAddAccessPackage,
  onRemoveAccessPackage,
  onAddResource,
  onRemoveResource,
  renderClientActions,
  requireDelegableForActions = true,
  emptyAccessText,
  emptyText,
  searchString,
  expandedIds,
  onToggleExpanded,
  restoreFocusFallbackId,
}: ClientAccessListProps) => {
  const { t } = useTranslation();
  const { getAccessPackageByUrn } = useAccessPackageLookup();
  const { getRoleMetadata } = useRoleMetadata();
  const modalRef = useRef<HTMLDialogElement>(null);
  const resourceModalRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<{
    itemId: string;
    data: ClientPackageModalData;
  } | null>(null);
  const [selectedResource, setSelectedResource] = useState<SelectedClientResource | null>(null);
  const clientsForAccessState = accessStateClients ?? clients;
  const clientsForResourceAccessState = resourceAccessClients ?? clientsForAccessState;
  const restoreFocus = useRestoreFocusContext();
  const requestPackageFocus = useRestoreFocusOnDataChange(clientsForAccessState);
  const requestResourceFocus = useRestoreFocusOnDataChange(clientsForResourceAccessState);
  const parentNameById = buildClientParentNameById(clients);
  const sortedClients = sortClientsByKey(clients, parentNameById);

  const clientHasResource = (clientId: string, refId: string) =>
    clientsForResourceAccessState.some(
      (aap) =>
        aap.client.id === clientId &&
        aap.access.some((access) => (access.resources ?? []).some((r) => r.refId === refId)),
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
        onRevoke: entry.onRevoke,
      },
    });
    modalRef.current?.showModal();
  };

  const openResourceModal = (entry: ClientResourceEntry) => {
    setSelectedResource({
      itemId: entry.itemId,
      clientId: entry.party.id,
      resource: entry.resource,
      toPartyName: formatEntityDisplayName(entry.party),
      onDelegate: entry.onDelegate,
      onRevoke: entry.onRevoke,
    });
    resourceModalRef.current?.showModal();
  };

  const userListItems: UserListItemData[] = sortedClients.map((client) => {
    const clientId = client.client.id;
    const isSubUnit = isSubUnitByType(client.client.unitType);
    const userType = getAvatarType(client.client);

    const packages = client.access.flatMap((access) => {
      const roleName = getRoleMetadata(access.role.id)?.name ?? access.role.name;
      return access.packages.flatMap<ClientPackageEntry>((pkg) => {
        // The client endpoints only send the package id and urn, so a package we can't look up has
        // no name or resources to show.
        const accessPackage = getAccessPackageByUrn(pkg.urn);
        if (!accessPackage) return [];
        const canAct = !requireDelegableForActions || (accessPackage.isDelegable ?? false);
        const action: ClientAccessPackageAction = {
          clientId,
          roleCode: access.role.code,
          packageId: pkg.urn,
          accessPackageName: accessPackage.name,
        };
        return {
          itemId: `${clientId}:${access.role.code}:${pkg.id}`,
          party: client.client,
          accessPackage,
          hasAccess: clientsForAccessState.some(
            (aap) =>
              aap.client.id === clientId &&
              aap.access.some((p) => p.packages.some((ap) => ap.id === pkg.id)),
          ),
          roleDescription:
            access.role.code !== 'rettighetshaver'
              ? t('client_administration_page.via_role', { role: roleName })
              : undefined,
          onDelegate:
            canAct && onAddAccessPackage
              ? (onSuccess, onError) => onAddAccessPackage(action, onSuccess, onError)
              : undefined,
          onRevoke:
            canAct && onRemoveAccessPackage
              ? (onSuccess, onError) => onRemoveAccessPackage(action, onSuccess, onError)
              : undefined,
        };
      });
    });

    const resources = client.access.flatMap((access) =>
      (access.resources ?? []).flatMap<ClientResourceEntry>((clientResource) => {
        const resource = clientResource.details;
        if (!resource) return [];

        const canAct = !requireDelegableForActions || resource.delegable;
        const action: ClientResourceAction = {
          clientId,
          roleCode: access.role.code,
          resourceId: clientResource.refId,
          resourceName: resource.title,
        };
        return {
          itemId: `${clientId}:${access.role.code}:${clientResource.refId}`,
          party: client.client,
          resource,
          hasAccess: clientHasResource(clientId, clientResource.refId),
          onDelegate:
            canAct && onAddResource
              ? (onSuccess, onError) => onAddResource(action, onSuccess, onError)
              : undefined,
          onRevoke:
            canAct && onRemoveResource
              ? (onSuccess, onError) => onRemoveResource(action, onSuccess, onError)
              : undefined,
        };
      }),
    );

    return {
      id: clientId,
      name: formatEntityDisplayName(client.client),
      organizationIdentifier: client.client.organizationIdentifier ?? undefined,
      type: userType,
      subUnit: isSubUnit,
      deleted: client.client.isDeleted ?? undefined,
      collapsible: true,
      interactive: true,
      as: 'button',
      titleAs: 'div',
      children: (
        <>
          {renderClientActions?.(client, restoreFocusFallbackId)}
          <ClientAccessItems
            packages={packages}
            resources={resources}
            emptyText={emptyAccessText}
            addDisabled={addDisabled}
            removeDisabled={removeDisabled}
            requestPackageFocus={requestPackageFocus}
            requestResourceFocus={requestResourceFocus}
            restoreFocusFallbackId={restoreFocusFallbackId}
            onOpenPackageModal={openPackageModal}
            onOpenResourceModal={openResourceModal}
          />
        </>
      ),
      description:
        userType === 'company'
          ? t('client_administration_page.organization_identifier', {
              orgnr: formatOrgNr(client.client.organizationIdentifier),
            })
          : userType === 'person'
            ? getFormattedDateOfBirthLabel(client.client.dateOfBirth)
            : undefined,
    };
  });

  // Resolve the selected item's access live from the unfiltered access state, so the modal stays
  // correct after a mutation even when its row leaves the rendered (filtered) list.
  const modalData: ClientPackageModalData | undefined = selected
    ? {
        ...selected.data,
        userHasAccess: clientsForAccessState.some(
          (aap) =>
            aap.client.id === selected.data.party.id &&
            aap.access.some((p) =>
              p.packages.some((ap) => ap.id === selected.data.accessPackage.id),
            ),
        ),
      }
    : undefined;

  // Request focus synchronously before clearing state, so the originating item is targeted even
  // if its row has moved to another section while the modal was open.
  const restoreFocusOnClose = (itemId: string) => {
    restoreFocus?.requestFocus(itemId, restoreFocusFallbackId);
  };

  // Removing the last client unmounts the list together with its open modal, so onClose never
  // fires. Hand the request to the zone on the way out instead.
  const restoreFocusOnUnmountRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    const openItemId = selected?.itemId ?? selectedResource?.itemId;
    restoreFocusOnUnmountRef.current = openItemId ? () => restoreFocusOnClose(openItemId) : null;
  });
  useEffect(() => () => restoreFocusOnUnmountRef.current?.(), []);

  const resourceModalData: ClientResourceModalData | undefined = selectedResource
    ? {
        resource: selectedResource.resource,
        userHasAccess: clientHasResource(
          selectedResource.clientId,
          selectedResource.resource.identifier,
        ),
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
