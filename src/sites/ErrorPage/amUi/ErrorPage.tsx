/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from 'react-i18next';
import { useRouteError } from 'react-router';
import * as React from 'react';
import { DsParagraph } from '@altinn/altinn-components';

import { PageNotFound } from './contents/PageNotFound';
import { UnknownError } from './contents/UnknownError';
import classes from './ErrorPage.module.css';
import { ErrorLayoutWrapper } from './ErrorLayoutWrapper';

export const ErrorPage = () => {
  const { t } = useTranslation();
  const error: any = useRouteError();
  const timestamp = new Date();

  const renderContent = () => {
    switch (error.status) {
      case 404:
        return <PageNotFound />;
      default:
        return <UnknownError />;
    }
  };

  return (
    <div>
      <ErrorLayoutWrapper>
        <div className={classes.errorPageWrapper}>
          <div className={classes.errorStatus}>
            <DsParagraph data-size='sm'>
              {t('common.error_status_code')}: {error.status}
            </DsParagraph>
            <DsParagraph data-size='sm'>
              {t('common.time')}: {timestamp.toLocaleString('no-NO')}
            </DsParagraph>
            {error.status !== 404 && (
              <DsParagraph
                data-size='sm'
                variant='long'
              >
                {t('common.error_message')}: {error.error?.message ?? error?.message}
              </DsParagraph>
            )}
          </div>
          {renderContent()}
        </div>
      </ErrorLayoutWrapper>
    </div>
  );
};
