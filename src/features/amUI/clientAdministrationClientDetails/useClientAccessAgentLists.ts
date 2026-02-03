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
    const allAgents = (agents ?? []).filter(
      (agent) => agent.agent.type.toLowerCase() !== 'systembruker',
    );

    const agentsWithClientAccess = clientAccessPackages?.length
      ? allAgents.filter((agent) =>
          clientAccessPackages.some(
            (clientAgent) =>
              clientAgent.agent.id === agent.agent.id &&
              clientAgent.access.some((access) => access.packages.length > 0),
          ),
        )
      : [];

    return { agentsWithClientAccess, allAgents };
  }, [agents, clientAccessPackages]);
};
