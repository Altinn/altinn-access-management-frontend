import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@altinn/altinn-components';

import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import type {
  AddAgentAccessPackagesFn,
  AddAgentResourcesFn,
  Client,
  RemoveAgentAccessPackagesFn,
  RemoveAgentResourcesFn,
} from '@/rtk/features/clientApi';

import {
  getClientBulkItems,
  type ClientBulkItem,
  type ClientBulkItems,
} from './getClientBulkItems';
import { useClientAccessDelegation } from './useClientAccessDelegation';

export type ClientBulkMode = 'add' | 'remove';

type ActiveRun = { mode: ClientBulkMode; clientId: string };

type UseClientBulkDelegationParams = {
  agentName: string;
  agentId?: string;
  actingPartyUuid?: string;
  accessStateClients: Client[];
  resourceAccessClients: Client[];
  disabled: boolean;
  addAgentAccessPackages?: AddAgentAccessPackagesFn;
  removeAgentAccessPackages?: RemoveAgentAccessPackagesFn;
  addAgentResources?: AddAgentResourcesFn;
  removeAgentResources?: RemoveAgentResourcesFn;
};

export type ClientBulkDelegation = {
  getClientItems: (client: Client) => ClientBulkItems;
  disabled: boolean;
  activeRun: ActiveRun | null;
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
  agentId,
  actingPartyUuid,
  accessStateClients,
  resourceAccessClients,
  disabled,
  addAgentAccessPackages,
  removeAgentAccessPackages,
  addAgentResources,
  removeAgentResources,
}: UseClientBulkDelegationParams): ClientBulkDelegation => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { getAccessPackageById, isFetching: isFetchingAccessPackages } = useAccessPackageLookup();
  const { delegate, revoke } = useClientAccessDelegation({
    actingPartyUuid,
    addAgentAccessPackages,
    removeAgentAccessPackages,
    addAgentResources,
    removeAgentResources,
  });
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

  const start = useCallback(
    async (mode: ClientBulkMode, clientId: string, clientName: string, items: ClientBulkItem[]) => {
      if (activeRun || items.length === 0) return;

      setActiveRun({ mode, clientId });
      const action = mode === 'add' ? delegate : revoke;
      const { failed } = await action({ clientId, agentId }, items).catch(() => ({
        failed: items,
      }));
      const failedCount = failed.length;
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
    [activeRun, agentId, agentName, delegate, openSnackbar, revoke, t],
  );

  return useMemo(
    () => ({
      getClientItems,
      // A fetching lookup resolves no packages, so a run would silently skip all of them.
      disabled: disabled || isFetchingAccessPackages,
      activeRun,
      start,
    }),
    [activeRun, disabled, getClientItems, isFetchingAccessPackages, start],
  );
};
