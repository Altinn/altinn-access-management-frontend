import { useMemo } from 'react';

import type { Client } from '@/rtk/features/clientApi';

type UseAgentDetailsAccessClientListsParams = {
  agentAccessPackages?: Client[];
  agentResources?: Client[];
  clients?: Client[];
};

export const useAgentDetailsAccessClientLists = ({
  agentAccessPackages,
  agentResources,
  clients,
}: UseAgentDetailsAccessClientListsParams) => {
  return useMemo(() => {
    const clientIdsWithAgentAccess = new Set([
      ...(agentAccessPackages ?? [])
        .filter((client) => client.access.some((access) => access.packages.length > 0))
        .map((client) => client.client.id),
      ...(agentResources ?? [])
        .filter((client) => client.access.some((access) => (access.resources ?? []).length > 0))
        .map((client) => client.client.id),
    ]);

    const hasAgentAccess = (client: Client) => clientIdsWithAgentAccess.has(client.client.id);

    return {
      clientsWithAgentAccess: (clients ?? []).filter(hasAgentAccess),
      clientsWithoutAgentAccess: (clients ?? []).filter((client) => !hasAgentAccess(client)),
    };
  }, [agentAccessPackages, agentResources, clients]);
};
