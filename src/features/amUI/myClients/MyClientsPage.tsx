import React, { useMemo } from 'react';
import {
  DsAlert,
  DsParagraph,
  DsSkeleton,
  formatDisplayName,
  SnackbarProvider,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useGetPartyFromLoggedInUserQuery } from '@/rtk/features/lookupApi';
import { useGetMyClientsQuery, type Client } from '@/rtk/features/clientApi';
import { PartyType, useGetReporteeQuery } from '@/rtk/features/userInfoApi';

import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { ReporteePageHeading } from '../common/ReporteePageHeading';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { MyClientsAccessSection } from './MyClientsAccessSection';
import { MyClientsDeleteClientProviderModal } from './MyClientsDeleteClientProviderModal';

import classes from './MyClientsPage.module.css';
import { useBackUrl } from '@/resources/hooks/useBackUrl';
import { PageWrapper } from '@/components/PageWrapper/PageWrapper';

export const MyClientsPage = () => {
  const { t } = useTranslation();
  const actingPartyUuid = getCookie('AltinnPartyUuid') ?? '';

  useDocumentTitle(t('my_clients_page.page_title'));

  const {
    data: currentUser,
    isLoading: isLoadingCurrentUser,
    error: currentUserError,
  } = useGetPartyFromLoggedInUserQuery();
  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const backUrl = useBackUrl(`/`);
  const isActingOnBehalfOfSelf = currentUser?.partyUuid === actingPartyUuid;

  const {
    data: myClientsByProvider,
    isLoading: isLoadingMyClients,
    error: myClientsError,
  } = useGetMyClientsQuery(
    { provider: [actingPartyUuid] },
    {
      skip:
        !actingPartyUuid || !currentUser?.partyUuid || isActingOnBehalfOfSelf || !!currentUserError,
    },
  );

  const clients = useMemo(() => {
    const dedupedClients = new Map<string, Client>();
    (myClientsByProvider ?? []).forEach((providerWithClients) => {
      providerWithClients.clients.forEach((client) => {
        const hasDelegatedAccess = client.access.some((access) => access.packages.length > 0);
        if (hasDelegatedAccess && !dedupedClients.has(client.client.id)) {
          dedupedClients.set(client.client.id, client);
        }
      });
    });

    return [...dedupedClients.values()];
  }, [myClientsByProvider]);

  const currentUserName =
    formatDisplayName({
      fullName: currentUser?.name || '',
      type: currentUser?.partyTypeName === PartyType.Person ? 'person' : 'company',
    }) || t('common.you_uppercase');

  const actingPartyName =
    formatDisplayName({
      fullName: reportee?.name || '',
      type: reportee?.type === 'Person' ? 'person' : 'company',
    }) || t('common.you_uppercase');

  const errorDetails = createErrorDetails(myClientsError || currentUserError);

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <Breadcrumbs items={['root', 'my_clients']} />
        <PageContainer
          backUrl={backUrl}
          contentActions={
            <MyClientsDeleteClientProviderModal
              provider={actingPartyUuid}
              providerName={actingPartyName}
              selfPartyUuid={currentUser?.partyUuid}
            />
          }
        >
          <>
            <ReporteePageHeading
              title={t('my_clients_page.main_page_heading', { actingParty: actingPartyName })}
              reportee={reportee}
              isLoading={isLoadingReportee}
            />
            <div className={classes.content}>
              {isActingOnBehalfOfSelf ? (
                <DsAlert data-color='info'>
                  {t('my_clients_page.not_acting_on_behalf_info')}
                </DsAlert>
              ) : errorDetails ? (
                <DsAlert data-color='danger'>
                  <TechnicalErrorParagraphs
                    status={errorDetails.status}
                    time={errorDetails.time}
                    traceId={errorDetails.traceId}
                  />
                </DsAlert>
              ) : isLoadingCurrentUser || isLoadingMyClients ? (
                <DsSkeleton
                  variant='rectangle'
                  width='100%'
                  height='220px'
                />
              ) : clients.length > 0 ? (
                <SnackbarProvider>
                  <MyClientsAccessSection
                    clients={clients}
                    actingPartyUuid={actingPartyUuid}
                    currentUserName={currentUserName}
                  />
                </SnackbarProvider>
              ) : (
                <DsParagraph>
                  {t('my_clients_page.no_clients', { actingParty: actingPartyName })}
                </DsParagraph>
              )}
            </div>
          </>
        </PageContainer>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
