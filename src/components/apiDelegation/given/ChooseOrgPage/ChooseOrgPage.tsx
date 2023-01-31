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
import * as React from 'react';

import { softAddOrg, softRemoveOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import type { DelegableOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { ReactComponent as ApiIcon } from '@/assets/ShakeHands.svg';
import {
  NewDelegationAccordion,
  NewDelegationAccordionButtonType,
} from '@/components/reusables/NewDelegationAccordion';
import { RouterPath } from '@/routes/Router';
import { PageContainer } from '@/components/reusables/PageContainer';

import classes from './ChooseOrgPage.module.css';

export const ChooseOrgPage = () => {
  const delegableOrgs = useAppSelector((state) => state.delegableOrg.delegableOrgList);
  const chosenOrgs = useAppSelector((state) => state.delegableOrg.chosenDelegableOrgList);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { t } = useTranslation('common');

  const delegableApiAccordions = delegableOrgs.map((org: DelegableOrg, index: Key) => {
    return (
      <NewDelegationAccordion
        title={org.orgName}
        subtitle={t('api_delegation.org_nr') + ' ' + org.orgNr}
        key={index}
        buttonType={NewDelegationAccordionButtonType.Add}
        addRemoveClick={() => dispatch(softAddOrg(org))}
      ></NewDelegationAccordion>
    );
  });

  const chosenApiAccordions = chosenOrgs.map((org: DelegableOrg, index: Key | null | undefined) => {
    return (
      <NewDelegationAccordion
        title={org.orgName}
        subtitle={t('api_delegation.org_nr') + ' ' + org.orgNr}
        key={index}
        buttonType={NewDelegationAccordionButtonType.Remove}
        addRemoveClick={() => dispatch(softRemoveOrg(org))}
      ></NewDelegationAccordion>
    );
  });

  return (
    <PageContainer>
      <Page>
        <PageHeader icon={<ApiIcon />}>{t('api_delegation.give_access_to_new_api')}</PageHeader>
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
                  onClick={() =>
                    navigate(
                      '/' + RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiOverview,
                    )
                  }
                >
                  {t('api_delegation.cancel')}
                </Button>
              </div>
              <div className={classes.navButton}>
                <Button
                  color={ButtonColor.Primary}
                  variant={ButtonVariant.Filled}
                  size={ButtonSize.Small}
                  fullWidth={true}
                  onClick={() =>
                    navigate(
                      '/' + RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiChooseApi,
                    )
                  }
                  disabled={chosenOrgs.length === 0}
                >
                  {t('api_delegation.next')}
                </Button>
              </div>
            </div>
          </div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
