import { Page, PageContent, PageHeader } from '@altinn/altinn-design-system';

import { NewApiDelegationsAccordion } from './NewApiDelegationsAccordion';
import classes from './NewApiDelegationsPage.module.css';

export const NewApiDelegationsPage = () => {
  return (
    <Page>
      <PageHeader>Deleger nye APIer</PageHeader>
      <PageContent>
        <div className={classes.pageContent}>
          <div className={classes.newApis_Accordions}>
            <NewApiDelegationsAccordion headerTitle={'API A'} />
          </div>
        </div>
      </PageContent>
    </Page>
  );
};
