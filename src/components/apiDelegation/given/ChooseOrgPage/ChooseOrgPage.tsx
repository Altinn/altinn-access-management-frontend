import {
  Page,
  PageContent,
  PageHeader,
  Button,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  SearchField,
  Panel,
  PanelVariant,
} from '@altinn/altinn-design-system';
import type { Key } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as React from 'react';
import { useState, useEffect } from 'react';

import { ActionBar, ActionIconVariant } from '@/components/reusables/ActionBar';
import {
  softAddOrg,
  softRemoveOrg,
  searchInCurrentOrgs,
  lookupOrg,
} from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import type { DelegableOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { ReactComponent as ApiIcon } from '@/assets/ShakeHands.svg';
import { RouterPath } from '@/routes/Router';
import { PageContainer } from '@/components/reusables/PageContainer';

import classes from './ChooseOrgPage.module.css';

export const ChooseOrgPage = () => {
  const delegableOrgs = useAppSelector((state) => state.delegableOrg.delegableOrgList);
  const chosenOrgs = useAppSelector((state) => state.delegableOrg.chosenDelegableOrgList);
  const searchOrgNotExist = useAppSelector((state) => state.delegableOrg.searchOrgNonexistant);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchString, setSearchString] = useState('');
  const [promptOrgNumber, setPromptOrgNumber] = useState(false);
  const fetchLookupOrg = async () => await dispatch(lookupOrg(searchString));

  const { t } = useTranslation('common');

  const IsOnlyNumbers = (str: string) => /^\d+$/.test(str);

  const handleSoftRemove = (org: DelegableOrg) => {
    dispatch(softRemoveOrg(org));
    dispatch(searchInCurrentOrgs(searchString));
  };

  function handleSearch(searchText: string) {
    if (IsOnlyNumbers(searchText) || searchText === '') {
      setSearchString(searchText);
      dispatch(searchInCurrentOrgs(searchText));
    }
  }

  useEffect(() => {
    // Clear search on mount
    dispatch(searchInCurrentOrgs(searchString));
  }, []);

  useEffect(() => {
    if (delegableOrgs.length > 0) {
      setPromptOrgNumber(false);
    } else if (searchString.length === 9) {
      void fetchLookupOrg();
    } else if (searchString.length !== 9) {
      setPromptOrgNumber(true);
    }
  }, [delegableOrgs]);

  const delegableOrgItems = delegableOrgs.map((org: DelegableOrg, index: Key) => {
    return (
      <ActionBar
        key={index}
        title={org.orgName}
        subtitle={org.orgNr}
        icon={ActionIconVariant.Add}
        actionCallBack={() => dispatch(softAddOrg(org))}
      />
    );
  });

  const chosenApiItems = chosenOrgs.map((org: DelegableOrg, index: Key | null | undefined) => {
    return (
      <ActionBar
        key={index}
        title={org.orgName}
        subtitle={org.orgNr}
        icon={ActionIconVariant.Remove}
        actionCallBack={() => handleSoftRemove(org)}
      />
    );
  });

  const infoPanel = () => {
    if (searchOrgNotExist) {
      return (
        <Panel
          variant={PanelVariant.Error}
          showIcon={false}
          title={String(t('api_delegation.buisness_search_notfound_title'))}
          forceMobileLayout={true}
        >
          <div>
            {t('api_delegation.buisness_search_notfound_content')}{' '}
            <a href='https://www.brreg.no/'>Brønnøysundregistrene.</a>
          </div>
        </Panel>
      );
    } else if (promptOrgNumber) {
      return (
        <Panel
          variant={PanelVariant.Info}
          showIcon={false}
          title={String(t('api_delegation.buisness_search_info_title'))}
          forceMobileLayout={true}
        >
          {t('api_delegation.buisness_search_info_content')}
        </Panel>
      );
    }
  };

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
                {searchString === '' ? (
                  <h4>{t('api_delegation.businesses_previously_delegated_to')}</h4>
                ) : (
                  <h4>{t('api_delegation.businesses_search_results')}</h4>
                )}
                {infoPanel()}
                <div className={classes.accordionScrollContainer}>{delegableOrgItems}</div>
              </div>
              <div className={classes.apiAccordions}>
                <h4>{t('api_delegation.businesses_going_to_get_access')}</h4>
                <div className={classes.accordionScrollContainer}>{chosenApiItems}</div>
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
