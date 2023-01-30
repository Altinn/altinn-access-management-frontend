import {
  Page,
  PageContent,
  PageHeader,
  Button,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  SearchField,
  List,
  ListItem,
  BorderStyle,
} from '@altinn/altinn-design-system';
import type { Key } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as React from 'react';
import { useState, useEffect } from 'react';

import {
  softAddOrg,
  softRemoveOrg,
  searchInCurrentOrgs,
  lookupOrg,
} from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import type { DelegableOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { ReactComponent as ApiIcon } from '@/assets/ShakeHands.svg';
import {
  NewDelegationAccordion,
  NewDelegationAccordionButtonType,
} from '@/components/Reusables/NewDelegationAccordion';
import { RouterPath } from '@/routes/Router';
import { ReactComponent as MinusCircle } from '@/assets/MinusCircle.svg';
import { ReactComponent as AddCircle } from '@/assets/AddCircle.svg';

import { PageContainer } from '../Reusables/PageContainer';

import classes from './NewOrgDelegationPage.module.css';

export const NewOrgDelegationPage = () => {
  const delegableOrgs = useAppSelector((state) => state.delegableOrg.presentedOrgList);
  const chosenOrgs = useAppSelector((state) => state.delegableOrg.chosenDelegableOrgList);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchString, setSearchString] = useState('');
  const fetchLookupOrg = () => dispatch(lookupOrg(searchString));

  const { t } = useTranslation('common');

  const handleSoftRemove = (org: DelegableOrg) => {
    dispatch(softRemoveOrg(org));
    dispatch(searchInCurrentOrgs(searchString));
  };

  function handleSearch(searchText: string) {
    setSearchString(searchText);
    dispatch(searchInCurrentOrgs(searchText));
  }

  useEffect(() => {
    if (delegableOrgs.length === 0 && searchString.length === 9) {
      fetchLookupOrg();
    }
  }, [delegableOrgs]);

  const delegableOrgItems = delegableOrgs.map((org: DelegableOrg, index: Key) => {
    return (
      <ListItem key={index}>
        <div className={classes.listItem}>
          <div>
            <h4 className={classes.listTitle}>{org.orgName}</h4>
            <div className={classes.subtitle}>{org.orgNr}</div>
          </div>
          <Button
            className={classes.actionButton}
            icon={<AddCircle />}
            variant={ButtonVariant.Quiet}
            color={ButtonColor.Success}
            onClick={() => dispatch(softAddOrg(org))}
            aria-label={'soft-add'}
          ></Button>
        </div>
      </ListItem>
    );
  });

  const chosenApiItems = chosenOrgs.map((org: DelegableOrg, index: Key | null | undefined) => {
    return (
      <ListItem key={index}>
        <div className={classes.listItem}>
          <div>
            <h4 className={classes.listTitle}>{org.orgName}</h4>
            <div className={classes.subtitle}>{org.orgNr}</div>
          </div>
          <Button
            className={classes.actionButton}
            icon={<MinusCircle />}
            variant={ButtonVariant.Quiet}
            color={ButtonColor.Danger}
            onClick={() => handleSoftRemove(org)}
            aria-label={'soft-remove'}
          ></Button>
        </div>
      </ListItem>
    );
  });

  return (
    <PageContainer>
      <Page>
        <PageHeader icon={<ApiIcon />}>{t('api_delegation.give_access_to_new_api')}</PageHeader>
        <PageContent>
          <div className={classes.pageContent}>
            <h2>{t('api_delegation.new_org_accordion_content_text')}</h2>
            <div className={classes.searchSection}>
              <SearchField
                label={String(t('api_delegation.search_for_buisness'))}
                value={searchString}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleSearch(event.target.value)
                }
              ></SearchField>
            </div>
            <div className={classes.pageContentAccordionsContainer}>
              <div className={classes.apiAccordions}>
                <h4>{t('api_delegation.businesses_previously_delegated_to')}</h4>
                <div className={classes.accordionScrollContainer}>
                  <List borderStyle={BorderStyle.Solid}>{delegableOrgItems}</List>
                </div>
              </div>
              <div className={classes.apiAccordions}>
                <h4>{t('api_delegation.businesses_going_to_get_access')}</h4>
                <div className={classes.accordionScrollContainer}>
                  <List borderStyle={BorderStyle.Solid}>{chosenApiItems}</List>
                </div>
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
                      '/' +
                        RouterPath.GivenApiDelegations +
                        '/' +
                        RouterPath.GivenApiDelegationsOverview,
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
                      '/' + RouterPath.GivenApiDelegations + '/' + RouterPath.NewGivenApiDelegation,
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
