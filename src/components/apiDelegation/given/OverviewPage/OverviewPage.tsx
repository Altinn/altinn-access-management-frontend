import { Page, PageHeader, PageContent } from '@altinn/altinn-design-system';
import { useTranslation } from 'react-i18next';
import * as React from 'react';

import { ReactComponent as ApiIcon } from '@/assets/ShakeHands.svg';

import { OverviewPageContent } from '../../reusables/OverviewPageContent';
import { LayoutState } from '../../reusables/LayoutState';
import { PageContainer } from '../../../reusables/PageContainer';

import classes from './OverviewPage.module.css';

export const OverviewPage = () => {
  const { t } = useTranslation('common');

  return (
    <PageContainer>
      <Page>
        <div className={classes.pageHeaderWrapper}>
          <PageHeader icon={<ApiIcon />}>{t('api_delegation.api_delegations')}</PageHeader>
        </div>
        <PageContent>
          <OverviewPageContent layout={LayoutState.Given} />
        </PageContent>
      </Page>
    </PageContainer>
  );
};
