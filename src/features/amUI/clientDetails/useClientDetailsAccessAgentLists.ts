import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { PartyType } from '@/dataObjects/dtos/Party';
import type { Agent } from '@/rtk/features/clientApi';

import { isNewUser } from '../common/isNewUser';
import { countAgentSearchHits } from '../common/ClientAgentPackageList/ClientAgentPackageList';

type UseClientDetailsAccessAgentListsParams = {
  clientAccessPackages?: Agent[];
  clientResources?: Agent[];
  agents?: Agent[];
  searchString?: string;
};

export const useClientDetailsAccessAgentLists = ({
  clientAccessPackages,
  clientResources,
  agents,
  searchString,
}: UseClientDetailsAccessAgentListsParams) => {
  const { t } = useTranslation();

  const lists = useMemo(() => {
    const selectableAgents = (agents ?? []).filter(
      (agent) => agent.agent.type !== PartyType.SystemUser,
    );

    const hasClientAccess = (agent: Agent) =>
      (clientAccessPackages ?? []).some(
        (clientAgent) =>
          clientAgent.agent.id === agent.agent.id &&
          clientAgent.access.some((access) => access.packages.length > 0),
      ) ||
      (clientResources ?? []).some(
        (clientAgent) =>
          clientAgent.agent.id === agent.agent.id &&
          clientAgent.access.some((access) => (access.resources ?? []).length > 0),
      );

    return {
      recentlyAddedClients: selectableAgents.filter((agent) => isNewUser(agent.agentAddedAt)),
      agentsWithClientAccess: selectableAgents.filter(hasClientAccess),
      agentsWithoutClientAccess: selectableAgents.filter((agent) => !hasClientAccess(agent)),
    };
  }, [agents, clientAccessPackages, clientResources]);

  // The recently added section is only rendered when it has agents.
  const searchHits = searchString
    ? [
        ...(lists.recentlyAddedClients.length > 0
          ? [
              {
                count: countAgentSearchHits(lists.recentlyAddedClients, searchString),
                listHeading: t('client_administration_page.recently_added_users'),
              },
            ]
          : []),
        {
          count: countAgentSearchHits(lists.agentsWithClientAccess, searchString),
          listHeading: t('client_administration_page.client_has_agents_tab'),
        },
        {
          count: countAgentSearchHits(lists.agentsWithoutClientAccess, searchString),
          listHeading: t('client_administration_page.client_can_get_agents_tab'),
        },
      ]
    : undefined;

  return { ...lists, searchHits };
};
