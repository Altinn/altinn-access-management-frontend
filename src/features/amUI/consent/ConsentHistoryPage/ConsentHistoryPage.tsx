import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  DsAlert,
  DsDialog,
  DsHeading,
  DsLink,
  DsSkeleton,
  Timeline,
  TimelineActivity,
  TimelineSegment,
} from '@altinn/altinn-components';
import { ArrowLeftIcon } from '@navikt/aksel-icons';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';

import { PageLayoutWrapper } from '../../common/PageLayoutWrapper';
import { ConsentDetails } from '../components/ConsentDetails/ConsentDetails';

import classes from './ConsentHistoryPage.module.css';
import { useGetConsentLogQuery } from '@/rtk/features/consentApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { ConsentTimeline } from './ConsentTimeline';

export const ConsentHistoryPage = () => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [selectedConsentId, setSelectedConsentId] = useState<string>('');

  useDocumentTitle(t('consent_log.page_title'));
  const partyUuid = getCookie('AltinnPartyUuid');

  const {
    data: consentLog,
    isLoading: isLoadingConsentLog,
    error: loadConsentLogError,
  } = useGetConsentLogQuery({ partyId: partyUuid }, { skip: !partyUuid });

  const showConsentDetails = (consentId: string): void => {
    setSelectedConsentId(consentId);
    modalRef.current?.showModal();
  };

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <div className={classes.consentHistoryPage}>
          <DsLink
            asChild={true}
            data-size='md'
            data-color='neutral'
          >
            <Link to={'/consent/active'}>
              <ArrowLeftIcon
                aria-hidden={true}
                fontSize='1.3rem'
              />
              {t('common.back')}
            </Link>
          </DsLink>
          <div>
            <DsHeading
              level={1}
              data-size='md'
            >
              {t('consent_log.heading')}
            </DsHeading>
          </div>
          {isLoadingConsentLog && <LoadingTimeline />}
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
      <TimelineActivity loading>
        <DsSkeleton height={27} />
        <DsSkeleton
          height={21}
          width={160}
        />
        <DsSkeleton
          height={48}
          width={130}
        />
      </TimelineActivity>
    </TimelineSegment>
  );
};
