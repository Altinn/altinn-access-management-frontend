import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, formatDisplayName } from '@altinn/altinn-components';
import { AmTabs } from '../common/AmTabs/AmTabs';
import { PageWrapper } from '@/components';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import ReporteePageHeading from '../common/ReporteePageHeading';
import { useGetIsAdminQuery, useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { useGetPartyFromLoggedInUserQuery } from '@/rtk/features/lookupApi';
import { hasReporteeListAdminAccess } from '@/resources/utils/permissionUtils';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useRequests } from '@/resources/hooks/useRequests';
import { useGetSentRequestsCountQuery } from '@/rtk/features/requestApi';
import { PendingRequests, RequestsTabPanel } from './RequestsTabPanel';
import { SentRequestsTabPanel } from './SentRequestsTabPanel';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  RestoreFocusFallback,
  RestoreFocusProvider,
  useRestoreFocus,
} from '../common/RestoreFocus';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useSidebarRequestCount } from '@/resources/hooks/useSidebarRequestCount';
import { useTabState } from '@/resources/hooks';

const INCOMING_REQUESTS_TAB = 'incomingRequests';
const SENT_REQUESTS_TAB = 'sentRequests';

export const RequestPage = () => {
  const { t } = useTranslation();
  const restoreFocus = useRestoreFocus();

  useDocumentTitle(t('request_page.page_title'));

  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const { data: isAdmin, isLoading: isLoadingAdmin } = useGetIsAdminQuery();
  const { data: currentUser } = useGetPartyFromLoggedInUserQuery();
  const isCurrentUserReportee = reportee?.partyUuid === currentUser?.partyUuid;
  const showSentRequestsTab = hasReporteeListAdminAccess(reportee, isAdmin, isCurrentUserReportee);

  const [selectedTab, setSelectedTab] = useTabState({
    tabs: showSentRequestsTab
      ? [INCOMING_REQUESTS_TAB, SENT_REQUESTS_TAB]
      : [INCOMING_REQUESTS_TAB],
    defaultTab: INCOMING_REQUESTS_TAB,
  });
  const {
    pendingRequests,
    isLoadingSentRequests,
    isLoadingReceivedRequests,
    isSentRequestsError,
    isReceivedRequestsError,
  } = useRequests({ skipSentRequests: !showSentRequestsTab });

  const partyUuid = getCookie('AltinnPartyUuid');
  const { data: sentRequestCount } = useGetSentRequestsCountQuery(
    { party: partyUuid || '', status: ['Pending'] },
    { skip: !partyUuid || !isAdmin || !showSentRequestsTab },
  );
  const { requestsBadgeCount: receivedRequestCount } = useSidebarRequestCount({
    isAdmin,
    reportee,
    isLoadingPermissions: isLoadingAdmin,
  });

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
              <RestoreFocusProvider restoreFocus={restoreFocus}>
                <RestoreFocusFallback>
                  <ReporteePageHeading
                    title={
                      isCurrentUserReportee
                        ? t('request_page.your_requests_heading')
                        : t('request_page.heading', { name })
                    }
                    reportee={reportee}
                    isLoading={isLoadingReportee}
                  />
                </RestoreFocusFallback>
                <AmTabs
                  value={selectedTab}
                  onChange={setSelectedTab}
                >
                  <AmTabs.List>
                    <AmTabs.Tab
                      value={INCOMING_REQUESTS_TAB}
                      label={t('request_page.incoming_requests')}
                      badge={receivedRequestsCount}
                    />
                    {showSentRequestsTab && (
                      <AmTabs.Tab
                        value={SENT_REQUESTS_TAB}
                        label={t('request_page.sent_requests')}
                        badge={resolvedSentRequestCount}
                      />
                    )}
                  </AmTabs.List>
                  <AmTabs.Panel value={INCOMING_REQUESTS_TAB}>
                    <RequestsTabPanel
                      count={receivedRequestsCount}
                      isLoading={isLoadingReceivedRequests}
                      isError={isReceivedRequestsError}
                      emptyMessage={
                        isCurrentUserReportee
                          ? t('request_page.no_received_requests_you')
                          : t('request_page.no_received_requests', {
                              name: name,
                            })
                      }
                    >
                      <PendingRequests
                        pendingRequests={pendingRequests.received}
                        handledRequests={pendingRequests.handledReceived}
                      />
                    </RequestsTabPanel>
                  </AmTabs.Panel>
                  {showSentRequestsTab && (
                    <AmTabs.Panel value={SENT_REQUESTS_TAB}>
                      <RequestsTabPanel
                        count={sentRequestCount ?? 0}
                        isLoading={isLoadingSentRequests}
                        isError={isSentRequestsError}
                        emptyMessage={
                          isCurrentUserReportee
                            ? t('request_page.no_sent_requests_you')
                            : t('request_page.no_sent_requests', {
                                name: name,
                              })
                        }
                      >
                        <SentRequestsTabPanel
                          pendingRequests={pendingRequests.sent}
                          handledRequests={pendingRequests.handledSent}
                        />
                      </RequestsTabPanel>
                    </AmTabs.Panel>
                  )}
                </AmTabs>
              </RestoreFocusProvider>
            </PartyRepresentationProvider>
          </>
        )}
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
