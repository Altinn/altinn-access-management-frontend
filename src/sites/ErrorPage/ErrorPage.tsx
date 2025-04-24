/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from 'react-i18next';
import { useRouteError } from 'react-router';
import * as React from 'react';
import { DsParagraph } from '@altinn/altinn-components';

import { PageNotFound } from './contents/PageNotFound';
import { UnknownError } from './contents/UnknownError';
import classes from './ErrorPage.module.css';

import { Page, PageContent, PageContainer } from '@/components';

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
              <DsParagraph
                data-size='sm'
                className={classes.errorMessage}
              >
                {t('common.time')}: {timestamp.toLocaleString('no-NO')}
              </DsParagraph>
              <DsParagraph
                data-size='sm'
                className={classes.errorMessage}
              >
                {t('common.error_status_code')}: {error.status}
              </DsParagraph>
              <DsParagraph
                data-size='sm'
                variant='long'
                className={classes.errorMessage}
              >
                {t('common.error_message')}: {error.error?.message ?? error?.message}
              </DsParagraph>
              {renderContent()}
            </div>
          </PageContent>
        </Page>
      </PageContainer>
    </div>
  );
};
