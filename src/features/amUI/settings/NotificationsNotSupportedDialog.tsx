import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';

import classes from './NotificationsNotSupportedDialog.module.css';

export const NotificationsNotSupportedDialog = ({
  open,
  organizationName,
  onClose,
}: {
  open: boolean;
  organizationName: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <DsDialog
      open={open}
      onClose={onClose}
      closedby='any'
    >
      <div className={classes.content}>
        <DsHeading
          level={2}
          data-size='xs'
        >
          {t('settings_page.notifications_not_supported_heading')}
        </DsHeading>
        <DsParagraph>
          {t('settings_page.notifications_not_supported_info', { name: organizationName })}
        </DsParagraph>
        <DsParagraph>{t('settings_page.notifications_not_supported_apology')}</DsParagraph>
        <div>
          <DsButton
            variant='secondary'
            onClick={onClose}
          >
            {t('common.close')}
          </DsButton>
        </div>
      </div>
    </DsDialog>
  );
};
