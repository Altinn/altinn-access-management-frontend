import { useMemo } from 'react';

import type { Client } from '@/rtk/features/clientApi';

type UseAgentAccessClientListsParams = {
  agentAccessPackages?: Client[];
  clients?: Client[];
};

export const useAgentAccessClientLists = ({
  agentAccessPackages,
  clients,
}: UseAgentAccessClientListsParams) => {
  return useMemo(() => {
    const agentAccessClientIds = new Set(
      (agentAccessPackages ?? [])
        .filter((client) => client.access.some((access) => access.packages.length > 0))
        .map((client) => client.client.id),
    );

    const clientsWithAgentAccess =
      clients?.filter((client) => agentAccessClientIds.has(client.client.id)) ?? [];
    const allClients = clients ?? [];

    return { clientsWithAgentAccess, allClients };
  }, [agentAccessPackages, clients]);
};
