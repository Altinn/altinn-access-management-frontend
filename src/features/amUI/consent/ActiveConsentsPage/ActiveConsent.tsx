import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsButton, DsHeading, DsParagraph, DsSpinner } from '@altinn/altinn-components';
import { EraserIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { useGetConsentQuery } from '@/rtk/features/consentApi';

import { getLanguage } from '../utils';
import { ConsentRights } from '../components/ConsentRights/ConsentRights';
import type { ConsentStatus } from '../types';

import classes from './ActiveConsent.module.css';

interface ActiveConsentProps {
  consentId: string;
}
export const ActiveConsent = ({ consentId }: ActiveConsentProps) => {
  const { t, i18n } = useTranslation();

  const language = getLanguage(i18n.language);

  const {
    data: consent,
    isLoading: isLoadingConsent,
    error: loadConsentError,
  } = useGetConsentQuery({ consentId });

  return (
    <div className={classes.consentContainer}>
      {isLoadingConsent && <DsSpinner aria-label={t('active_consents.loading_consent')} />}
      {loadConsentError && (
        <DsAlert data-color='danger'>{t('active_consents.load_consent_error')}</DsAlert>
      )}
      {consent && (
        <>
          <ConsentStatus status={consent.status} />
          <DsButton variant='tertiary'>
            <EraserIcon />
            {consent.isPoa ? t('active_consents.revoke_poa') : t('active_consents.revoke_consent')}
          </DsButton>
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
  status: ConsentStatus;
}

const ConsentStatus = ({ status }: ConsentStatusProps) => {
  const { t } = useTranslation();

  let statusClass = '';
  let statusText = '';
  if (status === 'Accepted') {
    statusClass = classes.active;
    statusText = t('active_consents.status_active');
  } else if (status === 'Revoked') {
    statusClass = classes.revoked;
    statusText = t('active_consents.status_revoked');
  }
  // Trenger vi egen status for expired??
  return (
    <div className={classes.statusContainer}>
      <div className={cn(classes.statusIcon, statusClass)} />
      <div>
        {t('active_consents.status')}: {statusText}
      </div>
    </div>
  );
};
