import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  Button,
  DsDialog,
  DsHeading,
  DsLink,
  DsSearch,
  Timeline,
  TimelineActivity,
  TimelineSegment,
} from '@altinn/altinn-components';
import { ArrowLeftIcon } from '@navikt/aksel-icons';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';

import { PageLayoutWrapper } from '../../common/PageLayoutWrapper';
import { ActiveConsent } from '../components/ActiveConsent/ActiveConsent';

import classes from './ConsentLogPage.module.css';

export const ConsentLogPage = () => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [selectedConsentId, setSelectedConsentId] = useState<string>('');

  useDocumentTitle(t('systemuser_request.page_title'));

  const showConsentDetails = (consentId: string): void => {
    setSelectedConsentId(consentId);
    modalRef.current?.showModal();
  };

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <div className={classes.consentLogPage}>
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
              Avtalelogg
            </DsHeading>
          </div>
          <DsSearch>
            <DsSearch.Input
              placeholder='Søk i avtaleloggen'
              aria-label='Søk i avtaleloggen'
            />
            <DsSearch.Clear />
          </DsSearch>
          <Timeline>
            <TimelineSegment color='success'>
              <TimelineActivity byline='15. januar 2025 kl. 11.15'>
                Sparebank1 Sogn og Fjorande: Samtykke utløpt
                <span>
                  <Button
                    size='xs'
                    variant='text'
                    onClick={() => showConsentDetails('7e540335-d82f-41e9-8b8f-619336d792b4')}
                  >
                    Se avtale
                  </Button>
                </span>
              </TimelineActivity>
            </TimelineSegment>
            <TimelineSegment color='success'>
              <TimelineActivity byline='15. januar 2025 kl. 11.15'>
                Sparebank1 Sogn og Fjordane: Fikk samtykke fra Mette Grytten
                <div>Utløper 15. januar 2025 kl. 22.22</div>
                <span>
                  <Button
                    size='xs'
                    variant='text'
                    onClick={() => showConsentDetails('7e540335-d82f-41e9-8b8f-619336d792b4')}
                  >
                    Se avtale
                  </Button>
                </span>
              </TimelineActivity>
            </TimelineSegment>
          </Timeline>
        </div>
        <DsDialog
          ref={modalRef}
          className={classes.consentDialog}
          closedby='any'
          onClose={() => setSelectedConsentId('')}
        >
          <div className={classes.consentContainer}>
            {selectedConsentId && <ActiveConsent consentId={selectedConsentId} />}
          </div>
        </DsDialog>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
