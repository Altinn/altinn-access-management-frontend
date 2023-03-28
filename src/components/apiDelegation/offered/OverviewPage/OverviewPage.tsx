import { useTranslation } from 'react-i18next';
import * as React from 'react';

import { Page, PageHeader, PageContent, PageSize } from '@/components/reusables';
import { ReactComponent as ApiIcon } from '@/assets/Api.svg';
import { PageContainer } from '@/components/reusables/PageContainer';
import { useMediaQuery } from '@/resources/hooks';

import { OverviewPageContent } from '../../reusables/OverviewPageContent';
import { LayoutState } from '../../reusables/LayoutState';

export const OverviewPage = () => {
  const { t } = useTranslation('common');
  const isSm = useMediaQuery('(max-width: 768px)');

  return (
    <PageContainer>
      <Page size={isSm ? PageSize.Small : PageSize.Medium}>
        <PageHeader icon={<ApiIcon />}>{t('api_delegation.api_delegations')}</PageHeader>
        <PageContent>
          <OverviewPageContent layout={LayoutState.Offered} />
        </PageContent>
      </Page>
    </PageContainer>
  );
};
