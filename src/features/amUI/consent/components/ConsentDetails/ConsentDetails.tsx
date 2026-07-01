import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsButton,
  DsHeading,
  DsParagraph,
  DsPopover,
  DsSpinner,
} from '@altinn/altinn-components';
import { EraserIcon } from '@navikt/aksel-icons';

import { useGetConsentQuery, useRevokeConsentMutation } from '@/rtk/features/consentApi';

import { canConsentBeRevoked, getLanguage, replaceStaticMetadata } from '../../utils';
import { ConsentRights } from '../ConsentRights/ConsentRights';

import classes from './ConsentDetails.module.css';
import { ConsentStatus } from '../ConsentStatus/ConsentStatus';
import { Consent } from '../../types';
import { RevokeConsentPopover } from '../RevokeConsentPopover/RevokeConsentPopover';

interface ConsentDetailsProps {
  consentId: string;
}
export const ConsentDetails = ({ consentId }: ConsentDetailsProps) => {
  const { t, i18n } = useTranslation();

  const language = getLanguage(i18n.language);

  const {
    data: loadedConsent,
    isLoading: isLoadingConsent,
    isFetching: isFetchingConsent,
    error: loadConsentError,
    refetch: refetchConsent,
  } = useGetConsentQuery({ consentId });

  const [revokeConsent, { error: revokeConsentError, isLoading: isRevokingConsent }] =
    useRevokeConsentMutation();

  const handleRevokeConsent = async (): Promise<void> => {
    try {
      await revokeConsent({ consentId }).unwrap();
      await refetchConsent();
    } catch {
      // Error is already tracked via revokeConsentError
    }
  };

  const canBeRevoked = canConsentBeRevoked(loadedConsent?.consentRequestEvents || []);

  const isRevoking = isRevokingConsent || isFetchingConsent;
  const consent = useMemo(() => {
    return loadedConsent
      ? replaceStaticMetadata<Consent>(loadedConsent, [
          'titleAccepted',
          'serviceIntroAccepted',
          'consentMessage',
          'expiration',
          'handledBy',
        ])
      : null;
  }, [loadedConsent]);

  if (isLoadingConsent) {
    return (
      <DsSpinner
        data-size='lg'
        className={classes.consentDetailsSpinner}
        aria-label={t('active_consents.loading_consent')}
      />
    );
  }

  return (
    <>
      {loadConsentError && (
        <DsAlert
          data-color='danger'
          role='alert'
        >
          {t('active_consents.load_consent_error')}
        </DsAlert>
      )}
      {consent && (
        <div className={classes.consentContainer}>
          <div className={classes.consentStatusBlock}>
            <ConsentStatus
              events={consent.consentRequestEvents}
              isPoa={consent.isPoa}
            />
          </div>
          <div className={classes.consentBlock}>
            {canBeRevoked && (
              <RevokeConsentPopover
                isRevoking={isRevoking}
                consentIsPoa={consent.isPoa}
                onRevokeConsent={handleRevokeConsent}
              />
            )}
            {revokeConsentError && (
              <DsAlert
                data-color='danger'
                role='alert'
              >
                {consent.isPoa
                  ? t('active_consents.revoke_poa_error')
                  : t('active_consents.revoke_consent_error')}
              </DsAlert>
            )}
            <DsHeading
              level={1}
              data-size='md'
            >
              {consent.titleAccepted[language]}
            </DsHeading>
            {consent.consentMessage && (
              <DsParagraph>{consent.consentMessage[language]}</DsParagraph>
            )}
            <DsHeading
              level={2}
              data-size='2xs'
            >
              {consent.serviceIntroAccepted[language]}
            </DsHeading>
            <div>
              <ConsentRights
                rights={consent.rights}
                language={language}
              />
              <DsParagraph className={classes.expiration}>
                {consent.expiration[language]}
              </DsParagraph>
            </div>
            {consent.handledBy && <DsParagraph>{consent.handledBy[language]}</DsParagraph>}
          </div>
        </div>
      )}
    </>
  );
};
