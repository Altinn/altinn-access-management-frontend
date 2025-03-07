import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Heading, Paragraph } from '@digdir/designsystemet-react';

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
    <Alert
      {...props}
      color={'danger'}
      data-size='lg'
    >
      <Heading
        level={2}
        data-size='sm'
      >
        {title}
      </Heading>
      <div>
        <Paragraph
          data-size='sm'
          className={classes.errorListItem}
        >
          {t('common.error_status_code')}: {statusCode}
        </Paragraph>
        <Paragraph
          data-size='sm'
          className={classes.errorListItem}
        >
          {t('common.error_message')}: {message}
        </Paragraph>
        <Paragraph
          data-size='sm'
          className={classes.errorListItem}
        >
          {t('common.date')}: {date}
        </Paragraph>

        <Paragraph
          data-size='sm'
          className={classes.errorListItem}
        >
          {t('common.time')}: {time}
        </Paragraph>
      </div>
    </Alert>
  );
};
