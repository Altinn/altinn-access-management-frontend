import { useMemo } from 'react';

import type { Client } from '@/rtk/features/clientApi';

type UseAgentDetailsAccessClientListsParams = {
  agentAccessPackages?: Client[];
  clients?: Client[];
};

export const useAgentDetailsAccessClientLists = ({
  agentAccessPackages,
  clients,
}: UseAgentDetailsAccessClientListsParams) => {
  return useMemo(() => {
    const clientIdsWithAgentAccess = new Set(
      (agentAccessPackages ?? [])
        .filter((client) => client.access.some((access) => access.packages.length > 0))
        .map((client) => client.client.id),
    );

    const hasAgentAccess = (client: Client) => clientIdsWithAgentAccess.has(client.client.id);

    return {
      clientsWithAgentAccess: (clients ?? []).filter(hasAgentAccess),
      clientsWithoutAgentAccess: (clients ?? []).filter((client) => !hasAgentAccess(client)),
    };
  }, [agentAccessPackages, clients]);
};
