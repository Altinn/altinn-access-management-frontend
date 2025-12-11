/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from 'react-i18next';
import { useRouteError } from 'react-router';
import * as React from 'react';
import { DsParagraph } from '@altinn/altinn-components';

import { Page, PageContent, PageContainer } from '@/components';

import { PageNotFound } from './contents/PageNotFound';
import { UnknownError } from './contents/UnknownError';
import classes from './A2ErrorPage.module.css';

export const A2ErrorPage = () => {
  const { t } = useTranslation();
  const error: any = useRouteError();
  const timestamp = new Date();

  const renderContent = () => {
    if (error === null || error?.status === 404) return <PageNotFound />;
    else return <UnknownError />;
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
                {t('common.error_status_code')}: {error?.status}
              </DsParagraph>
              <DsParagraph
                data-size='sm'
                variant='long'
                className={classes.errorMessage}
              >
                {t('common.error_message')}: {error?.error?.message ?? error?.message}
              </DsParagraph>
              {renderContent()}
            </div>
          </PageContent>
        </Page>
      </PageContainer>
    </div>
  );
};
