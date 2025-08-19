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
    error: loadConsentError,
    refetch: refetchConsent,
  } = useGetConsentQuery({ consentId });

  const [revokeConsent, { error: revokeConsentError, isLoading: isRevokingConsent }] =
    useRevokeConsentMutation();

  const handleRevokeConsent = async (): Promise<void> => {
    try {
      await revokeConsent({ consentId }).unwrap();
      setIsPopoverOpen(false);
      refetchConsent();
    } catch {
      // Error is already tracked via revokeConsentError
    }
  };

  const canConsentBeRevoked =
    consent?.consentRequestEvents.every(
      (event) =>
        event.eventType !== 'Rejected' &&
        event.eventType !== 'Revoked' &&
        event.eventType !== 'Deleted',
    ) && new Date(consent.validTo) > new Date();

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
          />
          {canConsentBeRevoked && (
            <DsPopover.TriggerContext>
              <DsPopover.Trigger
                variant='tertiary'
                disabled={isRevokingConsent}
                onClick={() => setIsPopoverOpen(true)}
              >
                <EraserIcon />
                {consent.isPoa
                  ? t('active_consents.revoke_poa')
                  : t('active_consents.revoke_consent')}
              </DsPopover.Trigger>
              <DsPopover
                open={isPopoverOpen}
                data-color='danger'
                onClose={() => setIsPopoverOpen(false)}
              >
                <DsParagraph>
                  {consent.isPoa
                    ? t('active_consents.revoke_poa_text')
                    : t('active_consents.revoke_consent_text')}
                </DsParagraph>
                <div className={classes.popoverButtonRow}>
                  <DsButton
                    data-color='danger'
                    disabled={isRevokingConsent}
                    onClick={handleRevokeConsent}
                  >
                    {isRevokingConsent && (
                      <DsSpinner aria-label={t('active_consents.revoking_consent')} />
                    )}
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
}

const ConsentStatus = ({ events, validTo }: ConsentStatusProps) => {
  const { t } = useTranslation();

  let statusClass = '';
  let statusText = '';

  const hasAcceptEvent = events.some((event) => event.eventType === 'Accepted');
  const hasRevokeEvent = events.some((event) => event.eventType === 'Revoked');
  const hasRejectEvent = events.some((event) => event.eventType === 'Rejected');
  const isPastValidTo = new Date(validTo) < new Date();

  if (isPastValidTo) {
    statusClass = classes.inactive;
    statusText = t('active_consents.status_expired');
  } else if (hasAcceptEvent && !hasRevokeEvent) {
    statusClass = classes.active;
    statusText = t('active_consents.status_active');
  } else if (hasAcceptEvent && hasRevokeEvent) {
    statusClass = classes.inactive;
    statusText = t('active_consents.status_revoked');
  } else if (hasRejectEvent) {
    statusClass = classes.inactive;
    statusText = t('active_consents.status_rejected'); // trenger vi denne?
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
