import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import { DsHeading } from '@altinn/altinn-components';

import type { ClientAccess } from '@/rtk/features/clientApi';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';

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
  systemUserSets?: { name: string; accessPackages: string[]; resources: string[] }[];
  /** Rendered above the row's access lists, e.g. bulk actions. */
  renderActions: (
    items?: { packageId: string; resourceId: string; roleCode: string }[],
  ) => ReactNode;
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
  const { getAccessPackageByUrn } = useAccessPackageLookup();

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

  // hvert rettighetssett er en ClientAccessSections.
  const items: UserListItemData[] = rows.map(({ entries, renderActions, ...item }) => {
    const sets = item.systemUserSets;

    if (sets && sets.length > 0) {
      // enrich systemuser set
      const setData = sets.map((set) => {
        const setEntriesPackages: ClientAccessEntry[] = set.accessPackages.map((urn) => {
          const existingEntry = entries.find(
            (e) => e.kind === 'package' && e.accessPackage.urn === urn,
          );
          if (existingEntry) {
            return {
              ...existingEntry,
              canAct: false,
            };
          } else {
            const accessPackage = getAccessPackageByUrn(urn);
            // create fake entry for missing access package. Eller skal disse berikes av backend? Det er et begrenset sett
            return {
              clientId: item.id,
              recipient: {
                id: '',
                name: '',
              },
              roleCode: '',
              accessId: '',
              itemId: `generated-${urn}`,
              kind: 'package',
              accessPackage: accessPackage!, // TODO: handle missing access package gracefully
              canAct: false,
              isMissingRight: true,
            };
          }
        });

        const setEntriesResources: ClientAccessEntry[] = set.resources.map((identifier) => {
          const existingEntry = entries.find(
            (e) => e.kind === 'resource' && e.resource.identifier === identifier,
          );
          if (existingEntry) {
            return {
              ...existingEntry,
              canAct: false,
            };
          } else {
            // create fake entry for missing resource
            return {
              clientId: item.id,
              recipient: {
                id: '',
                name: '',
              },
              roleCode: '',
              accessId: '',
              itemId: `generated-${identifier}`,
              kind: 'resource',
              resource: {
                identifier: identifier,
                name: identifier,
              },
              canAct: false,
              isMissingRight: true,
            };
          }
        });
        const setEntries = [...setEntriesPackages, ...setEntriesResources];

        const isMissingRightFromSet = setEntries.some((p) => !p.recipient.id);
        const item2: { packageId: string; resourceId: string; roleCode: string }[] = setEntries.map(
          (entry) => ({
            packageId: entry.kind === 'package' ? entry.accessPackage?.urn || '' : '',
            resourceId: entry.kind === 'resource' ? entry.resource.identifier : '',
            roleCode: entry.roleCode,
          }),
        );

        return (
          <div
            key={set.name}
            style={{
              marginBottom: '2rem',
              padding: '1rem',
              borderLeft: '4px solid #aaa',
              boxShadow: '0 0 5px 3px #eee',
            }}
          >
            <DsHeading
              level={2}
              data-size='xs'
            >
              {set.name}
            </DsHeading>
            {isMissingRightFromSet ? null : renderActions?.(item2)}
            <ClientAccessSections
              entries={setEntries}
              emptyText={emptyAccessText}
            />
          </div>
        );
      });

      return {
        ...item,
        children: setData,
      };
    }
    return {
      ...item,
      children: (
        <>
          {renderActions?.()}
          <ClientAccessSections
            entries={entries}
            emptyText={emptyAccessText}
          />
        </>
      ),
    };
  });

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
