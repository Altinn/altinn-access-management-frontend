import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsDialog, DsHeading, DsTextfield } from '@altinn/altinn-components';

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

  let headingText = '';
  switch (mode) {
    case 'email':
      headingText = t('settings_page.alerts_on_email');
      break;
    case 'sms':
      headingText = t('settings_page.alerts_on_sms');
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
      <DsHeading
        level={2}
        data-size='xs'
      >
        {headingText}
      </DsHeading>
      <div className={classes.modalContent}>
        {mode === 'email' && (
          <>
            <DsHeading
              level={3}
              data-size='2xs'
            >
              {t('settings_page.email_label')}
            </DsHeading>
            <DsTextfield
              aria-label={t('settings_page.address_number', { number: 1 })}
              value={'test@email.com'}
            />
          </>
        )}
        {mode === 'sms' && (
          <div>
            <p>{t('settings_page.sms_settings_description')}</p>
            {/* SMS settings form goes here */}
          </div>
        )}
      </div>
    </DsDialog>
  );
};
