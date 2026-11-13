import { createContext, useContext } from 'react';

import type { ClientAccessEntry, RunClientAccessAction } from './clientAccessEntry';

export interface ClientAccessContextValue {
  runAction: RunClientAccessAction;
  /** Resolved live from the unfiltered access state, so it stays correct after a mutation. */
  hasAccess: (entry: ClientAccessEntry) => boolean;
  /** False where the list only lets you remove access (e.g. My clients). */
  canDelegate: boolean;
  addDisabled: boolean;
  removeDisabled: boolean;
  openModal: (entry: ClientAccessEntry) => void;
  /** Moves focus back to the entry's inline action once the list has refetched. */
  requestItemFocus: (entry: ClientAccessEntry) => void;
}

export const ClientAccessContext = createContext<ClientAccessContextValue | null>(null);

export const useClientAccessContext = () => {
  const context = useContext(ClientAccessContext);
  if (!context) {
    throw new Error('useClientAccessContext must be used within ClientAccessRows');
  }
  return context;
};
