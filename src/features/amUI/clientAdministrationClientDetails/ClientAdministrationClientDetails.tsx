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

import { amUIPath } from '@/routes/paths';
import { PartyType, useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';
import {
  useAddAgentAccessPackagesMutation,
  useGetAgentsQuery,
  useGetClientAccessPackagesQuery,
  useGetClientsQuery,
  useRemoveAgentAccessPackagesMutation,
} from '@/rtk/features/clientApi';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { ClientAdministrationClientTabs } from './ClientAdministrationClientTabs';
import { ClientAdministrationClientAgentsList } from './ClientAdministrationClientAgentsList';
import { useClientAccessAgentLists } from './useClientAccessAgentLists';
import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';
import { UserPageHeaderSkeleton } from '../common/UserPageHeader/UserPageHeaderSkeleton';
import { AddAgentButton } from '../users/NewUserModal/AddAgentModal';

export const ClientAdministrationClientDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { fromParty, actingParty } = usePartyRepresentation();
  const [activeTab, setActiveTab] = useState('has-users');
  const { data: isClientAdmin, isLoading: isLoadingIsClientAdmin } = useGetIsClientAdminQuery();
  const {
    data: clientAccessPackages,
    isLoading: isLoadingClientAccessPackages,
    error: clientAccessPackagesError,
  } = useGetClientAccessPackagesQuery({ from: id ?? '' }, { skip: !id });
  const { data: agents, isLoading: isLoadingAgents, error: agentsError } = useGetAgentsQuery();
  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useGetClientsQuery();

  const [addAgentAccessPackages, { isLoading: isAddingAgentAccessPackages }] =
    useAddAgentAccessPackagesMutation();
  const [removeAgentAccessPackages, { isLoading: isRemovingAgentAccessPackages }] =
    useRemoveAgentAccessPackagesMutation();

  const { agentsWithClientAccess, allAgents } = useClientAccessAgentLists({
    clientAccessPackages,
    agents,
  });

  const selectedClient = clients?.find((client) => client.client.id === id);
  const delegablePackages = selectedClient?.access?.flatMap((access) => access.packages) ?? [];

  const hasDelegatablePackages = (delegablePackages?.length ?? 0) > 0;

  if (isClientAdmin === false) {
    return (
      <DsAlert data-color='warning'>{t('client_administration_page.no_access_title')}</DsAlert>
    );
  }

  if (clientAccessPackagesError || agentsError || clientsError) {
    const details = createErrorDetails(clientAccessPackagesError || agentsError || clientsError);
    return (
      <>
        {!!details && (
          <DsAlert data-color='danger'>
            <DsParagraph>{t('client_administration_page.load_user_delegations_error')}</DsParagraph>
            <TechnicalErrorParagraphs
              status={details.status}
              time={details.time}
              traceId={details.traceId}
            />
          </DsAlert>
        )}
      </>
    );
  }

  const backUrl = `/${amUIPath.ClientAdministration}?tab=clients`;
  const clientName = formatDisplayName({
    fullName: fromParty?.name || '',
    type: fromParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
  });
  const actingPartyName =
    actingParty?.name && actingParty.partyTypeName
      ? formatDisplayName({
          fullName: actingParty.name,
          type: actingParty.partyTypeName === PartyType.Person ? 'person' : 'company',
        })
      : '';
  const fromPartyUuid = fromParty?.partyUuid ?? id;
  const actingPartyUuid = actingParty?.partyUuid;

  return (
    <>
      <Breadcrumbs
        items={['root', 'client_administration']}
        lastBreadcrumb={{
          label: clientName,
        }}
      />
      <PageContainer backUrl={backUrl}>
        {isLoadingIsClientAdmin ||
        isLoadingClientAccessPackages ||
        isLoadingAgents ||
        isLoadingClients ? (
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
              direction='from'
              displayDirection
              displayRoles={false}
            />
            {!id && (
              <DsAlert data-color='warning'>
                <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
              </DsAlert>
            )}
            {id && (
              <ClientAdministrationClientTabs
                activeTab={activeTab}
                onChange={setActiveTab}
                hasUsersContent={
                  hasDelegatablePackages ? (
                    <ClientAdministrationClientAgentsList
                      agents={agentsWithClientAccess}
                      clientAccessPackages={clientAccessPackages ?? []}
                      client={selectedClient}
                      isLoading={isAddingAgentAccessPackages || isRemovingAgentAccessPackages}
                      fromPartyUuid={fromPartyUuid}
                      actingPartyUuid={actingPartyUuid}
                      addAgentAccessPackages={addAgentAccessPackages}
                      removeAgentAccessPackages={removeAgentAccessPackages}
                      emptyText={t('client_administration_page.no_user_delegations')}
                      onUserAdded={() => setActiveTab('all-users')}
                    />
                  ) : (
                    <DsParagraph>
                      {t('client_administration_page.no_access_to_delegate', {
                        name: actingPartyName,
                      })}
                    </DsParagraph>
                  )
                }
                allUsersContent={
                  hasDelegatablePackages ? (
                    <ClientAdministrationClientAgentsList
                      agents={allAgents}
                      clientAccessPackages={clientAccessPackages ?? []}
                      client={selectedClient}
                      isLoading={isAddingAgentAccessPackages || isRemovingAgentAccessPackages}
                      fromPartyUuid={fromPartyUuid}
                      actingPartyUuid={actingPartyUuid}
                      addAgentAccessPackages={addAgentAccessPackages}
                      removeAgentAccessPackages={removeAgentAccessPackages}
                      emptyText={t('client_administration_page.no_agents')}
                      onUserAdded={() => setActiveTab('all-users')}
                      addUserButton={<AddAgentButton />}
                    />
                  ) : (
                    <DsParagraph>
                      {t('client_administration_page.no_access_to_delegate', {
                        name: actingPartyName,
                      })}
                    </DsParagraph>
                  )
                }
              />
            )}
          </>
        )}
      </PageContainer>
    </>
  );
};
