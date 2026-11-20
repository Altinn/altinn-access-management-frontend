import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@altinn/altinn-components';

import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import type {
  AddAgentAccessPackagesFn,
  AddAgentResourcesFn,
  ClientAccess,
  RemoveAgentAccessPackagesFn,
  RemoveAgentResourcesFn,
} from '@/rtk/features/clientApi';

import {
  getClientBulkItems,
  type ClientBulkItem,
  type ClientBulkItems,
  type HeldAccessByRow,
} from './getClientBulkItems';
import { useClientAccessDelegation, type ClientAccessTarget } from './useClientAccessDelegation';

export type ClientBulkMode = 'add' | 'remove';

export type ClientBulkNames = { clientName: string; agentName: string };

type ActiveRun = { mode: ClientBulkMode } & ClientAccessTarget;

type UseClientBulkDelegationParams = {
  actingPartyUuid?: string;
  heldPackages: HeldAccessByRow;
  heldResources: HeldAccessByRow;
  disabled: boolean;
  addAgentAccessPackages?: AddAgentAccessPackagesFn;
  removeAgentAccessPackages?: RemoveAgentAccessPackagesFn;
  addAgentResources?: AddAgentResourcesFn;
  removeAgentResources?: RemoveAgentResourcesFn;
};

export type ClientBulkDelegation = {
  getItems: (offered: ClientAccess[], rowId: string) => ClientBulkItems;
  disabled: boolean;
  bulkDisabled: boolean;
  isRunning: (target: ClientAccessTarget, mode?: ClientBulkMode) => boolean;
  hasActiveRun: boolean;
  start: (
    mode: ClientBulkMode,
    target: ClientAccessTarget,
    names: ClientBulkNames,
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

const countAccesses = (items: ClientBulkItem[]) =>
  new Set(items.map((item) => `${item.kind}:${item.id}`)).size;

export const useClientBulkDelegation = ({
  actingPartyUuid,
  heldPackages,
  heldResources,
  disabled,
  addAgentAccessPackages,
  removeAgentAccessPackages,
  addAgentResources,
  removeAgentResources,
}: UseClientBulkDelegationParams): ClientBulkDelegation => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const {
    getAccessPackageByUrn,
    isFetching: isFetchingAccessPackages,
    error: accessPackagesError,
  } = useAccessPackageLookup();
  const { delegate, revoke } = useClientAccessDelegation({
    actingPartyUuid,
    addAgentAccessPackages,
    removeAgentAccessPackages,
    addAgentResources,
    removeAgentResources,
  });
  const [activeRun, setActiveRun] = useState<ActiveRun | null>(null);

  const getItems = useCallback(
    (offered: ClientAccess[], rowId: string) =>
      getClientBulkItems({
        offered,
        heldPackages: heldPackages.get(rowId) ?? [],
        heldResources: heldResources.get(rowId) ?? [],
        getAccessPackageByUrn,
      }),
    [getAccessPackageByUrn, heldPackages, heldResources],
  );

  const isRunning = useCallback(
    ({ clientId, agentId }: ClientAccessTarget, mode?: ClientBulkMode) =>
      !!activeRun &&
      activeRun.clientId === clientId &&
      activeRun.agentId === agentId &&
      (!mode || activeRun.mode === mode),
    [activeRun],
  );

  const start = useCallback(
    async (
      mode: ClientBulkMode,
      target: ClientAccessTarget,
      { clientName, agentName }: ClientBulkNames,
      items: ClientBulkItem[],
    ) => {
      if (activeRun || items.length === 0) return;

      setActiveRun({ mode, ...target });
      const action = mode === 'add' ? delegate : revoke;
      const { failed, refetched } = await action(target, items).catch(() => ({
        failed: items,
        refetched: Promise.resolve(),
      }));
      await refetched;
      const failedCount = countAccesses(failed);
      setActiveRun(null);

      const messages = MODE_MESSAGES[mode];
      openSnackbar({
        message: t(failedCount > 0 ? messages.error : messages.success, {
          name: agentName,
          clientName,
          failedCount,
          totalCount: countAccesses(items),
        }),
        color: failedCount > 0 ? 'danger' : 'success',
      });
    },
    [activeRun, delegate, openSnackbar, revoke, t],
  );

  return useMemo(
    () => ({
      getItems,
      disabled: disabled || isFetchingAccessPackages,
      bulkDisabled: disabled || isFetchingAccessPackages || !!accessPackagesError,
      isRunning,
      hasActiveRun: !!activeRun,
      start,
    }),
    [
      accessPackagesError,
      activeRun,
      disabled,
      getItems,
      isFetchingAccessPackages,
      isRunning,
      start,
    ],
  );
};
