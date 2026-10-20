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

// Temporary, until the backend fixes this issue: #4660
// Now repeated roles in one payload or two calls for the same pair fail with Postgres 23505.
// Fix: One call at a time.
const pendingByTarget = new Map<string, Promise<unknown>>();

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

const enqueue = <T>(key: string, task: () => Promise<T>): Promise<T> => {
  const previous = pendingByTarget.get(key) ?? Promise.resolve();
  const result = previous.then(task, task);
  const tail = result.then(
    () => {
      if (pendingByTarget.get(key) === tail) pendingByTarget.delete(key);
    },
    () => {
      if (pendingByTarget.get(key) === tail) pendingByTarget.delete(key);
    },
  );
  pendingByTarget.set(key, tail);
  return result;
};

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

      return enqueue(`${clientId}:${agentId}`, async () => {
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
      });
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
