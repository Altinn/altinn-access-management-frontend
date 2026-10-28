import React, { useEffect, useRef, useState, type ReactNode } from 'react';

import type { ClientAccess } from '@/rtk/features/clientApi';

import type { HeldAccessByRow } from '../ClientBulkDelegation/getClientBulkItems';
import { ClientAccessInfoModal } from '../DelegationModal/ClientAccessInfoModal';
import { useRestoreFocusContext, useRestoreFocusOnDataChange } from '../RestoreFocus';
import { UserListItems, type UserListItemData } from '../UserListItems/UserListItems';

import type { ClientAccessEntry, RunClientAccessAction } from './clientAccessEntry';
import { ClientAccessContext, type ClientAccessContextValue } from './ClientAccessContext';
import { ClientAccessSections } from './ClientAccessSections';
import { clientActionControlId } from './DelegationControl';

export type ClientAccessRow = Omit<UserListItemData, 'children'> & {
  entries: ClientAccessEntry[];
  /** Rendered above the row's access lists, e.g. bulk actions. */
  actions?: ReactNode;
};

interface ClientAccessRowsProps {
  rows: ClientAccessRow[];
  /** Access currently held, keyed by heldBy. Its identity changing marks a finished refetch. */
  heldPackages: HeldAccessByRow;
  heldResources: HeldAccessByRow;
  heldBy: 'client' | 'agent';
  runAction: RunClientAccessAction;
  canDelegate?: boolean;
  addDisabled?: boolean;
  removeDisabled?: boolean;
  emptyText?: string;
  emptyAccessText?: string;
  searchString?: string;
  expandedIds?: string[];
  onToggleExpanded?: (id: string) => void;
  // Focus target when the acted-on row is no longer reachable here, typically the section heading.
  restoreFocusFallbackId?: string;
}

const holdsAccess = (held: ClientAccess[], entry: ClientAccessEntry) =>
  held.some((access) =>
    entry.kind === 'package'
      ? access.packages.some((pkg) => pkg.id === entry.accessPackage.id)
      : (access.resources ?? []).some((resource) => resource.refId === entry.accessId),
  );

/** Rows of parties with their client access, sharing one action path and one info modal. */
export const ClientAccessRows = ({
  rows,
  heldPackages,
  heldResources,
  heldBy,
  runAction,
  canDelegate = true,
  addDisabled = false,
  removeDisabled = false,
  emptyText,
  emptyAccessText,
  searchString,
  expandedIds,
  onToggleExpanded,
  restoreFocusFallbackId,
}: ClientAccessRowsProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<ClientAccessEntry | null>(null);
  const restoreFocus = useRestoreFocusContext();
  const requestPackageFocus = useRestoreFocusOnDataChange(heldPackages);
  const requestResourceFocus = useRestoreFocusOnDataChange(heldResources);

  const hasAccess = (entry: ClientAccessEntry) => {
    const held = entry.kind === 'package' ? heldPackages : heldResources;
    const rowId = heldBy === 'client' ? entry.clientId : entry.recipient.id;
    return holdsAccess(held.get(rowId) ?? [], entry);
  };

  const context: ClientAccessContextValue = {
    runAction,
    hasAccess,
    canDelegate,
    addDisabled,
    removeDisabled,
    openModal: (entry) => {
      setSelected(entry);
      modalRef.current?.showModal();
    },
    requestItemFocus: (entry) => {
      const requestFocus = entry.kind === 'package' ? requestPackageFocus : requestResourceFocus;
      requestFocus(clientActionControlId(entry.itemId), restoreFocusFallbackId);
    },
  };

  // Request focus synchronously before clearing state, so the originating item is targeted even
  // if its row has moved to another section while the modal was open.
  const restoreFocusOnClose = (itemId: string) => {
    restoreFocus?.requestFocus(itemId, restoreFocusFallbackId);
  };

  // Removing the last row unmounts the list together with its open modal, so onClose never
  // fires. Hand the request to the zone on the way out instead.
  const restoreFocusOnUnmountRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    const openItemId = selected?.itemId;
    restoreFocusOnUnmountRef.current = openItemId ? () => restoreFocusOnClose(openItemId) : null;
  });
  useEffect(() => () => restoreFocusOnUnmountRef.current?.(), []);

  const items: UserListItemData[] = rows.map(({ entries, actions, ...item }) => ({
    ...item,
    children: (
      <>
        {actions}
        <ClientAccessSections
          entries={entries}
          emptyText={emptyAccessText}
        />
      </>
    ),
  }));

  return (
    <ClientAccessContext.Provider value={context}>
      <UserListItems
        items={items}
        emptyText={emptyText}
        searchString={searchString}
        expandedIds={expandedIds}
        onToggleExpanded={onToggleExpanded}
      />
      <ClientAccessInfoModal
        ref={modalRef}
        entry={selected ?? undefined}
        onClose={() => {
          if (selected) restoreFocusOnClose(selected.itemId);
          setSelected(null);
        }}
      />
    </ClientAccessContext.Provider>
  );
};
