import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsHeading,
  DsParagraph,
  DsSkeleton,
  formatDisplayName,
  useSnackbar,
} from '@altinn/altinn-components';
import { useParams } from 'react-router';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { ClientAgentPackageList } from '../common/ClientAgentPackageList/ClientAgentPackageList';
import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';
import { UserPageHeaderSkeleton } from '../common/UserPageHeader/UserPageHeaderSkeleton';
import { AddAgentButton } from '../users/NewUserModal/AddAgentModal';
import { ClientAdminSearchField } from '../common/ClientAdminSearchField/ClientAdminSearchField';
import { CollapsibleContainer } from '../common/CollapsibleContainer/CollapsibleContainer';
import { isNewUser } from '../common/isNewUser';

import { useClientDetailsAccessAgentLists } from './useClientDetailsAccessAgentLists';

import {
  useAddAgentAccessPackagesMutation,
  useAddAgentResourcesMutation,
  useGetAgentsQuery,
  useGetClientAccessPackagesQuery,
  useGetClientResourcesQuery,
  useGetClientsQuery,
  useRemoveAgentAccessPackagesMutation,
  useRemoveAgentResourcesMutation,
} from '@/rtk/features/clientApi';
import { PartyType, useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';
import { amUIPath } from '@/routes/paths';

export const ClientDetails = () => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { id } = useParams();
  const { fromParty, actingParty } = usePartyRepresentation();

  const { data: isClientAdmin, isLoading: isLoadingIsClientAdmin } = useGetIsClientAdminQuery();
  const {
    data: clientAccessPackages,
    isLoading: isLoadingClientAccessPackages,
    error: clientAccessPackagesError,
  } = useGetClientAccessPackagesQuery({ from: id ?? '' }, { skip: !id });
  const {
    data: clientResources,
    isLoading: isLoadingClientResources,
    error: clientResourcesError,
  } = useGetClientResourcesQuery({ from: id ?? '' }, { skip: !id });
  const { data: agents, isLoading: isLoadingAgents, error: agentsError } = useGetAgentsQuery();
  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useGetClientsQuery();

  const [addAgentAccessPackages, { isLoading: isAddingAgentAccessPackages }] =
    useAddAgentAccessPackagesMutation();
  const [removeAgentAccessPackages, { isLoading: isRemovingAgentAccessPackages }] =
    useRemoveAgentAccessPackagesMutation();
  const [addAgentResources, { isLoading: isAddingAgentResources }] = useAddAgentResourcesMutation();
  const [removeAgentResources, { isLoading: isRemovingAgentResources }] =
    useRemoveAgentResourcesMutation();

  const { agentsWithClientAccess, agentsWithoutClientAccess } = useClientDetailsAccessAgentLists({
    clientAccessPackages,
    clientResources,
    agents,
  });

  const recentlyAddedClients = [...agentsWithClientAccess, ...agentsWithoutClientAccess].filter(
    (x) => isNewUser(x.agentAddedAt),
  );
  const [searchString, setSearchString] = useState<string>('');

  const recentlyAddedSectionId = useId();
  const assignedSectionId = useId();
  const unassignedSectionId = useId();
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

  const onUserAdded = () => {
    openSnackbar({
      message: t('client_administration_page.add_agent_client_access_success_snackbar'),
      color: 'success',
    });
  };

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
                <>
                  <ClientAdminSearchField
                    setSearchString={setSearchString}
                    searchPlaceholder={t('client_administration_page.agent_search_placeholder')}
                  >
                    <AddAgentButton
                      onComplete={onUserAdded}
                      variant='primary'
                    />
                  </ClientAdminSearchField>
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
                        isLoading={
                          isAddingAgentAccessPackages ||
                          isRemovingAgentAccessPackages ||
                          isAddingAgentResources ||
                          isRemovingAgentResources
                        }
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
                        isLoading={
                          isAddingAgentAccessPackages ||
                          isRemovingAgentAccessPackages ||
                          isAddingAgentResources ||
                          isRemovingAgentResources
                        }
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
                        isLoading={
                          isAddingAgentAccessPackages ||
                          isRemovingAgentAccessPackages ||
                          isAddingAgentResources ||
                          isRemovingAgentResources
                        }
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
                      />
                    </CollapsibleContainer>
                  </section>
                </>
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
