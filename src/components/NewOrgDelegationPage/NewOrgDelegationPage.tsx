import {
  Page,
  PageContent,
  PageHeader,
  Button,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
} from '@altinn/altinn-design-system';
import type { Key } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { softAdd, softRemove } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import type { DelegableOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';

import { ReactComponent as ApiIcon } from '../../assets/ShakeHands.svg';
import { NewDelegationAccordion, AccordionButtonType } from '../Common/NewDelegationAccordion';

import classes from './NewOrgDelegationPage.module.css';

export const NewOrgDelegationPage = () => {
  const delegableOrgs = useAppSelector((state) => state.delegableOrg.delegableOrgList);
  const chosenOrgs = useAppSelector((state) => state.delegableOrg.chosenDelegableOrgList);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { t } = useTranslation('common');

  const delegableApiAccordions = delegableOrgs.map((org: DelegableOrg, index: Key) => {
    return (
      <NewDelegationAccordion
        title={org.orgName}
        subtitle={org.orgNr}
        hasOrgNr={true}
        description={org.description}
        key={index}
        buttonType={AccordionButtonType.Add}
        callback={() => dispatch(softAdd(org))}
      ></NewDelegationAccordion>
    );
  });

  const chosenApiAccordions = chosenOrgs.map((org: DelegableOrg, index: Key | null | undefined) => {
    return (
      <NewDelegationAccordion
        title={org.orgName}
        subtitle={org.orgNr}
        hasOrgNr={true}
        description={org.description}
        key={index}
        buttonType={AccordionButtonType.Remove}
        callback={() => dispatch(softRemove(org))}
      ></NewDelegationAccordion>
    );
  });

  return (
    <div>
      <div className={classes.page}>
        <Page>
          <PageHeader icon={<ApiIcon />}>Deleger nye APIer</PageHeader>
          <PageContent>
            <div className={classes.pageContent}>
              <h2>{t('api_delegation.new_org_accordion_content_text')}</h2>
              <div className={classes.pageContentAccordionsContainer}>
                <div className={classes.apiAccordions}>
                  <h4>{t('api_delegation.businesses_previously_delegated_to')}</h4>
                  <div className={classes.accordionScrollContainer}>{delegableApiAccordions}</div>
                </div>
                <div className={classes.apiAccordions}>
                  <h4>{t('api_delegation.businesses_going_to_get_access')}</h4>
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
                    onClick={() => navigate(-1)}
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
                    onClick={() => navigate('/api-delegations/new-api')}
                    disabled={chosenOrgs.length === 0}
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
