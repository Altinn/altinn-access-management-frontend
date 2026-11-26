import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';

import classes from './SettingsServiceAnnouncement.module.css';

// Feature-flag gated warning banner for planned maintenance on the settings page.
export const SettingsServiceAnnouncement = () => {
  const { t } = useTranslation();

  if (window.featureFlags?.showSettingsPageServiceAnnouncement !== true) {
    return null;
  }

  return (
    <DsAlert
      data-color='warning'
      data-testid='settings-service-announcement'
      className={classes.announcement}
    >
      <DsHeading
        level={2}
        data-size='2xs'
      >
        {t('settings_page.service_announcement_heading')}
      </DsHeading>
      <DsParagraph>{t('settings_page.service_announcement_content')}</DsParagraph>
    </DsAlert>
  );
};
