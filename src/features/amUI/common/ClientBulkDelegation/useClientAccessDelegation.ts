import { useCallback } from 'react';

import { getActionError, type ActionError } from '@/resources/hooks/useActionError';
import type {
  AddAgentAccessPackagesFn,
  AddAgentResourcesFn,
  RemoveAgentAccessPackagesFn,
  RemoveAgentResourcesFn,
} from '@/rtk/features/clientApi';

import type { ClientBulkItem } from './getClientBulkItems';

export type ClientAccessTarget = { clientId?: string; agentId?: string };

export type ClientAccessOutcome = {
  failed: ClientBulkItem[];
  error?: ActionError;
};

type UseClientAccessDelegationParams = {
  actingPartyUuid?: string;
  addAgentAccessPackages?: AddAgentAccessPackagesFn;
  removeAgentAccessPackages?: RemoveAgentAccessPackagesFn;
  addAgentResources?: AddAgentResourcesFn;
  removeAgentResources?: RemoveAgentResourcesFn;
};

const groupIdsByRole = (items: ClientBulkItem[]) =>
  items.reduce<{ role: string; ids: string[] }[]>((groups, { roleCode, id }) => {
    const group = groups.find((g) => g.role === roleCode);
    if (group) {
      group.ids.push(id);
    } else {
      groups.push({ role: roleCode, ids: [id] });
    }
    return groups;
  }, []);

// One request per kind, whether the caller delegates a single access or every access a client
// offers. Packages go before resources, and never at the same time: both endpoints create the
// delegation row, concurrent calls race on it, and the loser fails with a duplicate key. This can
// go parallel once the backend makes that creation idempotent.
export const useClientAccessDelegation = ({
  actingPartyUuid,
  addAgentAccessPackages,
  removeAgentAccessPackages,
  addAgentResources,
  removeAgentResources,
}: UseClientAccessDelegationParams) => {
  const run = useCallback(
    async (
      { clientId, agentId }: ClientAccessTarget,
      items: ClientBulkItem[],
      packagesFn?: AddAgentAccessPackagesFn | RemoveAgentAccessPackagesFn,
      resourcesFn?: AddAgentResourcesFn | RemoveAgentResourcesFn,
    ): Promise<ClientAccessOutcome> => {
      if (!clientId || !agentId || !actingPartyUuid) return { failed: items };

      const args = { from: clientId, to: agentId, party: actingPartyUuid };
      const packages = items.filter((item) => item.kind === 'package');
      const resources = items.filter((item) => item.kind === 'resource');
      const calls = [
        {
          items: packages,
          call:
            packagesFn &&
            (() =>
              packagesFn({
                ...args,
                payload: {
                  values: groupIdsByRole(packages).map(({ role, ids }) => ({
                    role,
                    packages: ids,
                  })),
                },
              }).unwrap()),
        },
        {
          items: resources,
          call:
            resourcesFn &&
            (() =>
              resourcesFn({
                ...args,
                payload: {
                  values: groupIdsByRole(resources).map(({ role, ids }) => ({
                    role,
                    resources: ids,
                  })),
                },
              }).unwrap()),
        },
      ];

      const failed: ClientBulkItem[] = [];
      let error: ActionError | undefined;
      for (const { items: callItems, call } of calls) {
        if (callItems.length === 0) continue;
        if (!call) {
          failed.push(...callItems);
          continue;
        }
        try {
          await call();
        } catch (caught) {
          failed.push(...callItems);
          error ??= getActionError(caught);
        }
      }
      return { failed, error };
    },
    [actingPartyUuid],
  );

  const delegate = useCallback(
    (target: ClientAccessTarget, items: ClientBulkItem[]) =>
      run(target, items, addAgentAccessPackages, addAgentResources),
    [addAgentAccessPackages, addAgentResources, run],
  );

  const revoke = useCallback(
    (target: ClientAccessTarget, items: ClientBulkItem[]) =>
      run(target, items, removeAgentAccessPackages, removeAgentResources),
    [removeAgentAccessPackages, removeAgentResources, run],
  );

  return { delegate, revoke };
};
