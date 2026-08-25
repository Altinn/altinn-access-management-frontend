import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessPackageListItemProps,
  formatDisplayName,
  type UserListItemProps,
} from '@altinn/altinn-components';

import type { Client } from '@/rtk/features/clientApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { ActionError } from '@/resources/hooks/useActionError';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import {
  getFormattedDateOfBirthLabel,
  formatOrgNr,
  isSubUnitByType,
} from '@/resources/utils/reporteeUtils';

import { buildClientParentNameById, buildClientSortKey } from '../clientSortUtils';
import { useRoleMetadata } from '../UserRoles/useRoleMetadata';
import { UserListItems, type UserListItemData } from '../UserListItems/UserListItems';
import {
  ClientPackageInfoModal,
  type ClientPackageModalData,
} from '../DelegationModal/AccessPackages/ClientPackageInfoModal';
import { ClientAccessSections } from '../ClientResourceList/ClientAccessSections';
import { type ClientResourceListItemData } from '../ClientResourceList/ClientResourceListItems';
import { buildPackageItem, buildResourceItem } from '../ClientResourceList/buildAccessItems';
import {
  ClientResourceInfoModal,
  type ClientResourceModalData,
} from '../DelegationModal/SingleRights/ClientResourceInfoModal';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import { PartyType } from '@/rtk/features/userInfoApi';
import type { Party } from '@/rtk/features/lookupApi';

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
  clientId: string;
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

