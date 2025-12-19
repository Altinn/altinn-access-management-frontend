import React from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  DsBadge,
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
import { ActiveConsentListItem } from '../consent/types';

export const RequestPage = () => {
  const { t } = useTranslation();

  useRerouteIfRequestPageDisabled();

  useDocumentTitle(t('request_page.page_title'));

  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const { pendingConsents, isLoadingRequests } = useRequests();

  const name = formatDisplayName({
    fullName: reportee?.name || '',
    type: reportee?.type === 'Person' ? 'person' : 'company',
  });

  const totalRequests = pendingConsents ? pendingConsents.length : 0;

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
            <List>
              {isLoadingRequests ? (
                <>
                  <LoadingRequestListItem />
                  <LoadingRequestListItem />
                  <LoadingRequestListItem />
                  <LoadingRequestListItem />
                </>
              ) : (
                <PendingConsents pendingConsents={pendingConsents} />
              )}
              {!isLoadingRequests && totalRequests === 0 && (
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

interface PendingConsentProps {
  pendingConsents: ActiveConsentListItem[] | undefined;
}

const PendingConsents = ({ pendingConsents }: PendingConsentProps) => {
  const { t } = useTranslation();
  return (
    <>
      {pendingConsents?.map((consent) => {
        const actionText = consent.isPoa
          ? t('request_page.request_poa')
          : t('request_page.request_consent');
        return (
          <UserListItem
            key={consent.id}
            id={consent.id}
            name={consent.toParty.name}
            type={'company'}
            linkIcon
            description={`${actionText} (${formatDateToNorwegian(consent.createdDate)})`}
            as={(props) => (
              <Link
                to={`/consent/request?id=${consent.id}`}
                {...props}
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
