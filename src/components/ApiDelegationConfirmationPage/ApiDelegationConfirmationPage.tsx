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
  ListItem,
  BorderStyle,
} from '@altinn/altinn-design-system';
import type { Key } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { DelegableApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import { softRemove as softRemoveApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import { softRemove as softRemoveOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import type { DelegableOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';

import { ReactComponent as ApiIcon } from '../../assets/ShakeHands.svg';
import { CompactDeletableListItem } from '../Common/CompactDeletableListItem';

import classes from './ApiDelegationConfirmationPage.module.css';

export const ApiDelegationConfirmationPage = () => {
  const chosenApis = useAppSelector((state) => state.delegableApi.delegableApiList);
  const chosenOrgs = useAppSelector((state) => state.delegableOrg.delegableOrgList);
  const dispatch = useAppDispatch();
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const apiListItems = chosenApis.map((api: DelegableApi, index: Key) => {
    return (
      <List
        key={index}
        borderStyle={BorderStyle.Dashed}
      >
        <CompactDeletableListItem
          removeCallback={() => dispatch(softRemoveApi(api))}
          firstText={api.apiName}
          secondText={api.orgName}
        ></CompactDeletableListItem>
      </List>
    );
  });

  const orgListItems = chosenOrgs.map((org: DelegableOrg, index: Key | null | undefined) => {
    return (
      <List
        key={index}
        borderStyle={BorderStyle.Dashed}
      >
        <CompactDeletableListItem
          removeCallback={() => dispatch(softRemoveOrg(org))}
          firstText={org.orgName}
          secondText={org.orgNr}
        ></CompactDeletableListItem>
      </List>
    );
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
                    onClick={() => navigate(-1)}
                  >
                    {t('api_delegation.previous')}
                  </Button>
                </div>
                <Button
                  color={ButtonColor.Success}
                  variant={ButtonVariant.Filled}
                  size={ButtonSize.Small}
                  onClick={() => navigate('/api-delegations/receipt')}
                >
                  {t('api_delegation.confirm_delegation')}
                </Button>
              </div>
            </div>
          </PageContent>
        </Page>
      </div>
    </div>
  );
};
