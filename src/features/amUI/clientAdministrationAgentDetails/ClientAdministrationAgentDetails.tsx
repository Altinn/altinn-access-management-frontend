import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsButton,
  DsHeading,
  DsParagraph,
  DsSkeleton,
  DsTabs,
  formatDisplayName,
} from '@altinn/altinn-components';
import { useParams } from 'react-router';
import { skipToken } from '@reduxjs/toolkit/query';

import { amUIPath } from '@/routes/paths';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { ClientAdministrationAgentDeleteModal } from './ClientAdministrationAgentDeleteModal';
import { ClientAdministrationAgentClientsList } from './ClientAdministrationAgentClientsList';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { PartyType, useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';
import {
  useAddAgentAccessPackagesMutation,
  useGetAgentAccessPackagesQuery,
  useGetClientsQuery,
} from '@/rtk/features/clientApi';
import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';

export const ClientAdministrationAgentDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { toParty, actingParty } = usePartyRepresentation();
  const [activeTab, setActiveTab] = useState('has-clients');
  const { data: isClientAdmin, isLoading: isLoadingIsClientAdmin } = useGetIsClientAdminQuery();
  const {
    data: agentAccessPackages,
    isLoading: isLoadingAgentAccessPackages,
    isError: isErrorAgentAccessPackages,
  } = useGetAgentAccessPackagesQuery(id ? { to: id } : skipToken);
  const {
    data: clients,
    isLoading: isLoadingClients,
    isError: isErrorClients,
    error: clientsError,
  } = useGetClientsQuery();

  const [addAgentAccessPackages, { isLoading: isAddingAgentAccessPackages }] =
    useAddAgentAccessPackagesMutation();

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

  const backUrl = `/${amUIPath.ClientAdministration}`;
  const userName = formatDisplayName({
    fullName: toParty?.name || '',
    type: toParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
  });
  const toPartyUuid = toParty?.partyUuid;
  const actingPartyUuid = actingParty?.partyUuid;
  const clientsErrorDetails = createErrorDetails(clientsError);

  return (
    <>
      <Breadcrumbs
        items={['root', 'client_administration']}
        lastBreadcrumb={{
          label: userName,
        }}
      />
      <PageContainer
        backUrl={backUrl}
        contentActions={
          <ClientAdministrationAgentDeleteModal
            agentId={id}
            backUrl={backUrl}
          />
        }
      >
        <UserPageHeader
          direction='to'
          displayDirection={false}
          displayRoles={false}
        />

        <DsTabs
          defaultValue='has-clients'
          data-size='sm'
          value={activeTab}
          onChange={setActiveTab}
        >
          <DsTabs.List>
            <DsTabs.Tab value='has-clients'>
              {t('client_administration_page.agent_has_clients_tab')}
            </DsTabs.Tab>
            <DsTabs.Tab value='can-get-clients'>
              {t('client_administration_page.agent_can_get_clients_tab')}
            </DsTabs.Tab>
          </DsTabs.List>
          <DsTabs.Panel value='has-clients'>
            <DsHeading data-size='sm'>
              {t('client_administration_page.delegations_heading')}
            </DsHeading>
            {!isLoadingAgentAccessPackages && isErrorAgentAccessPackages && (
              <DsAlert data-color='danger'>
                <DsParagraph>{t('client_administration_page.load_delegations_error')}</DsParagraph>
              </DsAlert>
            )}
            {!isLoadingAgentAccessPackages &&
              !isErrorAgentAccessPackages &&
              agentAccessPackages &&
              agentAccessPackages.length > 0 && (
                <ul>
                  {agentAccessPackages.map((client) => (
                    <li key={client.client.id}>{client.client.name}</li>
                  ))}
                </ul>
              )}
            {!isLoadingAgentAccessPackages &&
              !isErrorAgentAccessPackages &&
              agentAccessPackages &&
              agentAccessPackages.length === 0 && (
                <DsParagraph>{t('client_administration_page.no_delegations')}</DsParagraph>
              )}
          </DsTabs.Panel>
          <DsTabs.Panel value='can-get-clients'>
            {/* <DsHeading data-size='sm'>
              {t('client_administration_page.clients_tab_title')}
            </DsHeading> */}
            {isLoadingClients && (
              <DsParagraph data-size='sm'>
                <DsSkeleton variant='text' />
              </DsParagraph>
            )}
            {!isLoadingClients && isErrorClients && (
              <DsAlert data-color='danger'>
                <DsParagraph>{t('client_administration_page.error_loading_clients')}</DsParagraph>
                {clientsErrorDetails && (
                  <TechnicalErrorParagraphs
                    size='sm'
                    status={clientsErrorDetails.status}
                    time={clientsErrorDetails.time}
                    traceId={clientsErrorDetails.traceId}
                  />
                )}
              </DsAlert>
            )}
            {!isLoadingClients && !isErrorClients && clients && clients.length === 0 && (
              <DsParagraph>{t('client_administration_page.no_clients')}</DsParagraph>
            )}
            {!isLoadingClients && !isErrorClients && clients && clients.length > 0 && (
              <ClientAdministrationAgentClientsList
                clients={clients}
                isAddingAgentAccessPackages={isAddingAgentAccessPackages}
                toPartyUuid={toPartyUuid}
                actingPartyUuid={actingPartyUuid}
                addAgentAccessPackages={addAgentAccessPackages}
              />
            )}
          </DsTabs.Panel>
        </DsTabs>
      </PageContainer>
    </>
  );
};
