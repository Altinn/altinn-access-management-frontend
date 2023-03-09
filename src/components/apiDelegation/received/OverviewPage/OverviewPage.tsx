import { Page, PageHeader, PageContent, PageSize } from '@altinn/altinn-design-system';
import { useTranslation } from 'react-i18next';
import * as React from 'react';

import { ReactComponent as ApiIcon } from '@/assets/ShakeHands.svg';
import { PageContainer } from '@/components/reusables/PageContainer';
import { useMediaQuery } from '@/resources/hooks';

import { OverviewPageContent } from '../../reusables/OverviewPageContent';
import { LayoutState } from '../../reusables/LayoutState';

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
