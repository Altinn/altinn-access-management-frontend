import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph, useSnackbar } from '@altinn/altinn-components';

import { AddAgentButton } from '../users/NewUserModal/AddAgentModal';
import { UserSearch } from '../common/UserSearch/UserSearch';
import { useAddAgentMutation, useGetAgentsQuery } from '@/rtk/features/clientApi';
import { useGetRightHoldersQuery } from '@/rtk/features/connectionApi';
import classes from './ClientAdministrationAgentsTab.module.css';
import { useNavigate } from 'react-router';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { mapConnectionsToUserSearchNodes } from '../common/UserSearch/connectionMapper';

type ClientAdministrationAgentsTabProps = {
  isActive: boolean;
};

export const ClientAdministrationAgentsTab = ({ isActive }: ClientAdministrationAgentsTabProps) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const {
    data: agents,
    isLoading: isAgentsLoading,
    isError: isGetAgentsError,
  } = useGetAgentsQuery(undefined, { skip: !isActive });
  const [addAgent, { isLoading: isAdding }] = useAddAgentMutation();
  const { fromParty } = usePartyRepresentation();

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
    { skip: !isActive || !fromParty?.partyUuid },
  );

  const users = useMemo(
    () =>
      mapConnectionsToUserSearchNodes(
        agents?.map((agent) => ({
          party: {
            ...agent.agent,
            children: null,
            parent: null,
            addedAt: agent.agentAddedAt,
            isDeleted: agent.agent.isDeleted ?? undefined,
            roles: [],
          },
          roles: [],
          connections: [],
        })) ?? [],
      ),
    [agents],
  );
  const indirectUsers = useMemo(
    () =>
      mapConnectionsToUserSearchNodes(
        indirectConnections?.filter((connection) => {
          return connection.party.type === 'Person';
        }) ?? [],
      ),
    [indirectConnections],
  );

  const handleAddAgent = (userId: string) => {
    void addAgent({ to: userId })
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
      <UserSearch
        includeSelfAsChild={false}
        includeSelfAsChildOnIndirect={false}
        users={users}
        indirectUsers={indirectUsers}
        getUserLink={(user) => `/clientadministration/agent/${user.id}`}
        onAddNewUser={(user) => navigate(`/clientadministration/agent/${user.id}`)}
        isLoading={isAgentsLoading || isIndirectLoading}
        isActionLoading={isIndirectFetching || isAdding}
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
        titleAs='h2'
      />
    </div>
  );
};
