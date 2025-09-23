import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsDialog, DsHeading, DsTextfield } from '@altinn/altinn-components';
import { useGetOrgNotificationAddressesQuery } from '@/rtk/features/settingsApi';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ChatIcon, PaperplaneIcon } from '@navikt/aksel-icons';

import classes from './SettingsModal.module.css';

export const SettingsModal = ({
  mode,
  open,
  onClose,
}: {
  mode: 'email' | 'sms';
  open: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const { actingParty } = usePartyRepresentation();

  const { data: notificationAddresses } = useGetOrgNotificationAddressesQuery(
    actingParty?.orgNumber ?? '',
    { skip: !actingParty?.orgNumber },
  );

  const emailAddresses =
    notificationAddresses?.filter((addr) => addr.email).map((addr) => addr.email) ?? [];
  const phoneNumbers =
    notificationAddresses?.filter((addr) => addr.phone).map((addr) => addr.phone) ?? [];

  let headingText = '';
  let labelText = '';
  let icon = null;
  switch (mode) {
    case 'email':
      headingText = t('settings_page.alerts_on_email');
      labelText = t('settings_page.email_label');
      icon = <PaperplaneIcon fontSize='2rem' />;
      break;
    case 'sms':
      headingText = t('settings_page.alerts_on_sms');
      labelText = t('settings_page.sms_label');
      icon = <ChatIcon fontSize='2rem' />;
      break;
    default:
      return null;
  }

  return (
    <DsDialog
      open={open}
      onClose={onClose}
      closedby='any'
    >
      <div className={classes.modalHeader}>
        {icon}
        <DsHeading
          level={2}
          data-size='xs'
        >
          {headingText}
        </DsHeading>
      </div>

      <div className={classes.modalContent}>
        <DsHeading
          level={3}
          data-size='2xs'
        >
          {labelText}
        </DsHeading>
        <DsTextfield
          aria-label={t('settings_page.address_number', { number: 1 })}
          value={mode === 'email' ? emailAddresses.join(', ') : phoneNumbers.join(', ')}
          readOnly
        />
      </div>
    </DsDialog>
  );
};
