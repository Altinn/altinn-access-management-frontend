import React, { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  BadgeVariant,
  Color,
  DsAlert,
  DsTabs,
  formatDisplayName,
  List,
  UserListItem,
} from '@altinn/altinn-components';
import { PageWrapper } from '@/components';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { useRerouteIfRequestPageDisabled } from '@/resources/utils/featureFlagUtils';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import ReporteePageHeading from '../common/ReporteePageHeading';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { formatDateToNorwegian } from '@/resources/utils';
import { useRequests } from '@/resources/hooks/useRequests';
import classes from './RequestPage.module.css';
import { Request } from './types';
import {
  getSystemUserAgentRequestUrl,
  getSystemUserRequestUrl,
} from '@/routes/paths/systemUserPath';
import { getConsentRequestUrl } from '@/routes/paths/consentPath';

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
  const { pendingRequests, isLoadingRequests, isError } = useRequests();

  const getBadgeProps = (tabValue: string) =>
    selectedTab === tabValue ? selectedTabProps : unselectedTabProps;

  const name = formatDisplayName({
    fullName: reportee?.name || '',
    type: reportee?.type === 'Person' ? 'person' : 'company',
  });

  const receivedRequestsCount = pendingRequests ? pendingRequests.received.length : 0;
  const sentRequestCount = pendingRequests ? pendingRequests.sent.length : 0;

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <Breadcrumbs items={['root', 'requests']} />
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
                label={sentRequestCount}
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
            <RequestsTabPanel
              requests={pendingRequests.sent}
              count={sentRequestCount}
              isLoading={isLoadingRequests}
              isError={isError}
              emptyMessageKey='request_page.no_sent_requests'
            />
          </DsTabs.Panel>
        </DsTabs>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

interface RequestsTabPanelProps {
  requests: Request[] | undefined;
  count: number;
  isLoading: boolean;
  isError: boolean;
  emptyMessageKey: string;
}

const RequestsTabPanel = ({
  requests,
  count,
  isLoading,
  isError,
  emptyMessageKey,
}: RequestsTabPanelProps) => {
  const { t } = useTranslation();
  return (
    <>
      {isError && (
        <div className={classes.errorWrapper}>
          <DsAlert data-color='danger'>
            {count > 0
              ? t('request_page.error_partial_loading_requests')
              : t('request_page.error_loading_requests')}
          </DsAlert>
        </div>
      )}
      <List>
        {isLoading ? (
          <>
            <LoadingRequestListItem />
            <LoadingRequestListItem />
            <LoadingRequestListItem />
            <LoadingRequestListItem />
          </>
        ) : (
          <PendingRequests pendingRequests={requests} />
        )}
        {!isError && !isLoading && count === 0 && <div>{t(emptyMessageKey)}</div>}
      </List>
    </>
  );
};

interface PendingRequestsProps {
  pendingRequests: Request[] | undefined;
}

const PendingRequests = ({ pendingRequests }: PendingRequestsProps) => {
  const { t } = useTranslation();
  return (
    <>
      {pendingRequests?.map((request) => {
        let toUrl = '';
        if (request.type === 'consent') {
          toUrl = getConsentRequestUrl(request.id, 'landingpage');
        } else if (request.type === 'systemuser') {
          toUrl = getSystemUserRequestUrl(request.id, 'landingpage');
        } else if (request.type === 'agentsystemuser') {
          toUrl = getSystemUserAgentRequestUrl(request.id, 'landingpage');
        }
        return (
          <UserListItem
            key={request.id}
            id={request.id}
            name={request.fromPartyName}
            type={request.fromPartyType}
            linkIcon
            description={`${request.description ? t(request.description) : t('request_page.asks_for_number', { number: request.numberOfRequests })} (${formatDateToNorwegian(request.createdDate)})`}
            as={(props) => (
              <Link
                {...props}
                to={toUrl}
              />
            )}
            controls={
              <div className={classes.requestItemBadge}>{t('request_page.process_request')}</div>
            }
          />
        );
      })}
    </>
  );
};

const LoadingRequestListItem = () => {
  return (
    <UserListItem
      id={''}
      name={'xxxxxxxxxxxx'}
      description='xxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      type={'person'}
      interactive={false}
      loading
    />
  );
};
