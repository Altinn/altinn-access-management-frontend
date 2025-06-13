import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { EraserIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { useGetConsentQuery } from '@/rtk/features/consentApi';

import { getLanguage } from '../utils';
import { ConsentRights } from '../components/ConsentRights/ConsentRights';

import classes from './ActiveConsent.module.css';

interface ActiveConsentProps {
  consentId: string;
}
export const ActiveConsent = ({ consentId }: ActiveConsentProps) => {
  const { i18n } = useTranslation();

  const language = getLanguage(i18n.language);

  const {
    data: consent,
    isLoading: isLoadingConsent,
    error: loadConsentError,
  } = useGetConsentQuery({ consentId });

  return (
    <div className={classes.consentContainer}>
      {isLoadingConsent && <div>Laster samtykke...</div>}
      {loadConsentError && <div>Kunne ikke laste samtykke</div>}
      {consent && (
        <>
          <ConsentStatus status={consent.isPoa ? 'Aktivt' : 'Trukket'} />
          <DsButton variant='tertiary'>
            <EraserIcon />
            {consent.isPoa ? 'Trekk fullmakt' : 'Trekk samtykke'}
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
          <div>
            {consent.rights.map((right) => (
              <ConsentRights
                key={right.identifier}
                language={language}
                right={right}
              />
            ))}
          </div>
          <DsParagraph className={classes.expiration}>{consent.expiration[language]}</DsParagraph>
          {consent.handledBy && <DsParagraph>{consent.handledBy[language]}</DsParagraph>}
        </>
      )}
    </div>
  );
};

interface ConsentStatusProps {
  status: string;
}

const ConsentStatus = ({ status }: ConsentStatusProps) => {
  const statusClass = status === 'Aktivt' ? classes.active : classes.revoked;
  return (
    <div className={classes.statusContainer}>
      <div className={cn(classes.statusIcon, statusClass)} />
      <div>Status: {status}</div>
    </div>
  );
};
