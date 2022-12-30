import { Page, PageHeader, PageContent } from '@altinn/altinn-design-system';
import { useTranslation } from 'react-i18next';

import { ReactComponent as ApiIcon } from '@/assets/ShakeHands.svg';

import { PageContainer } from '../Reusables/PageContainer';

import classes from './ApiDelegationOverviewPage.module.css';
import { OrgDelegationOverviewPageContent } from './OrgDelegationOverviewPageContent';

export const ApiDelegationOverviewPage = () => {
  const { t } = useTranslation('common');

  return (
    <PageContainer>
      <Page>
        <PageHeader icon={<ApiIcon />}>{t('api_delegation.api_delegations')}</PageHeader>
        <PageContent>
          <div className={classes.pageContent}>
            <OrgDelegationOverviewPageContent />
          </div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
