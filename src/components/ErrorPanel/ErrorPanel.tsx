import { Panel, PanelVariant } from '@altinn/altinn-design-system';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import classes from './ErrorPanel.module.css';

export interface ErrorPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  message?: string;
  statusCode?: string;
}

export const ErrorPanel = ({ title, message, statusCode, ...props }: ErrorPanelProps) => {
  const { t } = useTranslation('common');

  const currentDate = new Date();

  const date = `${currentDate.getDate()}/${
    // javascript is zero-indexed on getMonth
    currentDate.getMonth() + 1
  }/${currentDate.getFullYear()}`;
  const time = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

  return (
    <Panel
      title={title}
      variant={PanelVariant.Error}
      forceMobileLayout
    >
      <div {...props}>
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
