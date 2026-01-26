import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsButton,
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
import { ClientAdministrationAgentDeleteModal } from './ClientAdministrationAgentDeleteModal';
import { ClientAdministrationAgentClientsList } from './ClientAdministrationAgentClientsList';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { PartyType, useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';
import {
  type Client,
  useAddAgentAccessPackagesMutation,
  useGetAgentAccessPackagesQuery,
  useGetClientsQuery,
} from '@/rtk/features/clientApi';
import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';
import { ClientAdministrationAgentTabs } from './ClientAdministrationAgentTabs';
import { useAgentClientTabSnapshots } from './useAgentClientTabSnapshots';

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
  const agentAccessClientIds = new Set(
    (agentAccessPackages ?? [])
      .filter((client: Client) => client.access.some((access) => access.packages.length > 0))
      .map((client) => client.client.id),
  );
  const clientsWithAgentAccess =
    clients?.filter((client) => agentAccessClientIds.has(client.client.id)) ?? [];
  const clientsWithoutAgentAccess =
    clients?.filter((client) => !agentAccessClientIds.has(client.client.id)) ?? [];
  const {
    hasTabClients,
    canTabClients,
    hasTabSnapshotReady,
    canTabSnapshotReady,
    showHasTabLoading,
    showCanTabLoading,
  } = useAgentClientTabSnapshots({
    activeTab,
    isLoadingAgentAccessPackages,
    isLoadingClients,
    isErrorAgentAccessPackages,
    isErrorClients,
    clientsWithAgentAccess,
    clientsWithoutAgentAccess,
  });

  const hasClientsContent = (
    <>
      <DsHeading data-size='sm'>{t('client_administration_page.delegations_heading')}</DsHeading>
      {showHasTabLoading && (
        <DsParagraph data-size='sm'>
          <DsSkeleton variant='text' />
        </DsParagraph>
      )}
      {!hasTabSnapshotReady &&
        !isLoadingAgentAccessPackages &&
        !isLoadingClients &&
        isErrorAgentAccessPackages && (
          <DsAlert data-color='danger'>
            <DsParagraph>{t('client_administration_page.load_delegations_error')}</DsParagraph>
          </DsAlert>
        )}
      {!hasTabSnapshotReady &&
        !isLoadingAgentAccessPackages &&
        !isLoadingClients &&
        !isErrorAgentAccessPackages &&
        isErrorClients && (
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
      {hasTabSnapshotReady && hasTabClients.length > 0 && (
        <ClientAdministrationAgentClientsList
          clients={hasTabClients}
          isAddingAgentAccessPackages={isAddingAgentAccessPackages}
          toPartyUuid={toPartyUuid}
          actingPartyUuid={actingPartyUuid}
          addAgentAccessPackages={addAgentAccessPackages}
        />
      )}
      {hasTabSnapshotReady && hasTabClients.length === 0 && (
        <DsParagraph>{t('client_administration_page.no_delegations')}</DsParagraph>
      )}
    </>
  );

  const canGetClientsContent = (
    <>
      {/* <DsHeading data-size='sm'>
        {t('client_administration_page.clients_tab_title')}
      </DsHeading> */}
      {showCanTabLoading && (
        <DsParagraph data-size='sm'>
          <DsSkeleton variant='text' />
        </DsParagraph>
      )}
      {!canTabSnapshotReady &&
        !isLoadingClients &&
        !isLoadingAgentAccessPackages &&
        isErrorClients && (
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
      {!canTabSnapshotReady &&
        !isLoadingClients &&
        !isLoadingAgentAccessPackages &&
        !isErrorClients &&
        isErrorAgentAccessPackages && (
          <DsAlert data-color='danger'>
            <DsParagraph>{t('client_administration_page.load_delegations_error')}</DsParagraph>
          </DsAlert>
        )}
      {canTabSnapshotReady && canTabClients.length === 0 && (
        <DsParagraph>{t('client_administration_page.no_clients')}</DsParagraph>
      )}
      {canTabSnapshotReady && canTabClients.length > 0 && (
        <ClientAdministrationAgentClientsList
          clients={canTabClients}
          isAddingAgentAccessPackages={isAddingAgentAccessPackages}
          toPartyUuid={toPartyUuid}
          actingPartyUuid={actingPartyUuid}
          addAgentAccessPackages={addAgentAccessPackages}
        />
      )}
    </>
  );

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

        <ClientAdministrationAgentTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          hasClientsContent={hasClientsContent}
          canGetClientsContent={canGetClientsContent}
        />
      </PageContainer>
    </>
  );
};
