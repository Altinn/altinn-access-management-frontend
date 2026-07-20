import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsHeading,
  DsParagraph,
  DsSkeleton,
  formatDisplayName,
} from '@altinn/altinn-components';
import { useParams } from 'react-router';
import { skipToken } from '@reduxjs/toolkit/query';

import { amUIPath } from '@/routes/paths';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { AgentDetailsClientsList } from './AgentDetailsClientsList';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { PartyType, useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';
import {
  useAddAgentAccessPackagesMutation,
  useRemoveAgentAccessPackagesMutation,
  useGetAgentAccessPackagesQuery,
  useGetClientsQuery,
} from '@/rtk/features/clientApi';
import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';
import { useAgentDetailsAccessClientLists } from './useAgentDetailsAccessClientLists';
import { UserPageHeaderSkeleton } from '../common/UserPageHeader/UserPageHeaderSkeleton';
import { AgentDetailsDeleteModal } from './AgentDetailsDeleteModal';
import { ClientAdminSearchField } from '../common/ClientAdminSearchField/ClientAdminSearchField';
import { ClientAdminDetails } from '../common/ClientAdminDetails/ClientAdminDetails';

export const AgentDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { toParty, actingParty } = usePartyRepresentation();
  const { data: isClientAdmin, isLoading: isLoadingIsClientAdmin } = useGetIsClientAdminQuery();
  const {
    data: agentAccessPackages,
    isLoading: isLoadingAgentAccessPackages,
    error: agentAccessPackagesError,
  } = useGetAgentAccessPackagesQuery(id ? { to: id } : skipToken);
  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useGetClientsQuery();

  const [addAgentAccessPackages, { isLoading: isAddingAgentAccessPackages }] =
    useAddAgentAccessPackagesMutation();
  const [removeAgentAccessPackages, { isLoading: isRemovingAgentAccessPackages }] =
    useRemoveAgentAccessPackagesMutation();

  const { clientsWithAgentAccess, clientsWithoutAgentAccess } = useAgentDetailsAccessClientLists({
    agentAccessPackages,
    clients,
  });
  const [searchString, setSearchString] = useState<string>('');

  const backUrl = `/${amUIPath.ClientAdministration}#users`;
  const userName = formatDisplayName({
    fullName: toParty?.name || '',
    type: toParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
  });
  const toPartyUuid = toParty?.partyUuid;
  const actingPartyUuid = actingParty?.partyUuid;

  if (isClientAdmin === false) {
    return (
      <DsAlert data-color='warning'>{t('client_administration_page.no_access_title')}</DsAlert>
    );
  }

  if (agentAccessPackagesError || clientsError) {
    const agentAccessPackagesErrorDetails = createErrorDetails(agentAccessPackagesError);
    const clientsErrorDetails = createErrorDetails(clientsError);
    return (
      <>
        {!!agentAccessPackagesErrorDetails && (
          <DsAlert data-color='danger'>
            <DsParagraph>{t('client_administration_page.load_delegations_error')}</DsParagraph>
            <TechnicalErrorParagraphs
              status={agentAccessPackagesErrorDetails.status}
              time={agentAccessPackagesErrorDetails.time}
              traceId={agentAccessPackagesErrorDetails.traceId}
            />
          </DsAlert>
        )}
        {!!clientsErrorDetails && (
          <DsAlert data-color='danger'>
            <DsParagraph>{t('client_administration_page.error_loading_clients')}</DsParagraph>
            <TechnicalErrorParagraphs
              status={clientsErrorDetails.status}
              time={clientsErrorDetails.time}
              traceId={clientsErrorDetails.traceId}
            />
          </DsAlert>
        )}
      </>
    );
  }

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
          <AgentDetailsDeleteModal
            agentId={id}
            backUrl={backUrl}
          />
        }
      >
        {isLoadingIsClientAdmin || isLoadingAgentAccessPackages || isLoadingClients ? (
          <>
            <UserPageHeaderSkeleton />
            <DsSkeleton
              width='100%'
              height='200px'
              variant='rectangle'
              style={{ marginTop: '1.5rem' }}
            />
          </>
        ) : (
          <>
            <UserPageHeader
              direction='to'
              displayDirection={false}
              displayRoles={false}
            />
            <ClientAdminSearchField
              setSearchString={setSearchString}
              searchPlaceholder={t('my_clients_page.search_placeholder')}
            />
            <DsHeading
              data-size='xs'
              level={2}
            >
              {t('client_administration_page.agent_has_clients_tab')}
            </DsHeading>
            {clientsWithAgentAccess.length > 0 ? (
              <AgentDetailsClientsList
                clients={clientsWithAgentAccess}
                agentAccessPackages={agentAccessPackages ?? []}
                isLoading={isAddingAgentAccessPackages || isRemovingAgentAccessPackages}
                toPartyUuid={toPartyUuid}
                actingPartyUuid={actingPartyUuid}
                addAgentAccessPackages={addAgentAccessPackages}
                removeAgentAccessPackages={removeAgentAccessPackages}
                searchString={searchString}
              />
            ) : (
              <DsParagraph>{t('client_administration_page.no_delegations')}</DsParagraph>
            )}
            <ClientAdminDetails
              heading={t('client_administration_page.agent_can_get_clients_tab')}
              searchString={searchString}
            >
              {clientsWithoutAgentAccess.length > 0 ? (
                <AgentDetailsClientsList
                  clients={clientsWithoutAgentAccess}
                  agentAccessPackages={agentAccessPackages ?? []}
                  toPartyUuid={toPartyUuid}
                  actingPartyUuid={actingPartyUuid}
                  isLoading={isAddingAgentAccessPackages || isRemovingAgentAccessPackages}
                  addAgentAccessPackages={addAgentAccessPackages}
                  removeAgentAccessPackages={removeAgentAccessPackages}
                  searchString={searchString}
                />
              ) : (
                <DsParagraph>{t('client_administration_page.no_clients')}</DsParagraph>
              )}
            </ClientAdminDetails>
          </>
        )}
      </PageContainer>
    </>
  );
};
