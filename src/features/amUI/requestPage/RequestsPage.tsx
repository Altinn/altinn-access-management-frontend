import React from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Badge,
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

export const RequestPage = () => {
  const { t } = useTranslation();

  useRerouteIfRequestPageDisabled();

  useDocumentTitle(t('request_page.page_title'));

  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const { pendingRequests, isLoadingRequests, isError } = useRequests();

  const name = formatDisplayName({
    fullName: reportee?.name || '',
    type: reportee?.type === 'Person' ? 'person' : 'company',
  });

  const totalRequests = pendingRequests ? pendingRequests.length : 0;

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
          defaultValue='incomingRequests'
          data-size='sm'
        >
          <DsTabs.List className={classes.requestPageTabs}>
            <DsTabs.Tab
              value='incomingRequests'
              className={classes.requestTab}
            >
              {!!totalRequests && (
                <Badge
                  data-size='sm'
                  variant='base'
                  label={totalRequests}
                />
              )}
              {t('request_page.incoming_requests')}
            </DsTabs.Tab>
            <DsTabs.Tab value='sentRequests'>{t('request_page.sent_requests')}</DsTabs.Tab>
          </DsTabs.List>
          <DsTabs.Panel value='incomingRequests'>
            {isError && (
              <div className={classes.errorWrapper}>
                <DsAlert data-color='danger'>
                  {totalRequests > 0
                    ? t('request_page.error_partial_loading_requests')
                    : t('request_page.error_loading_requests')}
                </DsAlert>
              </div>
            )}
            <List>
              {isLoadingRequests ? (
                <>
                  <LoadingRequestListItem />
                  <LoadingRequestListItem />
                  <LoadingRequestListItem />
                  <LoadingRequestListItem />
                </>
              ) : (
                <PendingRequests pendingRequests={pendingRequests} />
              )}
              {!isError && !isLoadingRequests && totalRequests === 0 && (
                <div>{t('request_page.no_received_requests')}</div>
              )}
            </List>
          </DsTabs.Panel>
          <DsTabs.Panel value='sentRequests'>
            <div>{t('request_page.no_sent_requests')}</div>
          </DsTabs.Panel>
        </DsTabs>
      </PageLayoutWrapper>
    </PageWrapper>
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
          toUrl = `/consent/request?id=${request.id}`;
        } else if (request.type === 'systemuser') {
          toUrl = `/systemuser/request?id=${request.id}`;
        } else if (request.type === 'agentsystemuser') {
          toUrl = `/systemuser/agentrequest?id=${request.id}`;
        }
        return (
          <UserListItem
            key={request.id}
            id={request.id}
            name={request.fromPartyName}
            type={request.fromPartyType}
            linkIcon
            description={`${t(request.description)} (${formatDateToNorwegian(request.createdDate)})`}
            as={(props) => (
              <Link
                {...props}
                to={toUrl}
              />
            )}
            controls={t('request_page.process_request')}
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
