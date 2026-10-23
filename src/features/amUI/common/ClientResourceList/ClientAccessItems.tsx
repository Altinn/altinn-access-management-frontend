import React from 'react';
import { useTranslation } from 'react-i18next';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import type { ActionError } from '@/resources/hooks/useActionError';
import type { PartyEntity } from '@/dataObjects/dtos/Party';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

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

  const packageItems = packages.map((entry) => {
    const { itemId, accessPackage, onDelegate, onRevoke } = entry;
    const requestFocus = () =>
      requestPackageFocus(clientActionControlId(itemId), restoreFocusFallbackId);
    return buildPackageItem({
      id: itemId,
      accessPackage,
      hasAccess: entry.hasAccess,
      isMobileOrSmaller,
      addDisabled,
      removeDisabled,
      onDelegate: restoreFocusOnSuccess(onDelegate, requestFocus),
      onRevoke: restoreFocusOnSuccess(onRevoke, requestFocus),
      onOpenModal: () => onOpenPackageModal(entry),
      t,
    });
  });

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

  return (
    <ClientAccessSections
      packageItems={packageItems}
      resourceItems={resourceItems}
      emptyText={emptyText}
    />
  );
};
