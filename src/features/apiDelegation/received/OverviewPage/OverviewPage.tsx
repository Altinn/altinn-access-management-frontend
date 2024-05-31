import { useTranslation } from 'react-i18next';
import * as React from 'react';

import { Page, PageHeader, PageContent, PageContainer } from '@/components';
import ApiIcon from '@/assets/Api.svg?react';
import { useMediaQuery } from '@/resources/hooks';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';

import { OverviewPageContent } from '../../components/OverviewPageContent';
import { LayoutState } from '../../components/LayoutState';

export const OverviewPage = () => {
  const { t } = useTranslation('common');
  const isSm = useMediaQuery('(max-width: 768px)');
  useDocumentTitle(t('api_delegation.received_page_title'));

  return (
    <div>
      <PageContainer>
        <Page
          color='dark'
          size={isSm ? 'small' : 'medium'}
        >
          <PageHeader icon={<ApiIcon />}>{t('api_delegation.api_delegations_received')}</PageHeader>
          <PageContent>
            <OverviewPageContent layout={LayoutState.Received} />
          </PageContent>
        </Page>
      </PageContainer>
    </div>
  );
};
