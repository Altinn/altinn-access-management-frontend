import {
  Button,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  Spinner,
} from '@digdir/design-system-react';
import {
  Page,
  PageContent,
  PageHeader,
  SearchField,
  Panel,
  PanelVariant,
} from '@altinn/altinn-design-system';
import type { Key } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as React from 'react';
import { useState, useEffect } from 'react';

import { ActionBar, ActionIconVariant } from '@/components/reusables';
import {
  softAddOrg,
  softRemoveOrg,
  searchInCurrentOrgs,
  lookupOrg,
  populateDelegableOrgs,
  setSearchLoading,
} from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import type { DelegableOrg } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import { ReactComponent as ApiIcon } from '@/assets/Api.svg';
import { RouterPath } from '@/routes/Router';
import { PageContainer } from '@/components/reusables/PageContainer';
import common from '@/resources/css/Common.module.css';
import { fetchOverviewOrgsOffered } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';

import classes from './ChooseOrgPage.module.css';

export const ChooseOrgPage = () => {
  const delegableOrgs = useAppSelector((state) => state.delegableOrg.presentedOrgList);
  const chosenOrgs = useAppSelector((state) => state.delegableOrg.chosenDelegableOrgList);
  const searchOrgNotExist = useAppSelector((state) => state.delegableOrg.searchOrgNonexistant);
  const overviewOrgs = useAppSelector((state) => state.overviewOrg.overviewOrgs);
  const overviewOrgsLoading = useAppSelector((state) => state.overviewOrg.loading);
  const searchLoading = useAppSelector((state) => state.delegableOrg.searchLoading);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchString, setSearchString] = useState('');
  const [promptOrgNumber, setPromptOrgNumber] = useState(false);
  const [viewLoading, setViewLoading] = useState(true);

  const { t } = useTranslation('common');

  const IsOnlyNumbers = (str: string) => /^\d+$/.test(str);

  useEffect(() => {
    dispatch(searchInCurrentOrgs(searchString));

    if (overviewOrgsLoading) {
      void dispatch(fetchOverviewOrgsOffered());
    }

    if (!overviewOrgsLoading) {
      dispatch(transferDelegableOrgs);
      setViewLoading(false);
    }
  }, [overviewOrgs, overviewOrgsLoading]);

  useEffect(() => {
    if (delegableOrgs.length > 0) {
      setPromptOrgNumber(false);
    } else if (searchString.length === 9 && !chosenOrgs.some((org) => org.orgNr === searchString)) {
      dispatch(setSearchLoading());
      void dispatch(lookupOrg(searchString));
    } else if (searchString.length !== 9) {
      setPromptOrgNumber(true);
    }
  }, [delegableOrgs]);

  const transferDelegableOrgs = () => {
    let delegableOrgList: DelegableOrg[] = [];
    for (const org of overviewOrgs) {
      delegableOrgList.push({
        id: org.id,
        orgName: org.orgName,
        orgNr: org.orgNr,
      });
    }
    for (const chosen of chosenOrgs) {
      delegableOrgList = delegableOrgList.filter((org) => org.id !== chosen.id);
    }
    dispatch(populateDelegableOrgs(delegableOrgList));
  };

  const handleSoftRemove = (org: DelegableOrg) => {
    dispatch(softRemoveOrg(org));
    dispatch(searchInCurrentOrgs(searchString));
  };

  function handleSearch(searchText: string) {
    const cleanText = searchText.replace(/\s+/g, '');
    if (IsOnlyNumbers(cleanText) || cleanText === '') {
      setSearchString(cleanText);
      dispatch(searchInCurrentOrgs(cleanText));
    }
  }

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

  const chosenItems = chosenOrgs.map((org: DelegableOrg, index: Key | null | undefined) => {
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
    if (!searchLoading && searchOrgNotExist) {
      return (
        <Panel
          variant={PanelVariant.Error}
          showIcon={false}
          title={String(t('api_delegation.buisness_search_notfound_title'))}
          forceMobileLayout={true}
        >
          <div>
            {t('api_delegation.buisness_search_notfound_content')}{' '}
            <a
              className={classes.link}
              href='https://www.brreg.no/'
            >
              {t('common.broennoeysund_register')}
            </a>
          </div>
        </Panel>
      );
    } else if (!searchLoading && promptOrgNumber) {
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
          <div className={common.pageContent}>
            <h2 className={classes.chooseOrgText}>
              {t('api_delegation.new_org_accordion_content_text')}
            </h2>
            <div className={classes.searchSection}>
              <SearchField
                label={String(t('api_delegation.search_for_buisness'))}
                value={searchString}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleSearch(event.target.value)
                }
              ></SearchField>
            </div>
            {viewLoading ? (
              <div className={common.spinnerContainer}>
                <Spinner
                  size='large'
                  title={String(t('api_delegation.loading'))}
                />
              </div>
            ) : (
              <div className={classes.pageContentAccordionsContainer}>
                <div className={classes.apiAccordions}>
                  {searchString === '' ? (
                    <h4 className={classes.accordionContainerText}>
                      {t('api_delegation.businesses_previously_delegated_to')}
                    </h4>
                  ) : (
                    <h4 className={classes.accordionContainerText}>
                      {t('api_delegation.businesses_search_results')}
                    </h4>
                  )}
                  {infoPanel()}
                  <div className={classes.accordionScrollContainer}>{delegableOrgItems}</div>
                </div>
                <div className={classes.apiAccordions}>
                  <h4 className={classes.accordionContainerText}>
                    {t('api_delegation.businesses_going_to_get_access')}
                  </h4>
                  <div className={classes.accordionScrollContainer}>{chosenItems}</div>
                </div>
              </div>
            )}
            <div className={classes.navButtonContainer}>
              <div className={classes.navButton}>
                <Button
                  color={ButtonColor.Primary}
                  variant={ButtonVariant.Outline}
                  size={ButtonSize.Small}
                  fullWidth={true}
                  onClick={() =>
                    navigate('/' + RouterPath.OfferedApiDelegations + '/' + RouterPath.Overview)
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
                    navigate('/' + RouterPath.OfferedApiDelegations + '/' + RouterPath.ChooseApi)
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
