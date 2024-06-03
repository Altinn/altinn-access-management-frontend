import { Button, Spinner, Search } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';

import { Page, PageHeader, PageContent, PageContainer, RestartPrompter } from '@/components';
import {
  softRemoveOrg,
  searchInCurrentOrgs,
  lookupOrg,
  populateDelegableOrgs,
  setSearchLoading,
} from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import type { DelegableOrg } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import ApiIcon from '@/assets/Api.svg?react';
import { ApiDelegationPath } from '@/routes/paths';
import common from '@/resources/css/Common.module.css';
import { fetchOverviewOrgsOffered } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import { useMediaQuery } from '@/resources/hooks';
import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';

import classes from './ChooseOrgPage.module.css';
import { DelegableOrgItems } from './DelegableOrgItems';
import { ChosenItems } from './ChosenItems';
import { ChooseOrgInfoPanel } from './ChooseOrgInfoPanel';

export const ChooseOrgPage = () => {
  const {
    presentedOrgList: delegableOrgs,
    chosenDelegableOrgList: chosenOrgs,
    searchOrgNonexistant: searchOrgNotExist,
    searchLoading,
  } = useAppSelector((state) => state.delegableOrg);
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenApis);
  const { overviewOrgs, loading: overviewOrgsLoading } = useAppSelector(
    (state) => state.overviewOrg,
  );
  const reporteeOrgNumber = useAppSelector((state) => state.userInfo.reporteeOrgNumber);
  const dispatch = useAppDispatch();
  const [searchString, setSearchString] = useState('');
  const [promptOrgNumber, setPromptOrgNumber] = useState(false);
  const [viewLoading, setViewLoading] = useState(true);
  const isSm = useMediaQuery('(max-width: 768px)');
  const [chosenItemsStatusMessage, setChosenItemsStatusMessage] = useState('');
  const navigate = useNavigate();

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
    } else if (
      searchString.length === 9 &&
      !chosenOrgs.some((org) => org.orgNr === searchString) &&
      reporteeOrgNumber !== searchString
    ) {
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

  return (
    <PageContainer>
      <Page
        color='dark'
        size={isSm ? 'small' : 'medium'}
      >
        <PageHeader icon={<ApiIcon />}>{t('api_delegation.give_access_to_new_api')}</PageHeader>
        {chosenApis.length < 1 && (
          <RestartPrompter
            spacingBottom
            restartPath={
              '/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.ChooseApi
            }
            title={t('common.an_error_has_occured')}
            ingress={t('api_delegation.delegations_not_registered')}
          />
        )}
        <PageContent>
          <StatusMessageForScreenReader>{chosenItemsStatusMessage}</StatusMessageForScreenReader>
          <div className={classes.pageContentContainer}>
            <search className={classes.semanticOnlyTag}>
              <h2 className={classes.chooseOrgSecondHeader}>
                {t('api_delegation.new_org_content_text')}
              </h2>

              <Search
                label={t('api_delegation.search_for_buisness')}
                hideLabel={false}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  handleSearch(event.target.value);
                }}
                value={searchString}
                size='medium'
                onClear={() => {
                  handleSearch('');
                }}
              />
              {viewLoading ? (
                <div className={cn(common.spinnerContainer, classes.viewLoadingSection)}>
                  <Spinner
                    title={t('common.loading')}
                    variant='interaction'
                  />
                </div>
              ) : (
                <>
                  <div className={classes.searchResultsSection}>
                    {searchString === '' ? (
                      <h4 className={classes.actionBarContainerText}>
                        {t('api_delegation.businesses_previously_delegated_to')}
                      </h4>
                    ) : (
                      <h4 className={classes.actionBarContainerText}>
                        {t('api_delegation.businesses_search_results')}
                      </h4>
                    )}
                    <StatusMessageForScreenReader>
                      {!searchLoading &&
                        searchOrgNotExist &&
                        t('api_delegation.buisness_search_notfound_title')}
                    </StatusMessageForScreenReader>
                    <ChooseOrgInfoPanel
                      searchString={searchString}
                      promptOrgNumber={promptOrgNumber}
                    />

                    {searchLoading ? (
                      <div className={common.spinnerContainer}>
                        <Spinner
                          title={t('common.loading')}
                          variant='interaction'
                        />
                      </div>
                    ) : (
                      <DelegableOrgItems
                        delegableOrgs={delegableOrgs}
                        setChosenItemsStatusMessage={setChosenItemsStatusMessage}
                      />
                    )}
                  </div>
                </>
              )}
            </search>
            <div className={classes.selectedSearchResultsSection}>
              {chosenOrgs.length > 0 && (
                <>
                  <h4 className={classes.chosenOrgsHeader}>
                    {t('api_delegation.businesses_going_to_get_access')}
                  </h4>
                  <ChosenItems
                    chosenOrgs={chosenOrgs}
                    handleSoftRemove={handleSoftRemove}
                    setChosenItemsStatusMessage={setChosenItemsStatusMessage}
                  />
                </>
              )}
            </div>
          </div>

          <div className={classes.navigationSection}>
            <Button
              variant={'secondary'}
              onClick={() =>
                navigate(
                  '/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.ChooseApi,
                )
              }
              fullWidth={isSm}
            >
              {t('common.previous')}
            </Button>
            <Button
              disabled={chosenOrgs.length === 0 || chosenApis.length === 0}
              onClick={() =>
                navigate(
                  '/' +
                    ApiDelegationPath.OfferedApiDelegations +
                    '/' +
                    ApiDelegationPath.Confirmation,
                )
              }
              fullWidth={isSm}
            >
              {t('common.next')}
            </Button>
          </div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
