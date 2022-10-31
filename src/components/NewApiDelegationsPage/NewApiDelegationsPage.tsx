import { Page, PageContent, PageHeader } from '@altinn/altinn-design-system';

import { ReactComponent as ApiIcon } from '../../assets/api.svg';

import { NewApiDelegationsAccordion } from './NewApiDelegationsAccordion';
import classes from './NewApiDelegationsPage.module.css';

export const NewApiDelegationsPage = () => {
  return (
    <div className={classes.pageContainer}>
      <Page>
        <PageHeader icon={<ApiIcon />}>Deleger nye APIer</PageHeader>
        <PageContent>
          <div className={classes.pageContent}>
            <h2>Gi tilgang til API</h2>
            <h3>Velg hvilke API du vil gi tilgang til</h3>

            <div className={classes.pageContentAccordionsContainer}>
              <div className={classes.apiAccordions}>
                <h4>Delegerbare API:</h4>
                <NewApiDelegationsAccordion
                  headerTitle={'API A'}
                  content={'Innhold'}
                />
              </div>
              <div className={classes.apiAccordions}>
                <h4>Valgte API:</h4>
                <NewApiDelegationsAccordion
                  headerTitle={'API B'}
                  content={'Innhold'}
                />
              </div>
            </div>
          </div>
        </PageContent>
      </Page>
    </div>
  );
};
