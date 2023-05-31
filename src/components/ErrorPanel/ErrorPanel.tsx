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

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // Note: Months are zero-based, so we add 1
  const currentDay = currentDate.getDate();

  const currentHour = currentDate.getHours();
  const currentMinute = currentDate.getMinutes();
  const currentSecond = currentDate.getSeconds();

  console.log(`Current Date: ${currentDay}/${currentMonth}/${currentYear}`);

  return (
    <Panel
      title={title}
      variant={PanelVariant.Error}
      forceMobileLayout
    >
      <div>
        <List borderStyle='dashed'>
          <ListItem>
            <p className={classes.errorListItem}>
              {t('common.error_status_code')}: {statusCode}
            </p>
          </ListItem>
          <ListItem>
            <p className={classes.errorListItem}>
              {t('common.error_message')}: {message}
            </p>
          </ListItem>
          <ListItem>
            <p className={classes.errorListItem}>{t('common.date')}</p>
          </ListItem>
          <ListItem>
            <p className={classes.errorListItem}>{t('common.time')}:</p>
          </ListItem>
        </List>
      </div>
    </Panel>
  );
};