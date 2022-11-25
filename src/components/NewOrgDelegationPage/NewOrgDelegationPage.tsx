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
import type { Key } from 'react';
import { useTranslation } from 'react-i18next';

import { softAdd, softRemove } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import type { DelegableOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';

import { ReactComponent as ApiIcon } from '../../assets/ShakeHands.svg';

import { NewOrgDelegationAccordion, AccordionButtonType } from './NewApiDelegationAccordion';
import classes from './NewOrgDelegationPage.module.css';

export const NewOrgDelegationPage = () => {
  const delegableOrgs = useAppSelector((state) => state.delegableOrg.delegableOrgList);
  const chosenApis = useAppSelector((state) => state.delegableOrg.chosenDelegableOrgList);
  const dispatch = useAppDispatch();

  const { t } = useTranslation('common');

  const delegableApiAccordions = delegableOrgs.map((org: DelegableOrg, index: Key) => {
    return (
      <NewOrgDelegationAccordion
        title={org.orgName}
        subtitle={org.orgNr}
        hasOrgNr={true}
        description={org.description}
        key={index}
        buttonType={AccordionButtonType.Add}
        callback={() => dispatch(softAdd(org))}
      ></NewOrgDelegationAccordion>
    );
  });

  const chosenApiAccordions = chosenApis.map((org: DelegableOrg, index: Key | null | undefined) => {
    return (
      <NewOrgDelegationAccordion
        title={org.orgName}
        subtitle={org.orgNr}
        hasOrgNr={true}
        description={org.description}
        key={index}
        buttonType={AccordionButtonType.Remove}
        callback={() => dispatch(softRemove(org))}
      ></NewOrgDelegationAccordion>
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
                  <div className={classes.accordionScrollContainer}>{delegableApiAccordions}</div>
                </div>
                <div className={classes.apiAccordions}>
                  <h4>Valgte API:</h4>
                  <div className={classes.accordionScrollContainer}>{chosenApiAccordions}</div>
                </div>
              </div>
              <div className={classes.navButtonContainer}>
                <div className={classes.navButton}>
                  <Button
                    color={ButtonColor.Primary}
                    variant={ButtonVariant.Outline}
                    size={ButtonSize.Small}
                    fullWidth={true}
                  >
                    Forrige
                  </Button>
                </div>
                <div className={classes.navButton}>
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
