import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsParagraph } from '@altinn/altinn-components';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import type { ActionError } from '@/resources/hooks/useActionError';
import type { PartyEntity } from '@/dataObjects/dtos/Party';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useAccessPackageLookup } from '@/resources/hooks';

import type { useRestoreFocusOnDataChange } from '../RestoreFocus';

import { ClientAccessSections } from './ClientAccessSections';
import {
  buildPackageItem,
  buildResourceItem,
  clientActionControlId,
  restoreFocusOnSuccess,
} from './buildAccessItems';

type PackageActionHandler = (onSuccess?: () => void, onError?: () => void) => void | Promise<void>;

type ResourceActionHandler = (
  onSuccess?: () => void,
  onError?: (error?: ActionError) => void,
) => void | Promise<void>;

export type ClientPackageEntry = {
  itemId: string;
  party: PartyEntity;
  accessPackage: AccessPackage;
  hasAccess: boolean;
  roleDescription?: string;
  onDelegate?: PackageActionHandler;
  onRevoke?: PackageActionHandler;
};

export type ClientResourceEntry = {
  itemId: string;
  // The party the resource is delegated to or from: the client or the agent, depending on the list.
  party: PartyEntity;
  resource: ServiceResource;
  hasAccess: boolean;
  onDelegate?: ResourceActionHandler;
  onRevoke?: ResourceActionHandler;
};

type RequestFocus = ReturnType<typeof useRestoreFocusOnDataChange>;

type ClientAccessItemsProps = {
  packages: ClientPackageEntry[];
  resources: ClientResourceEntry[];
  emptyText?: string;
  addDisabled: boolean;
  removeDisabled: boolean;
  requestPackageFocus: RequestFocus;
  requestResourceFocus: RequestFocus;
  restoreFocusFallbackId?: string;
  onOpenPackageModal: (entry: ClientPackageEntry) => void;
  onOpenResourceModal: (entry: ClientResourceEntry) => void;
};

