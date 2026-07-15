import { useMemo } from 'react';

import type { Agent } from '@/rtk/features/clientApi';

type UseClientDetailsAccessAgentListsParams = {
  clientAccessPackages?: Agent[];
  agents?: Agent[];
};

export const useClientDetailsAccessAgentLists = ({
  clientAccessPackages,
  agents,
}: UseClientDetailsAccessAgentListsParams) => {
  return useMemo(() => {
    const selectableAgents = (agents ?? []).filter(
      (agent) => agent.agent.type.toLowerCase() !== 'systembruker',
    );

    const hasClientAccess = (agent: Agent) =>
      (clientAccessPackages ?? []).some(
        (clientAgent) =>
          clientAgent.agent.id === agent.agent.id &&
          clientAgent.access.some((access) => access.packages.length > 0),
      );

    return {
      agentsWithClientAccess: selectableAgents.filter(hasClientAccess),
      agentsWithoutClientAccess: selectableAgents.filter((agent) => !hasClientAccess(agent)),
    };
  }, [agents, clientAccessPackages]);
};
