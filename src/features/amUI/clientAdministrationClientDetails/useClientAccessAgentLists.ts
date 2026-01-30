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
  const agentsWithClientAccess = useMemo(() => {
    if (!agents?.length || !clientAccessPackages?.length) {
      return [];
    }

    return agents.filter((agent) =>
      clientAccessPackages.some(
        (clientAgent) =>
          clientAgent.agent.id === agent.agent.id &&
          clientAgent.access.some((access) => access.packages.length > 0),
      ),
    );
  }, [clientAccessPackages, agents]);

  const allAgents = agents ?? [];

  return { agentsWithClientAccess, allAgents };
};
