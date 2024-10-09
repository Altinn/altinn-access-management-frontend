/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from 'react-i18next';
import { useRouteError } from 'react-router-dom';
import * as React from 'react';
import { Paragraph } from '@digdir/designsystemet-react';

import { Page, PageContent, PageContainer } from '@/components';

import { PageNotFound } from './contents/PageNotFound';
import { UnknownError } from './contents/UnknownError';
import classes from './ErrorPage.module.css';

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
      <PageContainer>
        <Page>
          <PageContent>
            <div className={classes.errorPageWrapper}>
              <Paragraph
                size='sm'
                className={classes.errorMessage}
              >
                {t('common.time')}: {timestamp.toLocaleString('no-NO')}
              </Paragraph>
              <Paragraph
                size='sm'
                className={classes.errorMessage}
              >
                {t('common.error_status_code')}: {error.status}
              </Paragraph>
              <Paragraph
                size='sm'
                spacing
                className={classes.errorMessage}
              >
                {t('common.error_message')}: {error.error?.message ?? error?.message}
              </Paragraph>
              {renderContent()}
            </div>
          </PageContent>
        </Page>
      </PageContainer>
    </div>
  );
};