type ClientAccessListProps = {
  clients: Client[];
  accessStateClients?: Client[];
  resourceAccessClients?: Client[];
  addDisabled?: boolean;
  removeDisabled?: boolean;
  onAddAccessPackage?: (
    action: ClientAccessPackageAction,
    onSuccess?: () => void,
    onError?: () => void,
  ) => void | Promise<void>;
  onRemoveAccessPackage?: (
    action: ClientAccessPackageAction,
    onSuccess?: () => void,
    onError?: () => void,
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
  requireDelegableForActions?: boolean;
  emptyAccessText?: string;
  emptyText?: string;
  searchString?: string;
  expandedIds?: string[];
  onToggleExpanded?: (id: string) => void;
};

const getUserListItemType = (clientType: string): UserListItemProps['type'] => {
  return clientType.toLowerCase() === 'organisasjon' ? 'company' : 'person';
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
  requireDelegableForActions = true,
  emptyAccessText,
  emptyText,
  searchString,
  expandedIds,
  onToggleExpanded,
}: ClientAccessListProps) => {
  const { t } = useTranslation();
  const { getAccessPackageById } = useAccessPackageLookup();
  const { getRoleMetadata } = useRoleMetadata();
  const isMobileOrSmaller = useIsMobileOrSmaller();
  const modalRef = useRef<HTMLDialogElement>(null);
  const resourceModalRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<ClientPackageModalData | null>(null);
  const [selectedResource, setSelectedResource] = useState<SelectedClientResource | null>(null);
  const clientsForAccessState = accessStateClients ?? clients;
  const clientsForResourceAccessState = resourceAccessClients ?? clientsForAccessState;
  const parentNameById = buildClientParentNameById(clients);
  const sortedClients = sortClientsByKey(clients, parentNameById);

  const clientHasResource = (clientId: string, refId: string) =>
    clientsForResourceAccessState.some(
      (aap) =>
        aap.client.id === clientId &&
        aap.access.some((access) => (access.resources ?? []).some((r) => r.refId === refId)),
    );

  const userListItems: UserListItemData[] = sortedClients.map((client) => {
    const clientId = client.client.id;
    const isSubUnit = isSubUnitByType(client.client.variant);
    const userType = getUserListItemType(client.client.type);
    const clientParty: Party = {
      partyId: 0,
      partyUuid: clientId,
      orgNumber: client.client.organizationIdentifier ?? undefined,
      name: client.client.name,
      partyTypeName: userType === 'company' ? PartyType.Organization : PartyType.Person,
      dateOfBirth: client.client.dateOfBirth ?? undefined,
      variant: client.client.variant ?? undefined,
    };

    const nodes = client.access.reduce((acc, access) => {
      if (access.packages.length === 0) return acc;

      const roleName = getRoleMetadata(access.role.id)?.name ?? access.role.name;
      const packages = access.packages.map<AccessPackageListItemProps>((pkg) => {
        const hasAccess = clientsForAccessState.some((aap) => {
          return (
            aap.client.id === clientId &&
            aap.access.some((p) => p.packages.some((ap) => ap.id === pkg.id))
          );
        });
        const accessPackage = getAccessPackageById(pkg.id);
        const actionIsDelegable = accessPackage?.isDelegable ?? false;
        const showAction = !requireDelegableForActions || actionIsDelegable;
        const packageName = accessPackage?.name || pkg.name;
        const roleDescription =
          access.role.code !== 'rettighetshaver'
            ? t('client_administration_page.via_role', { role: roleName })
            : undefined;

        const onDelegate = onAddAccessPackage
          ? (onSuccess?: () => void, onError?: () => void) =>
              onAddAccessPackage(
                {
                  clientId,
                  roleCode: access.role.code,
                  packageId: pkg.urn ?? '',
                  accessPackageName: packageName,
                },
                onSuccess,
                onError,
              )
          : undefined;
        const onRevoke = onRemoveAccessPackage
          ? (onSuccess?: () => void, onError?: () => void) =>
              onRemoveAccessPackage(
                {
                  clientId,
                  roleCode: access.role.code,
                  packageId: pkg.urn ?? '',
                  accessPackageName: packageName,
                },
                onSuccess,
                onError,
              )
          : undefined;

        const onOpenModal =
          showAction && accessPackage && (onDelegate || onRevoke)
            ? () => {
                setSelected({
                  party: clientParty,
                  accessPackage,
                  userHasAccess: hasAccess,
                  roleDescription,
                  onDelegate,
                  onRevoke: onRevoke ?? (() => {}),
                });
                modalRef.current?.showModal();
              }
            : undefined;

        return buildPackageItem({
          pkg,
          accessPackage,
          packageName,
          hasAccess,
          showAction,
          isMobileOrSmaller,
          addDisabled,
          removeDisabled,
          onDelegate,
          onRevoke,
          onOpenModal,
          t,
        });
      });

      acc.push(...packages);

      return acc;
    }, [] as AccessPackageListItemProps[]);

    const resourceNodes = client.access.reduce((acc, access) => {
      (access.resources ?? []).forEach((clientResource) => {
        const resource = clientResource.details;
        if (!resource) return;

        const hasAccess = clientHasResource(clientId, clientResource.refId);
        const showAction = !requireDelegableForActions || resource.delegable;

        const onDelegate = onAddResource
          ? (onSuccess?: () => void, onError?: (error?: ActionError) => void) =>
              onAddResource(
                {
                  clientId,
                  roleCode: access.role.code,
                  resourceId: clientResource.refId,
                  resourceName: resource.title,
                },
                onSuccess,
                onError,
              )
          : undefined;
        const onRevoke = onRemoveResource
          ? (onSuccess?: () => void, onError?: (error?: ActionError) => void) =>
              onRemoveResource(
                {
                  clientId,
                  roleCode: access.role.code,
                  resourceId: clientResource.refId,
                  resourceName: resource.title,
                },
                onSuccess,
                onError,
              )
          : undefined;

        acc.push(
          buildResourceItem({
            id: `${access.role.code}:${clientResource.refId}`,
            resource,
            hasAccess,
            showAction,
            isMobileOrSmaller,
            addDisabled,
            removeDisabled,
            onDelegate,
            onRevoke,
            onOpenModal: () => {
              setSelectedResource({
                clientId,
                refId: clientResource.refId,
                resource,
                toPartyName: formatDisplayName({
                  fullName: client.client.name,
                  type: userType === 'company' ? 'company' : 'person',
                  reverseNameOrder: false,
                }),
                onDelegate: showAction ? onDelegate : undefined,
                onRevoke: showAction ? onRevoke : undefined,
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
      id: clientId,
      name: client.client.name,
      organizationIdentifier: client.client.organizationIdentifier ?? undefined,
      type: userType,
      subUnit: isSubUnit,
      deleted: client.client.isDeleted ?? undefined,
      collapsible: true,
      interactive: true,
      as: 'button',
      titleAs: 'div',
      children: (
        <ClientAccessSections
          packageItems={nodes}
          resourceItems={resourceNodes}
          emptyText={emptyAccessText}
        />
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
        ...selected,
        userHasAccess: clientsForAccessState.some(
          (aap) =>
            aap.client.id === selected.party.partyUuid &&
            aap.access.some((p) => p.packages.some((ap) => ap.id === selected.accessPackage.id)),
        ),
      }
    : undefined;

  const resourceModalData: ClientResourceModalData | undefined = selectedResource
    ? {
        resource: selectedResource.resource,
        userHasAccess: clientHasResource(selectedResource.clientId, selectedResource.refId),
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
        onClose={() => setSelected(null)}
      />
      <ClientResourceInfoModal
        ref={resourceModalRef}
        data={resourceModalData}
        onClose={() => setSelectedResource(null)}
      />
    </>
  );
};
