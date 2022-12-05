import {
  Page,
  PageContent,
  PageHeader,
  SearchField,
  Button,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  List,
} from '@altinn/altinn-design-system';
import type { Key } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { DelegableApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import { softAdd, softRemove } from '@/rtk/features/delegableApi/delegableApiSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import type { DelegableOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';

import { ReactComponent as ApiIcon } from '../../assets/ShakeHands.svg';
import { DeletableListItem } from '../Common/DeletableListItem';

import classes from './ApiDelegationConfirmationPage.module.css';

export const ApiDelegationConfirmationPage = () => {
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenDelegableApiList);
  const chosenOrgs = useAppSelector((state) => state.delegableOrg.chosenDelegableOrgList);
  const dispatch = useAppDispatch();
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const apiListItems = chosenApis.map((api: DelegableApi, index: Key) => {
    return <List key={index}></List>;
  });

  const orgListItems = chosenOrgs.map((org: DelegableOrg, index: Key | null | undefined) => {
    return <List key={index}></List>;
  });

  return (
    <div>
      <div className={classes.page}>
        <Page>
          <PageHeader icon={<ApiIcon />}>{t('api_delegation.give_access_to_new_api')}</PageHeader>
          <PageContent>
            <div className={classes.pageContent}>
              <h2>{t('api_delegation.new_org_accordion_content_text')}</h2>
              <div className={classes.pageContentAccordionsContainer}>
                <div className={classes.apiAccordions}>
                  <h4>{t('api_delegation.businesses_previously_delegated_to')}</h4>
                  <div className={classes.accordionScrollContainer}>{apiListItems}</div>
                </div>
                <div className={classes.apiAccordions}>
                  <h4>{t('api_delegation.businesses_going_to_get_access')}</h4>
                  <div className={classes.accordionScrollContainer}>{orgListItems}</div>
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
