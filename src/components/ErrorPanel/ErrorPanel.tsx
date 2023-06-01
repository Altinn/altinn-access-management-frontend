import { Panel, PanelVariant } from '@altinn/altinn-design-system';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { List, ListItem } from '@digdir/design-system-react';

import classes from './ErrorPanel.module.css';

export interface ErrorPanelProps {
  title: string;
  message?: string;
  statusCode?: string;
}

export const ErrorPanel = ({ title, message, statusCode }: ErrorPanelProps) => {
  const { t } = useTranslation('common');

  const currentDate = new Date();
  const date = `${currentDate.getDate()}/${currentDate.getMonth()}/${currentDate.getFullYear()}`;
  const time = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

  return (
    <Panel
      title={title}
      variant={PanelVariant.Error}
      forceMobileLayout
    >
      <div>
        <p className={classes.errorListItem}>
          {t('common.error_status_code')}: {statusCode}
        </p>

        <p className={classes.errorListItem}>
          {t('common.error_message')}: {message}
        </p>

        <p className={classes.errorListItem}>
          {t('common.date')}: {date}
        </p>

        <p className={classes.errorListItem}>
          {t('common.time')}: {time}
        </p>
      </div>
    </Panel>
  );
};
