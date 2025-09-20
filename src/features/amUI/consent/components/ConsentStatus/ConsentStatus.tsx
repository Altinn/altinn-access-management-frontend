import React from 'react';
import { ConsentRequestEvent } from '../../types';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import classes from './ConsentStatus.module.css';

interface ConsentStatusProps {
  events: ConsentRequestEvent[];
  isPoa?: boolean;
}

export const ConsentStatus = ({ events, isPoa }: ConsentStatusProps) => {
  const { t } = useTranslation();

  let statusClass = '';
  let statusText = '';

  const hasAcceptEvent = events.some((event) => event.eventType === 'Accepted');
  const hasRevokeEvent = events.some(
    (event) => event.eventType === 'Revoked' || event.eventType === 'Deleted',
  );
  const hasExpiredEvent = events.some((event) => event.eventType === 'Expired');

  // if consent is revoked and has expired, only show revoked status
  if (hasAcceptEvent && hasRevokeEvent) {
    statusClass = classes.statusInactive;
    statusText = isPoa
      ? t('active_consents.status_poa_revoked')
      : t('active_consents.status_consent_revoked');
  } else if (hasExpiredEvent) {
    statusClass = classes.statusInactive;
    statusText = isPoa
      ? t('active_consents.status_poa_expired')
      : t('active_consents.status_consent_expired');
  } else if (hasAcceptEvent && !hasRevokeEvent) {
    statusClass = classes.statusActive;
    statusText = isPoa
      ? t('active_consents.status_poa_active')
      : t('active_consents.status_consent_active');
  }

  if (!statusText) {
    return null;
  }

  return <div className={cn(classes.statusContainer, statusClass)}>{statusText}</div>;
};