// Builds the list items for one row. Kept as its own component so the modal openers arrive as
// props: building them in the parent's render would mean passing ref-reading closures to functions.
export const ClientAccessItems = ({
  packages,
  resources,
  emptyText,
  addDisabled,
  removeDisabled,
  requestPackageFocus,
  requestResourceFocus,
  restoreFocusFallbackId,
  onOpenPackageModal,
  onOpenResourceModal,
}: ClientAccessItemsProps) => {
  const { t } = useTranslation();
  const isMobileOrSmaller = useIsMobileOrSmaller();
  const { getAccessPackageByUrn } = useAccessPackageLookup();

  const mapAccessPackages = (accessPackages: ClientPackageEntry[], disableActions?: boolean) => {
    return accessPackages.map((entry) => {
      const requestFocus = () =>
        requestPackageFocus(clientActionControlId(entry.itemId), restoreFocusFallbackId);

      const entry2 = {
        ...entry,
      };

      if (disableActions) {
        entry2.onDelegate = undefined;
        entry2.onRevoke = undefined;
      }

      const isMissingAccessPackage = !entry2.party.id;
      return {
        ...buildPackageItem({
          id: entry2.itemId,
          accessPackage: entry2.accessPackage,
          hasAccess: entry2.hasAccess,
          isMobileOrSmaller,
          addDisabled: disableActions ? true : addDisabled,
          removeDisabled: disableActions ? true : removeDisabled,
          onDelegate: disableActions
            ? undefined
            : restoreFocusOnSuccess(entry2.onDelegate, requestFocus),
          onRevoke: disableActions
            ? undefined
            : restoreFocusOnSuccess(entry2.onRevoke, requestFocus),
          onOpenModal: () => onOpenPackageModal(entry2),
          t,
        }),
        border: isMissingAccessPackage ? 'dotted' : undefined,
        variant: isMissingAccessPackage ? 'default' : undefined,
        shadow: isMissingAccessPackage ? 'none' : undefined,
        badge: isMissingAccessPackage ? { theme: 'subtle', label: 'Mangler' } : undefined,
      };
    });
  };
  const packageItems = mapAccessPackages(packages);

  const resourceItems = resources.map((entry) => {
    const requestFocus = () =>
      requestResourceFocus(clientActionControlId(entry.itemId), restoreFocusFallbackId);
    return buildResourceItem({
      id: entry.itemId,
      resource: entry.resource,
      hasAccess: entry.hasAccess,
      isMobileOrSmaller,
      addDisabled,
      removeDisabled,
      onDelegate: restoreFocusOnSuccess(entry.onDelegate, requestFocus),
      onRevoke: restoreFocusOnSuccess(entry.onRevoke, requestFocus),
      onOpenModal: () => onOpenResourceModal(entry),
    });
  });

  const fixedSystemUserPackages = [
    'urn:altinn:accesspackage:informasjon-og-kommunikasjon',
    'urn:altinn:accesspackage:jordbruk',
  ];
  const useGetSystemuserAccessPackages = () => {
    const assignedPackageUrns = packages.map((x) => x.accessPackage.urn);
    const assignedAccessPackages = packages.filter(
      (x) => fixedSystemUserPackages.indexOf(x.accessPackage?.urn ?? '') > -1,
    );
    const unassignedAccessPackageUrns = fixedSystemUserPackages.filter(
      (x) => assignedPackageUrns.indexOf(x) === -1,
    );
    const unassignedAccessPackages = unassignedAccessPackageUrns
      .map((x) => {
        return getAccessPackageByUrn(x);
      })
      .map((x): ClientPackageEntry => {
        return {
          itemId: x?.urn ?? 'sdf',
          party: {},
          accessPackage: x!,
          hasAccess: false,
          roleDescription: '',
          onDelegate: undefined,
          onRevoke: undefined,
        };
      });

    // want: list of enrichedAssigned, enrichedUnassigned, other

    // has assigned all access packages
    // has assigned all access packages AND has given them to system user
    // is missing one or more access package

    return {
      assignedAccessPackages,
      unassignedAccessPackages,
    };
  };

  const { assignedAccessPackages, unassignedAccessPackages } = useGetSystemuserAccessPackages();

  const enrichedAssignedAccessPackages = mapAccessPackages(assignedAccessPackages, true);
  const enrichedUnassignedAccessPackages = mapAccessPackages(unassignedAccessPackages, true);

  const otherAccessPackages = packageItems.filter(
    (x) => enrichedAssignedAccessPackages.map((x) => x.id).indexOf(x.id) === -1,
  );

  const canAssignToSystemuser = unassignedAccessPackages.length === 0;
  const isAddedToSystemuser =
    unassignedAccessPackages.length === 0 && assignedAccessPackages.every((x) => x.hasAccess);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '1rem',
          borderLeft: '4px solid #000',
          backgroundColor: isAddedToSystemuser ? '#d3eafd' : 'transparent',
        }}
      >
        <div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center' }}>
            <DsButton
              variant='secondary'
              data-color={isAddedToSystemuser ? 'danger' : undefined}
              disabled={!canAssignToSystemuser}
            >
              {isAddedToSystemuser ? 'Fjern fra systembruker' : 'Legg til systembruker'}
            </DsButton>
            {!canAssignToSystemuser && (
              <DsParagraph data-size='sm'>
                Klienten har ikke alle tilgangspakkene som kreves av systembrukeren
              </DsParagraph>
            )}
          </div>
        </div>
        <ClientAccessSections
          packageItems={enrichedAssignedAccessPackages}
          resourceItems={[]}
          emptyText={emptyText}
        />
        <ClientAccessSections
          packageItems={enrichedUnassignedAccessPackages}
          resourceItems={[]}
          emptyText={emptyText}
        />
      </div>
      {(otherAccessPackages.length > 0 || resourceItems.length > 0) && (
        <div style={{ marginTop: '2rem' }}>
          <div>Andre:</div>
          <ClientAccessSections
            packageItems={otherAccessPackages}
            resourceItems={resourceItems}
            emptyText={emptyText}
          />
        </div>
      )}
    </div>
  );

  return (
    <ClientAccessSections
      packageItems={packageItems}
      resourceItems={resourceItems}
      emptyText={emptyText}
    />
  );
};
