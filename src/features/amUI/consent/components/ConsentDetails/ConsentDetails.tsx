import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsButton, DsHeading, DsParagraph, DsSpinner } from '@altinn/altinn-components';
import { EraserIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { useGetConsentQuery } from '@/rtk/features/consentApi';

import { getLanguage } from '../../utils';
import { ConsentRights } from '../ConsentRights/ConsentRights';
import type { ConsentRequestEvents, ConsentStatus } from '../../types';

import classes from './ConsentDetails.module.css';

interface ConsentDetailsProps {
  consentId: string;
}
export const ConsentDetails = ({ consentId }: ConsentDetailsProps) => {
  const { t, i18n } = useTranslation();

  const language = getLanguage(i18n.language);

  const {
    data: consent,
    isLoading: isLoadingConsent,
    error: loadConsentError,
  } = useGetConsentQuery({ consentId });

  const canConsentBeRevoked = consent?.consentRequestEvents.every(
    (event) =>
      event.eventType !== 'Rejected' &&
      event.eventType !== 'Revoked' &&
      event.eventType !== 'Deleted',
  );

  return (
    <div className={classes.consentContainer}>
      {isLoadingConsent && <DsSpinner aria-label={t('active_consents.loading_consent')} />}
      {loadConsentError && (
        <DsAlert data-color='danger'>{t('active_consents.load_consent_error')}</DsAlert>
      )}
      {consent && (
        <>
          <ConsentStatus
            events={consent.consentRequestEvents}
            validTo={consent.validTo}
          />
          {canConsentBeRevoked && (
            <DsButton variant='tertiary'>
              <EraserIcon />
              {consent.isPoa
                ? t('active_consents.revoke_poa')
                : t('active_consents.revoke_consent')}
            </DsButton>
          )}
          <DsHeading
            level={1}
            data-size='md'
          >
            {consent.titleAccepted[language]}
          </DsHeading>
          <DsParagraph>{consent.consentMessage[language]}</DsParagraph>
          <DsHeading
            level={2}
            data-size='2xs'
          >
            {consent.serviceIntroAccepted[language]}
          </DsHeading>
          <ConsentRights
            rights={consent.rights}
            language={language}
          />
          <DsParagraph className={classes.expiration}>{consent.expiration[language]}</DsParagraph>
          {consent.handledBy && <DsParagraph>{consent.handledBy[language]}</DsParagraph>}
        </>
      )}
    </div>
  );
};

interface ConsentStatusProps {
  events: ConsentRequestEvents[];
  validTo: string;
}

const ConsentStatus = ({ events, validTo }: ConsentStatusProps) => {
  const { t } = useTranslation();

  let statusClass = '';
  let statusText = '';

  const isAccepted = events.some((event) => event.eventType === 'Accepted');
  const isRevoked = events.some((event) => event.eventType === 'Revoked');
  const isRejected = events.some((event) => event.eventType === 'Rejected');
  const isPastValidTo = new Date(validTo) < new Date();

  if (isAccepted && !isRevoked) {
    statusClass = classes.active;
    statusText = t('active_consents.status_active');
  } else if (isAccepted && isRevoked) {
    statusClass = classes.revoked;
    statusText = t('active_consents.status_revoked');
  } else if (isRejected) {
    statusClass = classes.revoked;
    statusText = 'Avvist'; // trenger vi denne?
  } else if (isPastValidTo) {
    statusClass = classes.revoked;
    statusText = 'Utløpt'; // trenger vi denne?
  }

  return (
    <div className={classes.statusContainer}>
      <div className={cn(classes.statusIcon, statusClass)} />
      <div>
        {t('active_consents.status')}: {statusText}
      </div>
    </div>
  );
};
