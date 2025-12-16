import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsDialog,
  DsHeading,
  Timeline,
  TimelineActivity,
  TimelineSegment,
} from '@altinn/altinn-components';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';

import { PageLayoutWrapper } from '../../common/PageLayoutWrapper';
import { ConsentDetails } from '../components/ConsentDetails/ConsentDetails';

import classes from './ConsentHistoryPage.module.css';
import { useGetConsentLogQuery } from '@/rtk/features/consentApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { ConsentTimeline } from './ConsentTimeline';
import { useGetIsAdminQuery } from '@/rtk/features/userInfoApi';
import { hasConsentPermission } from '@/resources/utils/permissionUtils';
import { OldConsentAlert } from '../components/OldConsentAlert/OldConsentAlert';
import { Breadcrumbs } from '../../common/Breadcrumbs/Breadcrumbs';

export const ConsentHistoryPage = () => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [selectedConsentId, setSelectedConsentId] = useState<string>('');

  useDocumentTitle(t('consent_log.page_title'));
  const partyUuid = getCookie('AltinnPartyUuid');

  const { data: isAdmin, isLoading: isLoadingIsAdmin } = useGetIsAdminQuery();
  const hasPermission = hasConsentPermission(isAdmin);

  const {
    data: consentLog,
    isLoading: isLoadingConsentLog,
    error: loadConsentLogError,
  } = useGetConsentLogQuery({ partyId: partyUuid }, { skip: !partyUuid || !hasPermission });

  const isLoading = isLoadingIsAdmin || isLoadingConsentLog;

  const showConsentDetails = (consentId: string): void => {
    setSelectedConsentId(consentId);
    modalRef.current?.showModal();
  };

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <Breadcrumbs items={['root', 'consent', 'consent_log']} />
        <DsHeading
          level={1}
          data-size='sm'
          className={classes.consentLogTopHeader}
        >
          {t('consent_log.heading')}
        </DsHeading>
        <OldConsentAlert
          heading='consent_log.altinn2_consent_alert_header'
          text='consent_log.altinn2_consent_alert_body'
        />
        <div className={classes.consentHistoryPage}>
          {!isLoading && !hasPermission && <div>{t('consent_log.no_consent_log_permission')}</div>}
          {isLoading && <LoadingTimeline />}
          {loadConsentLogError && (
            <DsAlert data-color='danger'>{t('consent_log.loading_consent_log_error')}</DsAlert>
          )}
          {consentLog && (
            <ConsentTimeline
              consentLog={consentLog}
              showConsentDetails={showConsentDetails}
            />
          )}
        </div>
        <DsDialog
          ref={modalRef}
          className={classes.consentDialog}
          closedby='any'
          onClose={() => setSelectedConsentId('')}
        >
          {selectedConsentId && <ConsentDetails consentId={selectedConsentId} />}
        </DsDialog>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

const LoadingTimeline = () => {
  return (
    <Timeline>
      <LoadingTimelineItem />
      <LoadingTimelineItem />
      <LoadingTimelineItem />
    </Timeline>
  );
};

const LoadingTimelineItem = () => {
  return (
    <TimelineSegment loading>
      <TimelineActivity
        loading
        byline='xxxxxxxxxxxxxxxxxxxxx'
      >
        xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      </TimelineActivity>
      <TimelineActivity loading>xxxxxxxxxxx</TimelineActivity>
    </TimelineSegment>
  );
};
