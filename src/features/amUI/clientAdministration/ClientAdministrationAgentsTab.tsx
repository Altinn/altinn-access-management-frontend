import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph, SnackbarDuration, useSnackbar } from '@altinn/altinn-components';

import { AddAgentButton } from '../users/NewUserModal/AddAgentModal';
import { AdvancedUserSearch } from '../common/AdvancedUserSearch/AdvancedUserSearch';
import { useAddAgentMutation, useGetAgentsQuery, type Agent } from '@/rtk/features/clientApi';
import { useGetRightHoldersQuery, type Connection } from '@/rtk/features/connectionApi';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import classes from './ClientAdministrationAgentsTab.module.css';
import { useNavigate } from 'react-router';

export const ClientAdministrationAgentsTab = () => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { fromParty } = usePartyRepresentation();
  const {
    data: agents,
    isLoading: isAgentsLoading,
    isError: isGetAgentsError,
  } = useGetAgentsQuery();
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

  const handleAddAgent = (userId: string) => {
    addAgent({ to: userId })
      .unwrap()
      .then(() => {
        openSnackbar({
          message: t('client_administration_page.add_agent_success_snackbar'),
          color: 'success',
        });
      })
      .catch(() => {
        openSnackbar({
          message: t('client_administration_page.add_agent_error'),
          color: 'danger',
          duration: SnackbarDuration.infinite,
        });
      });
  };

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
        indirectConnections={filteredIndirectConnections}
        getUserLink={(user) => `/clientadministration/agent/${user.id}`}
        onAddNewUser={(user) => navigate(`/clientadministration/agent/${user.id}`)}
        isLoading={isAgentsLoading || isIndirectLoading}
        isActionLoading={isIndirectFetching}
        AddUserButton={AddAgentButton}
        addUserButtonLabel={t('client_administration_page.add_agent_button_short')}
        onDelegate={(user) => {
          handleAddAgent(user.id);
        }}
        canDelegate={true}
        noUsersText={t('client_administration_page.no_agents')}
        searchPlaceholder={t('client_administration_page.agent_search_placeholder')}
        directConnectionsHeading={t('client_administration_page.direct_connections_heading')}
        indirectConnectionsHeading={t('client_administration_page.indirect_connections_heading')}
      />
    </div>
  );
};
