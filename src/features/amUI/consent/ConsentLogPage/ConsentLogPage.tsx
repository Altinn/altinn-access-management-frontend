import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  Button,
  DsButton,
  DsDialog,
  DsHeading,
  DsLink,
  DsSearch,
  Timeline,
  TimelineActivity,
  TimelineSegment,
} from '@altinn/altinn-components';
import { ArrowLeftIcon, EraserIcon } from '@navikt/aksel-icons';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';

import { PageLayoutWrapper } from '../../common/PageLayoutWrapper';

import classes from './ConsentLogPage.module.css';

export const ConsentLogPage = () => {
  const { t } = useTranslation();

  useDocumentTitle(t('systemuser_request.page_title'));
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <DsDialog
          ref={modalRef}
          className={classes.consentDialog}
          closedby='any'
        >
          <div className={classes.consentContainer}>
            <div>
              <div className={classes.status} />
              Status: Aktivt
            </div>
            <DsButton
              variant='tertiary'
              data-size='sm'
            >
              <EraserIcon />
              Trekk samtykke
            </DsButton>
            <DsHeading
              level={1}
              data-size='md'
            >
              Samtykke gitt til Sparebank1 Sogn og Fjordane
            </DsHeading>
            <div>
              <DsHeading
                level={2}
                data-size='sm'
              >
                Skattegrunnlag
              </DsHeading>
              <div>
                Opplysninger rapportert i forbindelse med skattemeldingen (selvangivelsen) 2023:
              </div>
              <ul>
                <li>Inntekt</li>
                <li>Skattefradrag</li>
                <li>Formue (inkl. bolig, bil og andre verdier)</li>
                <li>Gjeld</li>
              </ul>
              <DsHeading
                level={2}
                data-size='sm'
              >
                Inntektsopplysninger
              </DsHeading>
              <div>
                Opplysninger rapportert av arbeidsgiver eller andre som har utbetalt lønn eller
                ytelser, i perioden 2024-05 til 2024-10:
              </div>
              <ul>
                <li>Utbetalt lønn, næringsinntekt</li>
                <li>Pensjon</li>
                <li>Trygd eller ytelser</li>
                <li>Skattefradrag og forskuddstrekk</li>
              </ul>
              <div>
                Her kan du se inntektsopplysningene Skatteetaten har om deg: Mine inntekter og
                arbeidsforhold.
              </div>
              <div>
                SPAREBANK 1 UTVIKLING DA foretar dette oppslaget på vegne av Sparebank1 Sogn og
                Fjordane
              </div>
            </div>
          </div>
        </DsDialog>
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
                    onClick={() => modalRef.current?.showModal()}
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
                    onClick={() => modalRef.current?.showModal()}
                  >
                    Se avtale
                  </Button>
                </span>
              </TimelineActivity>
            </TimelineSegment>
          </Timeline>
        </div>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
