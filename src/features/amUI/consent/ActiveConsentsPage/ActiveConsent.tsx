import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { EraserIcon } from '@navikt/aksel-icons';

import type { Consent } from '../types';
import { getLanguage } from '../utils';
import { ConsentRights } from '../components/ConsentRights/ConsentRights';

import classes from './ActiveConsent.module.css';

interface ActiveConsentProps {
  consent: Consent;
}
export const ActiveConsent = ({ consent }: ActiveConsentProps) => {
  const { i18n } = useTranslation();

  const language = getLanguage(i18n.language);

  return (
    <div className={classes.consentContainer}>
      <div className={classes.statusContainer}>
        <div className={classes.statusIcon} />
        <div>Status: Aktivt</div>
      </div>
      <DsButton variant='tertiary'>
        <EraserIcon />
        {consent.isPoa ? 'Trekk fullmakt' : 'Trekk samtykke'}
      </DsButton>
      <DsHeading
        level={1}
        data-size='md'
      >
        {consent.isPoa
          ? `Fullmakt for ${consent.toPartyName}`
          : `Samtykke gitt til ${consent.toPartyName}`}
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
    </div>
  );
};
