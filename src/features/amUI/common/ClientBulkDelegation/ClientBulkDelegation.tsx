import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@altinn/altinn-components';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Client } from '@/rtk/features/clientApi';

import {
  getClientBulkItems,
  type ClientBulkItem,
  type ClientBulkItems,
} from './getClientBulkItems';

export type ClientBulkMode = 'add' | 'remove';

// Resolves to the number of items that failed.
type ClientBulkItemsHandler = (clientId: string, items: ClientBulkItem[]) => Promise<number>;

type ActiveRun = { mode: ClientBulkMode; clientId: string; accessIds: ReadonlySet<string> };

type ClientBulkDelegationContextValue = {
  getClientItems: (client: Client) => ClientBulkItems;
  disabled: boolean;
  activeRun: ActiveRun | null;
  isAccessPending: (clientId: string, accessId: string) => boolean;
  start: (
    mode: ClientBulkMode,
    clientId: string,
    clientName: string,
    items: ClientBulkItem[],
  ) => Promise<void>;
};

const ClientBulkDelegationContext = createContext<ClientBulkDelegationContextValue | undefined>(
  undefined,
);

export const useClientBulkDelegation = () => useContext(ClientBulkDelegationContext);

type ClientBulkDelegationProviderProps = {
  children: React.ReactNode;
  agentName: string;
  accessStateClients: Client[];
  resourceAccessClients: Client[];
  getAccessPackageById: (packageId?: string | null) => AccessPackage | undefined;
  disabled: boolean;
  onDelegateItems: ClientBulkItemsHandler;
  onRevokeItems: ClientBulkItemsHandler;
};

const MODE_MESSAGES = {
  add: {
    success: 'client_administration_page.delegate_all_success_snackbar',
    error: 'client_administration_page.delegate_all_error',
  },
  remove: {
    success: 'client_administration_page.remove_all_success_snackbar',
    error: 'client_administration_page.remove_all_error',
  },
} as const;

// Lives above both client sections, so pending state follows a client that moves between them.
export const ClientBulkDelegationProvider = ({
  children,
  agentName,
  accessStateClients,
  resourceAccessClients,
  getAccessPackageById,
  disabled,
  onDelegateItems,
  onRevokeItems,
}: ClientBulkDelegationProviderProps) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const [activeRun, setActiveRun] = useState<ActiveRun | null>(null);

  const getClientItems = useCallback(
    (client: Client) =>
      getClientBulkItems({
        client,
        accessStateClients,
        resourceAccessClients,
        getAccessPackageById,
      }),
    [accessStateClients, getAccessPackageById, resourceAccessClients],
  );

  const isAccessPending = useCallback(
    (clientId: string, accessId: string) =>
      activeRun?.clientId === clientId && activeRun.accessIds.has(accessId),
    [activeRun],
  );

  const start = useCallback(
    async (mode: ClientBulkMode, clientId: string, clientName: string, items: ClientBulkItem[]) => {
      if (activeRun || items.length === 0) return;

      setActiveRun({ mode, clientId, accessIds: new Set(items.map((item) => item.id)) });
      const handler = mode === 'add' ? onDelegateItems : onRevokeItems;
      const failedCount = await handler(clientId, items).catch(() => items.length);
      setActiveRun(null);

      const messages = MODE_MESSAGES[mode];
      openSnackbar({
        message: t(failedCount > 0 ? messages.error : messages.success, {
          name: agentName,
          clientName,
          failedCount,
          totalCount: items.length,
        }),
        color: failedCount > 0 ? 'danger' : 'success',
      });
    },
    [activeRun, agentName, onDelegateItems, onRevokeItems, openSnackbar, t],
  );

  const value = useMemo(
    () => ({
      getClientItems,
      disabled,
      activeRun,
      isAccessPending,
      start,
    }),
    [activeRun, disabled, getClientItems, isAccessPending, start],
  );

  return (
    <ClientBulkDelegationContext.Provider value={value}>
      {children}
    </ClientBulkDelegationContext.Provider>
  );
};
