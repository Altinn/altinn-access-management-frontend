import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@altinn/altinn-components';

import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
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

type UseClientBulkDelegationParams = {
  agentName: string;
  accessStateClients: Client[];
  resourceAccessClients: Client[];
  disabled: boolean;
  onDelegateItems: ClientBulkItemsHandler;
  onRevokeItems: ClientBulkItemsHandler;
};

export type ClientBulkDelegation = {
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

// Call this above both client sections, so pending state follows a client moving between them.
export const useClientBulkDelegation = ({
  agentName,
  accessStateClients,
  resourceAccessClients,
  disabled,
  onDelegateItems,
  onRevokeItems,
}: UseClientBulkDelegationParams): ClientBulkDelegation => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { getAccessPackageById, isFetching: isFetchingAccessPackages } = useAccessPackageLookup();
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

  return useMemo(
    () => ({
      getClientItems,
      // A fetching lookup resolves no packages, so a run would silently skip all of them.
      disabled: disabled || isFetchingAccessPackages,
      activeRun,
      isAccessPending,
      start,
    }),
    [activeRun, disabled, getClientItems, isAccessPending, isFetchingAccessPackages, start],
  );
};
