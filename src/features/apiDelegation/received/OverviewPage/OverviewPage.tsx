import { useTranslation } from 'react-i18next';
import * as React from 'react';

import { Page, PageHeader, PageContent, PageSize, PageContainer } from '@/components';
import { ReactComponent as ApiIcon } from '@/assets/Api.svg';
import { useMediaQuery } from '@/resources/hooks';

import { OverviewPageContent } from '../../components/OverviewPageContent';
import { LayoutState } from '../../components/LayoutState';

export const OverviewPage = () => {
  const { t } = useTranslation('common');
  const isSm = useMediaQuery('(max-width: 768px)');
  return (
    <div>
      <PageContainer>
        <Page size={isSm ? PageSize.Small : PageSize.Medium}>
          <PageHeader icon={<ApiIcon />}>{t('api_delegation.api_delegations_received')}</PageHeader>
          <PageContent>
            <OverviewPageContent layout={LayoutState.Received} />
          </PageContent>
        </Page>
      </PageContainer>
    </div>
  );
};
