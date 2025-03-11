import { Button, Spinner, Search, Heading } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import cn from 'classnames';

import { Page, PageHeader, PageContent, PageContainer, RestartPrompter } from '@/components';
import { removeOrg } from '@/rtk/features/apiDelegation/apiDelegationSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import ApiIcon from '@/assets/Api.svg?react';
import { ApiDelegationPath } from '@/routes/paths';
import common from '@/resources/css/Common.module.css';
import { useMediaQuery } from '@/resources/hooks';
import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';
import { useFetchOverviewOrgsQuery } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import type { Organization } from '@/rtk/features/lookupApi';

import { DelegationType } from '../../components/DelegationType';

import classes from './ChooseOrgPage.module.css';
import { DelegableOrgItems } from './DelegableOrgItems';
import { ChosenItems } from './ChosenItems';
import { ChooseOrgInfoPanel } from './ChooseOrgInfoPanel';
import { mapOverviewOrgToOrganization, useOrgSearch } from './useOrgSearch';

export const ChooseOrgPage = () => {
  const partyId = getCookie('AltinnPartyId');
  const chosenOrgs = useAppSelector((state) => state.apiDelegation.chosenOrgs);
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenApis);

  const { data: reporteeData } = useGetReporteeQuery();

  const dispatch = useAppDispatch();
  const [searchString, setSearchString] = useState('');
  const isSm = useMediaQuery('(max-width: 768px)');
  const [chosenItemsStatusMessage, setChosenItemsStatusMessage] = useState('');
  const navigate = useNavigate();

  const { t } = useTranslation();
  const { data: overviewOrgs, isLoading: viewLoading } = useFetchOverviewOrgsQuery({
    partyId,
    delegationType: DelegationType.Offered,
  });

  const orgs = useMemo(
    () => overviewOrgs?.map((o) => mapOverviewOrgToOrganization(o)) || [],
    [overviewOrgs],
  );

  const { matches: displayOrgs, isFetching } = useOrgSearch(orgs, searchString);

  const searchOrgNotExist = searchString.length === 9 && displayOrgs.length === 0;
  const promptOrgNumber = searchString.length !== 9 && displayOrgs.length === 0;

  const handleSoftRemove = (org: Organization) => {
    dispatch(removeOrg(org));
  };

  function handleSearch(searchText: string) {
    const IsOnlyNumbers = (str: string) => /^\d+$/.test(str);
    const cleanText = searchText.replace(/\s+/g, '');
    if (IsOnlyNumbers(cleanText) || cleanText === '') {
      setSearchString(cleanText);
    }
  }

  const removeChosenOrgs = (displayOrgs: Organization[]) => {
    return displayOrgs.filter(
      (org) => !chosenOrgs.includes(org) && org.orgNumber !== reporteeData?.organizationNumber,
    );
  };

  return (
    <PageContainer>
      <Page
        color='dark'
        size={isSm ? 'small' : 'medium'}
      >
        <PageHeader icon={<ApiIcon />}>{t('api_delegation.give_access_to_new_api')}</PageHeader>
        <PageContent>
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
          <StatusMessageForScreenReader>{chosenItemsStatusMessage}</StatusMessageForScreenReader>
          <div className={classes.pageContentContainer}>
            <search className={classes.semanticOnlyTag}>
              <Heading
                data-size='md'
                level={2}
                className={classes.chooseOrgSecondHeader}
              >
                {t('api_delegation.new_org_content_text')}
              </Heading>

              <Search
                data-size='md'
                className={classes.searchContainer}
              >
                <Search.Input
                  aria-label={t('api_delegation.search_for_buisness')}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    handleSearch(event.target.value);
                  }}
                  value={searchString}
                />
                <Search.Clear
                  aria-label={t('common.clear')}
                  onClick={() => {
                    handleSearch('');
                  }}
                />
              </Search>
              {viewLoading ? (
                <div className={cn(common.spinnerContainer, classes.viewLoadingSection)}>
                  <Spinner aria-label={t('common.loading')} />
                </div>
              ) : (
                <>
                  <div className={classes.searchResultsSection}>
                    {searchString === '' ? (
                      <Heading
                        data-size='2xs'
                        level={4}
                        className={classes.actionBarContainerText}
                      >
                        {t('api_delegation.businesses_previously_delegated_to')}
                      </Heading>
                    ) : (
                      <Heading
                        data-size='2xs'
                        level={4}
                        className={classes.actionBarContainerText}
                      >
                        {t('api_delegation.businesses_search_results')}
                      </Heading>
                    )}
                    <StatusMessageForScreenReader>
                      {!isFetching &&
                        searchOrgNotExist &&
                        t('api_delegation.buisness_search_notfound_title')}
                    </StatusMessageForScreenReader>
                    <ChooseOrgInfoPanel
                      searchString={searchString}
                      promptOrgNumber={promptOrgNumber}
                      searchLoading={isFetching}
                      searchOrgNotExist={searchOrgNotExist}
                    />

                    {isFetching ? (
                      <div className={common.spinnerContainer}>
                        <Spinner aria-label={t('common.loading')} />
                      </div>
                    ) : (
                      <DelegableOrgItems
                        delegableOrgs={removeChosenOrgs(displayOrgs)}
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
                  <Heading
                    level={4}
                    data-size='2xs'
                    className={classes.chosenOrgsHeader}
                  >
                    {t('api_delegation.businesses_going_to_get_access')}
                  </Heading>
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
            >
              {t('common.next')}
            </Button>
          </div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
