import { Page, PageHeader, PageContent } from '@altinn/altinn-design-system';
import { useTranslation } from 'react-i18next';

import { ReactComponent as ApiIcon } from '@/assets/ShakeHands.svg';

import { OverviewPageContent } from '../../reusables/OverviewPageContent';
import { LayoutState } from '../../reusables/LayoutState';

import classes from './OverviewPage.module.css';

export const OverviewPage = () => {
  const { t } = useTranslation('common');

  return (
    <div className={classes.page}>
      <Page>
        <PageHeader icon={<ApiIcon />}>{t('api_delegation.api_delegations')}</PageHeader>
        <PageContent>
          <div className={classes.pageContent}>
            <OverviewPageContent layout={LayoutState.Given} />
          </div>
        </PageContent>
      </Page>
    </div>
  );
};
