import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Client } from '@/rtk/features/clientApi';

import { countClientSearchHits } from '../common/ClientAccessList/ClientAccessList';

type UseAgentDetailsAccessClientListsParams = {
  agentAccessPackages?: Client[];
  agentResources?: Client[];
  clients?: Client[];
  searchString?: string;
};

export const useAgentDetailsAccessClientLists = ({
  agentAccessPackages,
  agentResources,
  clients,
  searchString,
}: UseAgentDetailsAccessClientListsParams) => {
  const { t } = useTranslation();

  const lists = useMemo(() => {
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

  const searchHits = searchString
    ? [
        {
          count: countClientSearchHits(lists.clientsWithAgentAccess, searchString),
          list: t('client_administration_page.agent_has_clients_tab'),
        },
        {
          count: countClientSearchHits(lists.clientsWithoutAgentAccess, searchString),
          list: t('client_administration_page.agent_can_get_clients_tab'),
        },
      ]
    : undefined;

  return { ...lists, searchHits };
};
