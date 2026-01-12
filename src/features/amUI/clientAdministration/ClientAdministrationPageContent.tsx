import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { DsAlert, DsHeading, DsParagraph, DsSkeleton, DsTabs } from '@altinn/altinn-components';

import { clientAdministrationPageEnabled } from '@/resources/utils/featureFlagUtils';
import { useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';
import { AddAgentButton } from '../users/NewUserModal/AddAgentModal';
import { AdvancedUserSearch } from '../common/AdvancedUserSearch/AdvancedUserSearch';
import {
  useAddAgentMutation,
  useGetAgentsQuery,
  useGetClientsQuery,
} from '@/rtk/features/clientApi';
import { useGetRightHoldersQuery, type Connection } from '@/rtk/features/connectionApi';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

export const ClientAdministrationPageContent = () => {
  const { t } = useTranslation();
  const pageIsEnabled = clientAdministrationPageEnabled();
  const [activeTab, setActiveTab] = useState('users');
  const { fromParty } = usePartyRepresentation();
  const { data: agents, isLoading: isAgentsLoading, isError: isAgentsError } = useGetAgentsQuery();
  const [addAgent, { isLoading: isAddingAgent, error: addAgentError }] = useAddAgentMutation();
  const {
    data: clients,
    isLoading: isClientsLoading,
    isError: isClientsError,
  } = useGetClientsQuery();
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
  const { data: isClientAdmin, isLoading: isLoadingIsClientAdmin } = useGetIsClientAdminQuery();
  const agentConnections = useMemo<Connection[]>(
    () =>
      agents?.map((agent) => ({
        party: {
          ...agent.client,
          children: null,
          roles: [],
        },
        roles: [],
        connections: [],
      })) ?? [],
    [agents],
  );
  const clientConnections = useMemo<Connection[]>(
    () =>
      clients?.map((client) => ({
        party: {
          ...client.client,
          children: null,
          roles: [],
        },
        roles: [],
        connections: [],
      })) ?? [],
    [clients],
  );

  if (!pageIsEnabled) {
    return (
      <Navigate
        to='/not-found'
        replace
      />
    );
  }

  if (isLoadingIsClientAdmin) {
    return (
      <>
        <DsHeading data-size='lg'>
          <DsSkeleton variant='text'>{t('client_administration_page.page_heading')}</DsSkeleton>
        </DsHeading>
        <DsParagraph data-size='lg'>
          <DsSkeleton
            variant='text'
            width={40}
          />
        </DsParagraph>
      </>
    );
  }

  if (isClientAdmin === false) {
    return (
      <DsAlert data-color='warning'>{t('client_administration_page.no_access_title')}</DsAlert>
    );
  }

  return (
    <>
      <DsHeading data-size='lg'>{t('client_administration_page.page_heading')}</DsHeading>
      <DsTabs
        defaultValue='users'
        data-size='sm'
        value={activeTab}
        onChange={setActiveTab}
      >
        <DsTabs.List>
          <DsTabs.Tab value='users'>{t('client_administration_page.agents_tab_title')}</DsTabs.Tab>
          <DsTabs.Tab value='clients'>
            {t('client_administration_page.clients_tab_title')}
          </DsTabs.Tab>
        </DsTabs.List>
        <DsTabs.Panel value='users'>
          {isAgentsError ? (
            <DsAlert
              role='alert'
              data-color='danger'
            >
              <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
            </DsAlert>
          ) : (
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
          )}
        </DsTabs.Panel>
        <DsTabs.Panel value='clients'>
          {isClientsError ? (
            <DsAlert
              role='alert'
              data-color='danger'
            >
              <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
            </DsAlert>
          ) : (
            <AdvancedUserSearch
              includeSelfAsChild={false}
              connections={clientConnections}
              // indirectConnections={indirectConnections}
              isLoading={isClientsLoading || isIndirectLoading}
              // isActionLoading={isIndirectFetching}
              canDelegate={false}
              noUsersText={t('client_administration_page.no_clients')}
            />
          )}
        </DsTabs.Panel>
      </DsTabs>
    </>
  );
};
