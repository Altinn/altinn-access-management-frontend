import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

import { AddAgentButton } from '../users/NewUserModal/AddAgentModal';
import { AdvancedUserSearch } from '../common/AdvancedUserSearch/AdvancedUserSearch';
import { useAddAgentMutation, useGetAgentsQuery, type Agent } from '@/rtk/features/clientApi';
import { useGetRightHoldersQuery, type Connection } from '@/rtk/features/connectionApi';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

type AgentEntity = Agent['agent'];

const stripParentAndChildren = (entity: AgentEntity): Omit<AgentEntity, 'parent' | 'children'> => {
  const { parent, children, ...rest } = entity;
  return rest;
};

export const ClientAdministrationAgentsTab = () => {
  const { t } = useTranslation();
  const { fromParty } = usePartyRepresentation();
  const { data: agents, isLoading: isAgentsLoading, isError: isAgentsError } = useGetAgentsQuery();
  const [addAgent] = useAddAgentMutation();
  const {
    data: indirectConnections,
    isLoading: isIndirectLoading,
    isFetching: isIndirectFetching,
  } = useGetRightHoldersQuery(
    {
      partyUuid: fromParty?.partyUuid ?? '',
      fromUuid: fromParty?.partyUuid ?? '',
      toUuid: '',
    },
    { skip: !fromParty?.partyUuid },
  );

  const agentConnections = useMemo<Connection[]>(
    () =>
      agents?.map((agent) => ({
        party: {
          ...stripParentAndChildren(agent.agent),
          children: null,
          roles: [],
        },
        roles: [],
        connections: [],
      })) ?? [],
    [agents],
  );

  if (isAgentsError) {
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
    <AdvancedUserSearch
      includeSelfAsChild={false}
      connections={agentConnections}
      indirectConnections={indirectConnections}
      isLoading={isAgentsLoading || isIndirectLoading}
      isActionLoading={isIndirectFetching}
      AddUserButton={AddAgentButton}
      onDelegate={(user) => addAgent({ to: user.id })}
      canDelegate={true}
      noUsersText={t('client_administration_page.no_agents')}
    />
  );
};
