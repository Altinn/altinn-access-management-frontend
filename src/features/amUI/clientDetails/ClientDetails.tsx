import React, { useCallback, useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph, DsSkeleton } from '@altinn/altinn-components';
import { useParams } from 'react-router';

import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import {
  type Agent,
  useAddAgentAccessPackagesMutation,
  useAddAgentResourcesMutation,
  useGetAgentsQuery,
  useGetClientAccessPackagesQuery,
  useGetClientResourcesQuery,
  useGetClientsQuery,
  useRemoveAgentAccessPackagesMutation,
  useRemoveAgentResourcesMutation,
} from '@/rtk/features/clientApi';
import { useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';
import { amUIPath } from '@/routes/paths';
import { useSnackbarOnIdle } from '@/resources/hooks/useSnackbarOnIdle';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { ClientAgentPackageList } from '../common/ClientAgentPackageList/ClientAgentPackageList';
import { ClientBulkActions } from '../common/ClientBulkDelegation/ClientBulkActions';
import { useClientBulkDelegation } from '../common/ClientBulkDelegation/useClientBulkDelegation';
import { indexHeldAccess } from '../common/ClientBulkDelegation/getClientBulkItems';
import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';
import { UserPageHeaderSkeleton } from '../common/UserPageHeader/UserPageHeaderSkeleton';
import { AddAgentButton } from '../users/NewUserModal/AddAgentModal';
import { ClientAdminSearchField } from '../common/ClientAdminSearchField/ClientAdminSearchField';
import { CollapsibleContainer } from '../common/CollapsibleContainer/CollapsibleContainer';
import { SearchHitsStatus } from '../common/SearchHitsStatus/SearchHitsStatus';
import {
  RestoreFocusFallback,
  RestoreFocusProvider,
  useRestoreFocus,
} from '../common/RestoreFocus';

import { useClientDetailsAccessAgentLists } from './useClientDetailsAccessAgentLists';
import classes from './ClientDetails.module.css';

export const ClientDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { fromParty, actingParty } = usePartyRepresentation();

  const { data: isClientAdmin, isLoading: isLoadingIsClientAdmin } = useGetIsClientAdminQuery();
  const {
    data: clientAccessPackages,
    isLoading: isLoadingClientAccessPackages,
    isFetching: isFetchingClientAccessPackages,
    error: clientAccessPackagesError,
  } = useGetClientAccessPackagesQuery({ from: id ?? '' }, { skip: !id });
  const {
    data: clientResources,
    isLoading: isLoadingClientResources,
    isFetching: isFetchingClientResources,
    error: clientResourcesError,
  } = useGetClientResourcesQuery({ from: id ?? '' }, { skip: !id });
  const {
    data: agents,
    isLoading: isLoadingAgents,
    isFetching: isFetchingAgents,
    error: agentsError,
  } = useGetAgentsQuery();
  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useGetClientsQuery();

  const [addAgentAccessPackages, { isLoading: isAddingAgentAccessPackages }] =
    useAddAgentAccessPackagesMutation();
  const [removeAgentAccessPackages, { isLoading: isRemovingAgentAccessPackages }] =
    useRemoveAgentAccessPackagesMutation();
  const [addAgentResources, { isLoading: isAddingAgentResources }] = useAddAgentResourcesMutation();
  const [removeAgentResources, { isLoading: isRemovingAgentResources }] =
    useRemoveAgentResourcesMutation();

  const [searchString, setSearchString] = useState<string>('');
  const { recentlyAddedClients, agentsWithClientAccess, agentsWithoutClientAccess, searchHits } =
    useClientDetailsAccessAgentLists({
      clientAccessPackages,
      clientResources,
      agents,
      searchString,
    });

  // Hold the confirmation until the agents have refetched, so it is announced after the modal has
  // closed and focus has returned, together with the row it is about.
  const { queueSnackbar } = useSnackbarOnIdle({ isBusy: isFetchingAgents });

  const recentlyAddedSectionId = useId();
  const assignedSectionId = useId();
  const unassignedSectionId = useId();
  // One zone for every section, so an agent that moves between them is still found by its id.
  const restoreFocus = useRestoreFocus();
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  React.useEffect(() => {
    setExpandedIds([]);
  }, [id]);
  const selectedClient = clients?.find((client) => client.client.id === id);
  const delegablePackages = selectedClient?.access?.flatMap((access) => access.packages) ?? [];
  const delegableResources =
    selectedClient?.access?.flatMap((access) => access.resources ?? []) ?? [];

  const hasDelegatableAccesses = delegablePackages.length > 0 || delegableResources.length > 0;

  const clientName = formatEntityDisplayName(fromParty);
  const fromPartyUuid = fromParty?.id ?? id;
  const actingPartyUuid = actingParty?.id;
  const actionsDisabled =
    isAddingAgentAccessPackages ||
    isRemovingAgentAccessPackages ||
    isAddingAgentResources ||
    isRemovingAgentResources ||
    isFetchingClientAccessPackages ||
    isFetchingClientResources ||
    !fromPartyUuid ||
    !actingPartyUuid;
  const heldPackages = useMemo(
    () => indexHeldAccess(clientAccessPackages ?? [], (held) => held.agent.id),
    [clientAccessPackages],
  );
  const heldResources = useMemo(
    () => indexHeldAccess(clientResources ?? [], (held) => held.agent.id),
    [clientResources],
  );
  const bulk = useClientBulkDelegation({
    actingPartyUuid,
    heldPackages,
    heldResources,
    disabled: actionsDisabled,
    addAgentAccessPackages,
    removeAgentAccessPackages,
    addAgentResources,
    removeAgentResources,
  });
  const renderAgentActions = useCallback(
    (agent: Agent, rowKey: string, restoreFocusFallbackId?: string) => {
      const agentId = agent.agent.id;
      const items = bulk.getItems(selectedClient?.access ?? [], agentId);
      if (items.missing.length === 0 && items.held.length === 0) return null;
      return (
        <ClientBulkActions
          rowKey={rowKey}
          rowKind='agent'
          restoreFocusFallbackId={restoreFocusFallbackId}
          target={{ clientId: fromPartyUuid, agentId }}
          names={{ clientName, agentName: formatEntityDisplayName(agent.agent) }}
          items={items}
          bulk={bulk}
        />
      );
    },
    [bulk, clientName, fromPartyUuid, selectedClient],
  );

  if (isClientAdmin === false) {
    return (
      <DsAlert data-color='warning'>{t('client_administration_page.no_access_title')}</DsAlert>
    );
  }

  if (clientAccessPackagesError || clientResourcesError || agentsError || clientsError) {
    const details = createErrorDetails(
      clientAccessPackagesError || clientResourcesError || agentsError || clientsError,
    );
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

  const backUrl = `/${amUIPath.ClientAdministration}#clients`;
  const actingPartyName =
    actingParty?.name && actingParty.type ? formatEntityDisplayName(actingParty) : '';
  const onUserAdded = () =>
    queueSnackbar(t('client_administration_page.add_agent_client_access_success_snackbar'));

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
        isLoadingClientResources ||
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
            {id &&
              (hasDelegatableAccesses ? (
                <RestoreFocusProvider restoreFocus={restoreFocus}>
                  <RestoreFocusFallback>
                    <ClientAdminSearchField
                      setSearchString={setSearchString}
                      searchPlaceholder={t('client_administration_page.agent_search_placeholder')}
                    >
                      <AddAgentButton
                        onComplete={onUserAdded}
                        variant='primary'
                      />
                    </ClientAdminSearchField>
                    <SearchHitsStatus hits={searchHits} />
                    <div className={classes.agentSections}>
                      {recentlyAddedClients.length > 0 && (
                        <section aria-labelledby={recentlyAddedSectionId}>
                          <DsHeading
                            data-size='xs'
                            level={2}
                            id={recentlyAddedSectionId}
                          >
                            {t('client_administration_page.recently_added_users')}
                          </DsHeading>
                          <ClientAgentPackageList
                            agents={recentlyAddedClients}
                            clientAccessPackages={clientAccessPackages ?? []}
                            clientResources={clientResources ?? []}
                            client={selectedClient}
                            isLoading={bulk.disabled || bulk.hasActiveRun}
                            renderAgentActions={renderAgentActions}
                            fromPartyUuid={fromPartyUuid}
                            actingPartyUuid={actingPartyUuid}
                            addAgentAccessPackages={addAgentAccessPackages}
                            removeAgentAccessPackages={removeAgentAccessPackages}
                            addAgentResources={addAgentResources}
                            removeAgentResources={removeAgentResources}
                            emptyText={t('client_administration_page.no_agents')}
                            searchString={searchString}
                            expandedIds={expandedIds}
                            onToggleExpanded={toggleExpanded}
                            listKey='recent'
                            restoreFocusFallbackId={recentlyAddedSectionId}
                          />
                        </section>
                      )}
                      <section aria-labelledby={assignedSectionId}>
                        <CollapsibleContainer
                          heading={t('client_administration_page.client_has_agents_tab')}
                          searchString={searchString}
                          id={assignedSectionId}
                          defaultOpen
                        >
                          <ClientAgentPackageList
                            agents={agentsWithClientAccess}
                            clientAccessPackages={clientAccessPackages ?? []}
                            clientResources={clientResources ?? []}
                            client={selectedClient}
                            isLoading={bulk.disabled || bulk.hasActiveRun}
                            renderAgentActions={renderAgentActions}
                            fromPartyUuid={fromPartyUuid}
                            actingPartyUuid={actingPartyUuid}
                            addAgentAccessPackages={addAgentAccessPackages}
                            removeAgentAccessPackages={removeAgentAccessPackages}
                            addAgentResources={addAgentResources}
                            removeAgentResources={removeAgentResources}
                            emptyText={t('client_administration_page.no_agents')}
                            searchString={searchString}
                            expandedIds={expandedIds}
                            onToggleExpanded={toggleExpanded}
                            restoreFocusFallbackId={assignedSectionId}
                          />
                        </CollapsibleContainer>
                      </section>
                      <section aria-labelledby={unassignedSectionId}>
                        <CollapsibleContainer
                          heading={t('client_administration_page.client_can_get_agents_tab')}
                          searchString={searchString}
                          id={unassignedSectionId}
                        >
                          <ClientAgentPackageList
                            agents={agentsWithoutClientAccess}
                            clientAccessPackages={clientAccessPackages ?? []}
                            clientResources={clientResources ?? []}
                            client={selectedClient}
                            isLoading={bulk.disabled || bulk.hasActiveRun}
                            renderAgentActions={renderAgentActions}
                            fromPartyUuid={fromPartyUuid}
                            actingPartyUuid={actingPartyUuid}
                            addAgentAccessPackages={addAgentAccessPackages}
                            removeAgentAccessPackages={removeAgentAccessPackages}
                            addAgentResources={addAgentResources}
                            removeAgentResources={removeAgentResources}
                            emptyText={t('client_administration_page.addUserPrompt')}
                            searchString={searchString}
                            expandedIds={expandedIds}
                            onToggleExpanded={toggleExpanded}
                            restoreFocusFallbackId={unassignedSectionId}
                          />
                        </CollapsibleContainer>
                      </section>
                    </div>
                  </RestoreFocusFallback>
                </RestoreFocusProvider>
              ) : (
                <DsParagraph>
                  {t('client_administration_page.no_access_to_delegate', {
                    name: actingPartyName,
                  })}
                </DsParagraph>
              ))}
          </>
        )}
      </PageContainer>
    </>
  );
};
