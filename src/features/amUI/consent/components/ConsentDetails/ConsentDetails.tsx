import React, { useState } from 'react';
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
import cn from 'classnames';

import { useGetConsentQuery, useRevokeConsentMutation } from '@/rtk/features/consentApi';

import { getLanguage } from '../../utils';
import { ConsentRights } from '../ConsentRights/ConsentRights';
import type { ConsentRequestEvents } from '../../types';

import classes from './ConsentDetails.module.css';

interface ConsentDetailsProps {
  consentId: string;
}
export const ConsentDetails = ({ consentId }: ConsentDetailsProps) => {
  const { t, i18n } = useTranslation();
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  const language = getLanguage(i18n.language);

  const {
    data: consent,
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
      setIsPopoverOpen(false);
    } catch {
      // Error is already tracked via revokeConsentError
      setIsPopoverOpen(false);
    }
  };

  const canConsentBeRevoked =
    consent?.consentRequestEvents.every(
      (event) =>
        event.eventType !== 'Rejected' &&
        event.eventType !== 'Revoked' &&
        event.eventType !== 'Deleted',
    ) && new Date(consent.validTo) > new Date();

  const isRevoking = isRevokingConsent || isFetchingConsent;

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
    <div className={classes.consentContainer}>
      {loadConsentError && (
        <DsAlert data-color='danger'>{t('active_consents.load_consent_error')}</DsAlert>
      )}
      {consent && (
        <>
          <ConsentStatus
            events={consent.consentRequestEvents}
            validTo={consent.validTo}
            isPoa={consent.isPoa}
          />
          {canConsentBeRevoked && (
            <DsPopover.TriggerContext>
              <DsPopover.Trigger
                variant='tertiary'
                disabled={isRevoking}
                onClick={() => setIsPopoverOpen(true)}
              >
                <EraserIcon />
                {consent.isPoa
                  ? t('active_consents.revoke_poa')
                  : t('active_consents.revoke_consent')}
              </DsPopover.Trigger>
              <DsPopover
                open={isPopoverOpen}
                placement='bottom'
                className={classes.revokePopover}
                data-color='danger'
                onClose={() => setIsPopoverOpen(false)}
              >
                <DsParagraph className={classes.popoverText}>
                  {consent.isPoa
                    ? t('active_consents.revoke_poa_text')
                    : t('active_consents.revoke_consent_text')}
                </DsParagraph>
                <div className={classes.popoverButtonRow}>
                  <DsButton
                    data-color='danger'
                    disabled={isRevoking}
                    onClick={handleRevokeConsent}
                  >
                    {isRevoking && <DsSpinner aria-label={t('active_consents.revoking_consent')} />}
                    {consent.isPoa
                      ? t('active_consents.confirm_revoke_poa')
                      : t('active_consents.confirm_revoke_consent')}
                  </DsButton>
                  <DsButton
                    variant='tertiary'
                    onClick={() => setIsPopoverOpen(false)}
                  >
                    {t('common.cancel')}
                  </DsButton>
                </div>
              </DsPopover>
            </DsPopover.TriggerContext>
          )}
          {revokeConsentError && (
            <DsAlert data-color='danger'>
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
  isPoa?: boolean;
}

const ConsentStatus = ({ events, validTo, isPoa }: ConsentStatusProps) => {
  const { t } = useTranslation();

  let statusClass = '';
  let statusText = '';

  const hasAcceptEvent = events.some((event) => event.eventType === 'Accepted');
  const hasRevokeEvent = events.some((event) => event.eventType === 'Revoked');
  const isPastValidTo = new Date(validTo) < new Date();

  if (isPastValidTo) {
    statusClass = classes.statusInactive;
    statusText = isPoa
      ? t('active_consents.status_poa_expired')
      : t('active_consents.status_consent_expired');
  } else if (hasAcceptEvent && !hasRevokeEvent) {
    statusClass = classes.statusActive;
    statusText = isPoa
      ? t('active_consents.status_poa_active')
      : t('active_consents.status_consent_active');
  } else if (hasAcceptEvent && hasRevokeEvent) {
    statusClass = classes.statusInactive;
    statusText = isPoa
      ? t('active_consents.status_poa_revoked')
      : t('active_consents.status_consent_revoked');
  }

  return <div className={cn(classes.statusContainer, statusClass)}>{statusText}</div>;
};
