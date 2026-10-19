import { useCallback } from 'react';

import type {
  AddAgentAccessPackagesFn,
  AddAgentResourcesFn,
  RemoveAgentAccessPackagesFn,
  RemoveAgentResourcesFn,
} from '@/rtk/features/clientApi';

import type { ClientBulkItem } from '../common/ClientBulkDelegation/getClientBulkItems';

type UseAgentDetailsBulkAccessActionsParams = {
  toPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackagesFn;
  removeAgentAccessPackages: RemoveAgentAccessPackagesFn;
  addAgentResources: AddAgentResourcesFn;
  removeAgentResources: RemoveAgentResourcesFn;
};

type BatchArgs = { from: string; to: string; party: string };

type PackagesFn = (
  args: BatchArgs & { payload: { values: { role: string; packages: string[] }[] } },
) => { unwrap: () => Promise<unknown> };

type ResourcesFn = (
  args: BatchArgs & { payload: { values: { role: string; resources: string[] }[] } },
) => { unwrap: () => Promise<unknown> };

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

// Sequential on purpose: the two endpoints both create the delegation row, and concurrent calls
// race on it, so the loser fails with a duplicate key. Can go back to Promise.allSettled once
// the backend makes that creation idempotent.
const countFailed = async (calls: { count: number; call: () => Promise<unknown> }[]) => {
  let failed = 0;
  for (const { count, call } of calls) {
    if (count === 0) continue;
    try {
      await call();
    } catch {
      failed += count;
    }
  }
  return failed;
};

export const useAgentDetailsBulkAccessActions = ({
  toPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
  removeAgentAccessPackages,
  addAgentResources,
  removeAgentResources,
}: UseAgentDetailsBulkAccessActionsParams) => {
  const runItems = useCallback(
    async (
      packagesFn: PackagesFn,
      resourcesFn: ResourcesFn,
      clientId: string,
      items: ClientBulkItem[],
    ) => {
      if (!toPartyUuid || !actingPartyUuid) return items.length;

      const args = { from: clientId, to: toPartyUuid, party: actingPartyUuid };
      const packages = items.filter((item) => item.kind === 'package');
      const resources = items.filter((item) => item.kind === 'resource');
      return countFailed([
        {
          count: packages.length,
          call: () =>
            packagesFn({
              ...args,
              payload: {
                values: groupIdsByRole(packages).map(({ role, ids }) => ({ role, packages: ids })),
              },
            }).unwrap(),
        },
        {
          count: resources.length,
          call: () =>
            resourcesFn({
              ...args,
              payload: {
                values: groupIdsByRole(resources).map(({ role, ids }) => ({
                  role,
                  resources: ids,
                })),
              },
            }).unwrap(),
        },
      ]);
    },
    [actingPartyUuid, toPartyUuid],
  );

  const delegateItems = useCallback(
    (clientId: string, items: ClientBulkItem[]) =>
      runItems(addAgentAccessPackages, addAgentResources, clientId, items),
    [addAgentAccessPackages, addAgentResources, runItems],
  );

  const revokeItems = useCallback(
    (clientId: string, items: ClientBulkItem[]) =>
      runItems(removeAgentAccessPackages, removeAgentResources, clientId, items),
    [removeAgentAccessPackages, removeAgentResources, runItems],
  );

  return { delegateItems, revokeItems };
};
