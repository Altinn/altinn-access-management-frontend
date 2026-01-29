import { useMemo } from 'react';

import type { Agent } from '@/rtk/features/clientApi';

type UseClientAccessAgentListsParams = {
  clientAccessPackages?: Agent[];
  agents?: Agent[];
};

export const useClientAccessAgentLists = ({
  clientAccessPackages,
  agents,
}: UseClientAccessAgentListsParams) => {
  return useMemo(() => {
    const agentsWithAccessIds = new Set(
      (clientAccessPackages ?? [])
        .filter((agent) => agent.access.some((access) => access.packages.length > 0))
        .map((agent) => agent.agent.id),
    );

    const agentsWithClientAccess =
      agents?.filter((agent) => agentsWithAccessIds.has(agent.agent.id)) ?? [];
    const allAgents = agents ?? [];

    return { agentsWithClientAccess, allAgents };
  }, [clientAccessPackages, agents]);
};
