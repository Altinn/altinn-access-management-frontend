import { useTranslation } from 'react-i18next';
import * as React from 'react';

import { Page, PageHeader, PageContent, PageContainer } from '@/components';
import ApiIcon from '@/assets/Api.svg?react';
import { useMediaQuery } from '@/resources/hooks';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';

import { OverviewPageContent } from '../../components/OverviewPageContent';
import { LayoutState } from '../../components/DelegationType';

export const OverviewPage = () => {
  const { t } = useTranslation();
  const isSm = useMediaQuery('(max-width: 768px)');
  useDocumentTitle(t('api_delegation.delegate_page_title'));

  return (
    <PageContainer>
      <Page
        color='dark'
        size={isSm ? 'small' : 'medium'}
      >
        <PageHeader icon={<ApiIcon />}>{t('api_delegation.api_delegations')}</PageHeader>
        <PageContent>
          <OverviewPageContent layout={LayoutState.Offered} />
        </PageContent>
      </Page>
    </PageContainer>
  );
};
