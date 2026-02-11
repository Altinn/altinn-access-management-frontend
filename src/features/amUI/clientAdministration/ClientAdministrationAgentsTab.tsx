import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

import { AddAgentButton } from '../users/NewUserModal/AddAgentModal';
import { AdvancedUserSearch } from '../common/AdvancedUserSearch/AdvancedUserSearch';
import { useGetAgentsQuery } from '@/rtk/features/clientApi';
import { type Connection } from '@/rtk/features/connectionApi';
import { isNewUser } from '../common/isNewUser';
import classes from './ClientAdministrationAgentsTab.module.css';
import { useNavigate } from 'react-router';

export const ClientAdministrationAgentsTab = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    data: agents,
    isLoading: isAgentsLoading,
    isError: isGetAgentsError,
  } = useGetAgentsQuery();

  const agentConnections = useMemo<Connection[]>(
    () =>
      agents?.map((agent) => ({
        party: {
          ...agent.agent,
          children: null,
          parent: null,
          addedAt: agent.agentAddedAt,
          isDeleted: agent.agent.isDeleted ?? undefined,
          roles: [],
        },
        sortKey: `${isNewUser(agent.agentAddedAt) ? '0' : '1'}:${agent.agent.name}`,
        roles: [],
        connections: [],
      })) ?? [],
    [agents],
  );

  if (isGetAgentsError) {
    return (
      <DsAlert
        role='alert'
        data-color='danger'
      >
        <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
      </DsAlert>
    );
  }

  return (
    <div className={classes.agentTabContainer}>
      <AdvancedUserSearch
        includeSelfAsChild={false}
        includeSelfAsChildOnIndirect={false}
        connections={agentConnections}
        getUserLink={(user) => `/clientadministration/agent/${user.id}`}
        onAddNewUser={(user) => {
          navigate(`/clientadministration/agent/${user.id}`);
        }}
        isLoading={isAgentsLoading}
        AddUserButton={AddAgentButton}
        canDelegate={true}
        noUsersText={t('client_administration_page.no_agents')}
        searchPlaceholder={t('client_administration_page.agent_search_placeholder')}
        directConnectionsHeading={t('client_administration_page.direct_connections_heading')}
        indirectConnectionsHeading={t('client_administration_page.indirect_connections_heading')}
      />
    </div>
  );
};
