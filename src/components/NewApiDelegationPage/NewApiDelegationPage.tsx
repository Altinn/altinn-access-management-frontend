import {
  Page,
  PageContent,
  PageHeader,
  SearchField,
  Button,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
} from '@altinn/altinn-design-system';

import { ReactComponent as ApiIcon } from '../../assets/api.svg';
import { useAppSelector } from '../../rtk/app/hooks';

import { NewApiDelegationAccordion, AccordionButtonType } from './NewApiDelegationAccordion';
import classes from './NewApiDelegationPage.module.css';

export const NewApiDelegationsPage = () => {
  const delegableOrgApis = useAppSelector((state) => state.delegableOrgApi.delegableOrgApiList);
  const chosenOrgApis = useAppSelector((state) => state.delegableOrgApi.chosenDelegableOrgApiList);

  const delegableApiAccordions = delegableOrgApis.map((api, index) => {
    return (
      <NewApiDelegationAccordion
        delegableApi={api}
        key={index}
        buttonType={AccordionButtonType.Add}
      ></NewApiDelegationAccordion>
    );
  });

  const chosenApiAccordions = chosenOrgApis.map((api, index) => {
    return (
      <NewApiDelegationAccordion
        delegableApi={api}
        key={index}
        buttonType={AccordionButtonType.Remove}
      ></NewApiDelegationAccordion>
    );
  });

  return (
    <div>
      <div className={classes.pageContainer}>
        <Page>
          <PageHeader icon={<ApiIcon />}>Deleger nye APIer</PageHeader>
          <PageContent>
            <div className={classes.pageContent}>
              <h2>Gi tilgang til API</h2>
              <h3>Velg hvilke API du vil gi tilgang til ved å klikke på pluss-tegnet.</h3>
              <div className={classes.searchField}>
                <SearchField></SearchField>
              </div>
              <div className={classes.pageContentAccordionsContainer}>
                <div className={classes.apiAccordions}>
                  <h4>Delegerbare API:</h4>
                  {delegableApiAccordions}
                </div>
                <div className={classes.apiAccordions}>
                  <h4>Valgte API:</h4>
                  {chosenApiAccordions}
                </div>
              </div>
              <div className={classes.buttonContainer}>
                <div className={classes.button}>
                  <Button
                    color={ButtonColor.Primary}
                    variant={ButtonVariant.Outline}
                    size={ButtonSize.Small}
                    fullWidth={true}
                  >
                    Forrige
                  </Button>
                </div>
                <div className={classes.button}>
                  <Button
                    color={ButtonColor.Primary}
                    variant={ButtonVariant.Filled}
                    size={ButtonSize.Small}
                    fullWidth={true}
                  >
                    Neste
                  </Button>
                </div>
              </div>
            </div>
          </PageContent>
        </Page>
      </div>
    </div>
  );
};
