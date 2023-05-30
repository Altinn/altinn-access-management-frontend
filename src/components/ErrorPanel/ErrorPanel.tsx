import { Panel, PanelVariant } from '@altinn/altinn-design-system';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { List, ListItem } from '@digdir/design-system-react';

import classes from './ErrorPanel.module.css';

export interface ErrorPanelProps {
  title: string;
  message?: string;
  statusCode?: string;
  timeStamp?: string;
}

export const ErrorPanel = ({ title, message, statusCode, timeStamp }: ErrorPanelProps) => {
  const { t } = useTranslation('common');

  return (
    <Panel
      title={title}
      variant={PanelVariant.Error}
      forceMobileLayout
    >
      <div>
        <List borderStyle='dashed'>
          <ListItem>
            <div className={classes.errorListItem}>
              {t('common.error_status_code')}: {statusCode}
            </div>
          </ListItem>
          <ListItem>
            <div className={classes.errorListItem}>
              {t('common.error_message')}: {message}
            </div>
          </ListItem>
          <ListItem>
            <div className={classes.errorListItem}>
              {t('common.error_time_stamp')}: {timeStamp}
            </div>
          </ListItem>
        </List>
      </div>
    </Panel>
  );
};
