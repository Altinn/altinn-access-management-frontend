import React, { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph, DsSkeleton, Switch } from '@altinn/altinn-components';
import { useParams } from 'react-router';
import { skipToken } from '@reduxjs/toolkit/query';

import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import {
  useAddAgentAccessPackagesMutation,
  useAddAgentResourcesMutation,
  useRemoveAgentAccessPackagesMutation,
  useRemoveAgentResourcesMutation,
  useGetAgentAccessPackagesQuery,
  useGetAgentResourcesQuery,
  useGetClientsQuery,
} from '@/rtk/features/clientApi';
import { useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';
import { amUIPath } from '@/routes/paths';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';
import { UserPageHeaderSkeleton } from '../common/UserPageHeader/UserPageHeaderSkeleton';
import { ClientAdminSearchField } from '../common/ClientAdminSearchField/ClientAdminSearchField';
import { CollapsibleContainer } from '../common/CollapsibleContainer/CollapsibleContainer';
import { filterDeletedParties } from '../common/deletedPartyUtils';
import {
  RestoreFocusFallback,
  RestoreFocusProvider,
  useRestoreFocus,
} from '../common/RestoreFocus';
import { ClientBulkDelegationProvider } from '../common/ClientBulkDelegation/ClientBulkDelegation';

import { AgentDetailsDeleteModal } from './AgentDetailsDeleteModal';
import { useAgentDetailsAccessClientLists } from './useAgentDetailsAccessClientLists';
import { useAgentDetailsBulkAccessActions } from './useAgentDetailsBulkAccessActions';
import { AgentDetailsClientsList } from './AgentDetailsClientsList';
import classes from './AgentDetails.module.css';

export const AgentDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { toParty, actingParty } = usePartyRepresentation();
  const { getAccessPackageById, isFetching: isFetchingAccessPackageLookup } =
    useAccessPackageLookup();
  const { data: isClientAdmin, isLoading: isLoadingIsClientAdmin } = useGetIsClientAdminQuery();
  const {
    data: agentAccessPackages,
    isLoading: isLoadingAgentAccessPackages,
    isFetching: isFetchingAgentAccessPackages,
    error: agentAccessPackagesError,
  } = useGetAgentAccessPackagesQuery(id ? { to: id } : skipToken);
  const {
    data: agentResources,
    isLoading: isLoadingAgentResources,
    isFetching: isFetchingAgentResources,
    error: agentResourcesError,
  } = useGetAgentResourcesQuery(id ? { to: id } : skipToken);
  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useGetClientsQuery();
  const [showDeleted, setShowDeleted] = useState(false);
  const visibleClients = useMemo(
    () => (showDeleted ? clients : filterDeletedParties(clients, (client) => client.client)),
    [clients, showDeleted],
  );

  const [addAgentAccessPackages, { isLoading: isAddingAgentAccessPackages }] =
    useAddAgentAccessPackagesMutation();
  const [removeAgentAccessPackages, { isLoading: isRemovingAgentAccessPackages }] =
    useRemoveAgentAccessPackagesMutation();
  const [addAgentResources, { isLoading: isAddingAgentResources }] = useAddAgentResourcesMutation();
  const [removeAgentResources, { isLoading: isRemovingAgentResources }] =
    useRemoveAgentResourcesMutation();

  const isMutating =
    isAddingAgentAccessPackages ||
    isRemovingAgentAccessPackages ||
    isAddingAgentResources ||
    isRemovingAgentResources;
  const { delegateItems, revokeItems } = useAgentDetailsBulkAccessActions({
    toPartyUuid: toParty?.partyUuid,
    actingPartyUuid: actingParty?.partyUuid,
    addAgentAccessPackages,
    removeAgentAccessPackages,
    addAgentResources,
    removeAgentResources,
  });

  const { clientsWithAgentAccess, clientsWithoutAgentAccess } = useAgentDetailsAccessClientLists({
    agentAccessPackages,
    agentResources,
    clients: visibleClients,
  });
  const [searchString, setSearchString] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  React.useEffect(() => {
    setExpandedIds([]);
  }, [id]);

  const backUrl = `/${amUIPath.ClientAdministration}#users`;
  const userName = formatEntityDisplayName(toParty);
  const toPartyUuid = toParty?.partyUuid;
  const actingPartyUuid = actingParty?.partyUuid;
  const accessStateClients = agentAccessPackages ?? [];
  const resourceAccessClients = agentResources ?? [];
  const actionsDisabled =
    isMutating ||
    isFetchingAgentAccessPackages ||
    isFetchingAgentResources ||
    isFetchingAccessPackageLookup ||
    !toPartyUuid ||
    !actingPartyUuid;
  const assignedSectionId = useId();
  const unassignedSectionId = useId();
  // One zone for both sections, so a client that moves between them is still found by its id.
  const restoreFocus = useRestoreFocus();

  if (isClientAdmin === false) {
    return (
      <DsAlert data-color='warning'>{t('client_administration_page.no_access_title')}</DsAlert>
    );
  }

  if (agentAccessPackagesError || agentResourcesError || clientsError) {
    const delegationsErrorDetails = createErrorDetails(
      agentAccessPackagesError ?? agentResourcesError,
    );
    const clientsErrorDetails = createErrorDetails(clientsError);
    return (
      <>
        {!!delegationsErrorDetails && (
          <DsAlert data-color='danger'>
            <DsParagraph>{t('client_administration_page.load_delegations_error')}</DsParagraph>
            <TechnicalErrorParagraphs
              status={delegationsErrorDetails.status}
              time={delegationsErrorDetails.time}
              traceId={delegationsErrorDetails.traceId}
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
        {isLoadingIsClientAdmin ||
        isLoadingAgentAccessPackages ||
        isLoadingAgentResources ||
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
              direction='to'
              displayDirection={false}
              displayRoles={false}
            />
            <RestoreFocusProvider restoreFocus={restoreFocus}>
              <RestoreFocusFallback>
                <ClientAdminSearchField
                  setSearchString={setSearchString}
                  searchPlaceholder={t('my_clients_page.search_placeholder')}
                  filters={
                    <Switch
                      onChange={(e) => setShowDeleted(e.target.checked)}
                      checked={showDeleted}
                      label={t('common.show_deleted')}
                    />
                  }
                />
                <ClientBulkDelegationProvider
                  agentName={userName}
                  accessStateClients={accessStateClients}
                  resourceAccessClients={resourceAccessClients}
                  getAccessPackageById={getAccessPackageById}
                  disabled={actionsDisabled}
                  onDelegateItems={delegateItems}
                  onRevokeItems={revokeItems}
                >
                  <div className={classes.clientSections}>
                    <section aria-labelledby={assignedSectionId}>
                      <CollapsibleContainer
                        heading={t('client_administration_page.agent_has_clients_tab')}
                        searchString={searchString}
                        id={assignedSectionId}
                        defaultOpen
                      >
                        <AgentDetailsClientsList
                          clients={clientsWithAgentAccess}
                          agentAccessPackages={accessStateClients}
                          agentResources={resourceAccessClients}
                          isLoading={actionsDisabled}
                          toPartyUuid={toPartyUuid}
                          actingPartyUuid={actingPartyUuid}
                          addAgentAccessPackages={addAgentAccessPackages}
                          removeAgentAccessPackages={removeAgentAccessPackages}
                          addAgentResources={addAgentResources}
                          removeAgentResources={removeAgentResources}
                          searchString={searchString}
                          emptyText={t('client_administration_page.no_delegations')}
                          expandedIds={expandedIds}
                          onToggleExpanded={toggleExpanded}
                          restoreFocusFallbackId={assignedSectionId}
                        />
                      </CollapsibleContainer>
                    </section>
                    <section aria-labelledby={unassignedSectionId}>
                      <CollapsibleContainer
                        heading={t('client_administration_page.agent_can_get_clients_tab')}
                        searchString={searchString}
                        id={unassignedSectionId}
                      >
                        <AgentDetailsClientsList
                          clients={clientsWithoutAgentAccess}
                          agentAccessPackages={accessStateClients}
                          agentResources={resourceAccessClients}
                          toPartyUuid={toPartyUuid}
                          actingPartyUuid={actingPartyUuid}
                          isLoading={actionsDisabled}
                          addAgentAccessPackages={addAgentAccessPackages}
                          removeAgentAccessPackages={removeAgentAccessPackages}
                          addAgentResources={addAgentResources}
                          removeAgentResources={removeAgentResources}
                          searchString={searchString}
                          emptyText={t('client_administration_page.no_clients')}
                          expandedIds={expandedIds}
                          onToggleExpanded={toggleExpanded}
                          restoreFocusFallbackId={unassignedSectionId}
                        />
                      </CollapsibleContainer>
                    </section>
                  </div>
                </ClientBulkDelegationProvider>
              </RestoreFocusFallback>
            </RestoreFocusProvider>
          </>
        )}
      </PageContainer>
    </>
  );
};
