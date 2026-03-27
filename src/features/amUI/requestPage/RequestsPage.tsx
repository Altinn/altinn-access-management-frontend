import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, BadgeVariant, Color, DsTabs, formatDisplayName } from '@altinn/altinn-components';
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
import { RequestsTabPanel } from './RequestsTabPanel';
import classes from './RequestPage.module.css';
import { SentRequestsTabPanel } from './SentRequestsTabPanel';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { getCookie } from '@/resources/Cookie/CookieMethods';

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
  const { data: isAdmin } = useGetIsAdminQuery();
  const { pendingRequests, isLoadingRequests, isError } = useRequests();

  const partyUuid = getCookie('AltinnPartyUuid');
  const { data: sentRequestCount, isLoading: isLoadingSentRequestCount } =
    useGetSentRequestsCountQuery(
      { party: partyUuid || '', status: ['Pending'] },
      { skip: !partyUuid || !isAdmin || !enableRequestSingleRight() },
    );

  const getBadgeProps = (tabValue: string) =>
    selectedTab === tabValue ? selectedTabProps : unselectedTabProps;

  const name = formatDisplayName({
    fullName: reportee?.name || '',
    type: reportee?.type === 'Person' ? 'person' : 'company',
  });

  const receivedRequestsCount = pendingRequests ? pendingRequests.received.length : 0;
  const resolvedSentRequestCount = sentRequestCount ?? 0;

  return (
    <PageWrapper>
      <PageLayoutWrapper>
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
                requests={pendingRequests.received}
                count={receivedRequestsCount}
                isLoading={isLoadingRequests}
                isError={isError}
                emptyMessageKey='request_page.no_received_requests'
              />
            </DsTabs.Panel>
            <DsTabs.Panel value={SENT_REQUESTS_TAB}>
              <SentRequestsTabPanel
                requests={pendingRequests.sent}
                count={resolvedSentRequestCount}
                isLoading={isLoadingRequests}
                isError={isError}
                emptyMessageKey='request_page.no_sent_requests'
              />
            </DsTabs.Panel>
          </DsTabs>
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
