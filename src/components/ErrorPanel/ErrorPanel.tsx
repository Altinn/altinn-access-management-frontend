import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';

import classes from './ErrorPanel.module.css';

export interface ErrorPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  message?: string;
  statusCode?: string;
}

export const ErrorPanel = ({ title, message, statusCode, ...props }: ErrorPanelProps) => {
  const { t } = useTranslation();

  const currentDate = new Date();

  const date = `${currentDate.getDate()}/${
    // javascript is zero-indexed on getMonth
    currentDate.getMonth() + 1
  }/${currentDate.getFullYear()}`;
  const time = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

  return (
    <DsAlert
      {...props}
      color={'danger'}
      data-size='lg'
    >
      <DsHeading
        level={2}
        data-size='sm'
      >
        {title}
      </DsHeading>
      <div>
        <DsParagraph
          data-size='sm'
          className={classes.errorListItem}
        >
          {t('common.error_status_code')}: {statusCode}
        </DsParagraph>
        <DsParagraph
          data-size='sm'
          className={classes.errorListItem}
        >
          {t('common.error_message')}: {message}
        </DsParagraph>
        <DsParagraph
          data-size='sm'
          className={classes.errorListItem}
        >
          {t('common.date')}: {date}
        </DsParagraph>

        <DsParagraph
          data-size='sm'
          className={classes.errorListItem}
        >
          {t('common.time')}: {time}
        </DsParagraph>
      </div>
    </DsAlert>
  );
};
