import { Page, PageHeader, PageContent } from '@altinn/altinn-design-system';
import { useTranslation } from 'react-i18next';
import * as React from 'react';

import { ReactComponent as ApiIcon } from '@/assets/ShakeHands.svg';
import { UserInfoBar } from '@/components/reusables';
import { PageContainer } from '@/components/reusables/PageContainer';

import { OverviewPageContent } from '../../reusables/OverviewPageContent';
import { LayoutState } from '../../reusables/LayoutState';

export const OverviewPage = () => {
  const { t } = useTranslation('common');

  return (
    <div>
      <UserInfoBar></UserInfoBar>
      <PageContainer>
        <Page>
          <PageHeader icon={<ApiIcon />}>{t('api_delegation.api_delegations')} test</PageHeader>
          <PageContent>
            <OverviewPageContent layout={LayoutState.Given} />
          </PageContent>
        </Page>
      </PageContainer>
    </div>
  );
};
