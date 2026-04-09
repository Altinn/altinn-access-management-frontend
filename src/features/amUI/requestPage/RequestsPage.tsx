import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  BadgeVariant,
  Color,
  DsAlert,
  DsTabs,
  formatDisplayName,
} from '@altinn/altinn-components';
import { PageWrapper } from '@/components';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import {
  enableRequestSingleRight,
  useRerouteIfRequestPageDisabled,
} from '@/resources/utils/featureFlagUtils';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import ReporteePageHeading from '../common/ReporteePageHeading';
import { useGetIsAdminQuery, useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useRequests } from '@/resources/hooks/useRequests';
import { useGetSentRequestsCountQuery } from '@/rtk/features/requestApi';
import { PendingRequests, RequestsTabPanel } from './RequestsTabPanel';
import classes from './RequestPage.module.css';
import { SentRequestsTabPanel } from './SentRequestsTabPanel';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useSidebarRequestCount } from '@/resources/hooks/useSidebarRequestCount';

const selectedTabProps = {
  'data-size': 'sm',
  variant: 'base' as BadgeVariant,
};

const unselectedTabProps = {
  'data-size': 'sm',
  color: 'neutral' as Color,
};
const INCOMING_REQUESTS_TAB = 'incomingRequests';
const SENT_REQUESTS_TAB = 'sentRequests';

export const RequestPage = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<string>(INCOMING_REQUESTS_TAB);

  useRerouteIfRequestPageDisabled();

  useDocumentTitle(t('request_page.page_title'));

  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const { data: isAdmin, isLoading: isLoadingAdmin } = useGetIsAdminQuery();
  const {
    pendingRequests,
    isLoadingSentRequests,
    isLoadingReceivedRequests,
    isSentRequestsError,
    isReceivedRequestsError,
  } = useRequests();

  const partyUuid = getCookie('AltinnPartyUuid');
  const { data: sentRequestCount } = useGetSentRequestsCountQuery(
    { party: partyUuid || '', status: ['Pending'] },
    { skip: !partyUuid || !isAdmin || !enableRequestSingleRight() },
  );
  const { requestsBadgeCount: receivedRequestCount } = useSidebarRequestCount({
    displayRequestsPage: true,
    isAdmin,
    reportee,
    isLoadingPermissions: isLoadingAdmin,
  });

  const getBadgeProps = (tabValue: string) =>
    selectedTab === tabValue ? selectedTabProps : unselectedTabProps;

  const name = formatDisplayName({
    fullName: reportee?.name || '',
    type: reportee?.type === 'Person' ? 'person' : 'company',
  });

  const receivedRequestsCount = receivedRequestCount ?? 0;
  const resolvedSentRequestCount = sentRequestCount ?? 0;

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        {!isAdmin && !isLoadingAdmin ? (
          <DsAlert data-color='warning'>{t('common.no_access_to_page')}</DsAlert>
        ) : (
          <>
            <Breadcrumbs items={['root', 'requests']} />
            <PartyRepresentationProvider
              fromPartyUuid={getCookie('AltinnPartyUuid')}
              actingPartyUuid={getCookie('AltinnPartyUuid')}
              isLoading={isLoadingReportee}
            >
              <ReporteePageHeading
                title={t('request_page.heading', { name })}
                reportee={reportee}
                isLoading={isLoadingReportee}
              />
              <DsTabs
                value={selectedTab}
                onChange={setSelectedTab}
                data-size='sm'
              >
                <DsTabs.List className={classes.requestPageTabs}>
                  <DsTabs.Tab
                    value={INCOMING_REQUESTS_TAB}
                    className={classes.requestTab}
                  >
                    {!!receivedRequestsCount && (
                      <Badge
                        {...getBadgeProps(INCOMING_REQUESTS_TAB)}
                        label={receivedRequestsCount}
                      />
                    )}
                    {t('request_page.incoming_requests')}
                  </DsTabs.Tab>
                  <DsTabs.Tab
                    value={SENT_REQUESTS_TAB}
                    className={classes.requestTab}
                  >
                    <Badge
                      {...getBadgeProps(SENT_REQUESTS_TAB)}
                      label={String(resolvedSentRequestCount)}
                    />
                    {t('request_page.sent_requests')}
                  </DsTabs.Tab>
                </DsTabs.List>
                <DsTabs.Panel value={INCOMING_REQUESTS_TAB}>
                  <RequestsTabPanel
                    count={receivedRequestsCount}
                    isLoading={isLoadingReceivedRequests}
                    isError={isReceivedRequestsError}
                    emptyMessageKey='request_page.no_received_requests'
                  >
                    <PendingRequests pendingRequests={pendingRequests.received} />
                  </RequestsTabPanel>
                </DsTabs.Panel>
                <DsTabs.Panel value={SENT_REQUESTS_TAB}>
                  <RequestsTabPanel
                    count={sentRequestCount ?? 0}
                    isLoading={isLoadingSentRequests}
                    isError={isSentRequestsError}
                    emptyMessageKey='request_page.no_sent_requests'
                  >
                    <SentRequestsTabPanel pendingRequests={pendingRequests.sent} />
                  </RequestsTabPanel>
                </DsTabs.Panel>
              </DsTabs>
            </PartyRepresentationProvider>
          </>
        )}
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
