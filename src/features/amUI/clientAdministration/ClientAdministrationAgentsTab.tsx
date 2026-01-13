import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

import { AddAgentButton } from '../users/NewUserModal/AddAgentModal';
import { AdvancedUserSearch } from '../common/AdvancedUserSearch/AdvancedUserSearch';
import { useAddAgentMutation, useGetAgentsQuery, type Agent } from '@/rtk/features/clientApi';
import { useGetRightHoldersQuery, type Connection } from '@/rtk/features/connectionApi';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

export const ClientAdministrationAgentsTab = () => {
  const { t } = useTranslation();
  const { fromParty } = usePartyRepresentation();
  const { data: agents, isLoading: isAgentsLoading, isError: isAgentsError } = useGetAgentsQuery();
  const [addAgent, { error: addAgentError }] = useAddAgentMutation();
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

  const filteredIndirectConnections = useMemo<Connection[]>(
    () =>
      indirectConnections?.filter((connection) => {
        return connection.party.type === 'Person';
      }) ?? [],
    [indirectConnections],
  );

  const agentConnections = useMemo<Connection[]>(
    () =>
      agents?.map((agent) => ({
        party: {
          ...agent.agent,
          children: null,
          parent: null,
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
    <>
      {addAgentError && (
        <DsAlert
          role='alert'
          data-color='danger'
          data-size='sm'
        >
          <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
        </DsAlert>
      )}
      <AdvancedUserSearch
        includeSelfAsChild={false}
        connections={agentConnections}
        indirectConnections={filteredIndirectConnections}
        isLoading={isAgentsLoading || isIndirectLoading}
        isActionLoading={isIndirectFetching}
        AddUserButton={AddAgentButton}
        onDelegate={(user) => addAgent({ to: user.id })}
        canDelegate={true}
        noUsersText={t('client_administration_page.no_agents')}
        searchPlaceholder={t('client_administration_page.agent_search_placeholder')}
      />
    </>
  );
};
