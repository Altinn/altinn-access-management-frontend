import {
  Page,
  PageContent,
  PageHeader,
  Button,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  PopoverPanel,
  PanelVariant,
} from '@altinn/altinn-design-system';
import type { Key } from 'react';
import { useState } from 'react';
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

  const [open, setOpen] = useState(false);
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
      <div className={classes.page}>
        <Page>
          <PageHeader icon={<ApiIcon />}>Deleger nye APIer</PageHeader>
          <PageContent>
            <div className={classes.pageContent}>
              <h3>{t('api_delegation.new_org_accordion_content_text')}</h3>
              <div className={classes.pageContentAccordionsContainer}>
                <div className={classes.apiAccordions}>
                  <h5>{t('api_delegation.businesses_previously_delegated_to')}</h5>
                  <div className={classes.accordionScrollContainer}>{delegableApiAccordions}</div>
                </div>
                <div className={classes.apiAccordions}>
                  <h5>{t('api_delegation.businesses_going_to_get_access')}</h5>
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
                    {t('api_delegation.previous')}
                  </Button>
                </div>
                <div className={classes.navButton}>
                  <Button
                    color={ButtonColor.Primary}
                    variant={ButtonVariant.Filled}
                    size={ButtonSize.Small}
                    fullWidth={true}
                  >
                    {t('api_delegation.next')}
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
