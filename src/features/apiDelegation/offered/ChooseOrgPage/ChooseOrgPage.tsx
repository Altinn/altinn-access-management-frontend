import { Alert, Button, Heading, Paragraph, Spinner, Search } from '@digdir/designsystemet-react';
import { Panel, PanelVariant } from '@altinn/altinn-design-system';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Page,
  PageHeader,
  PageContent,
  PageContainer,
  GroupElements,
  RestartPrompter,
} from '@/components';
import { removeOrg } from '@/rtk/features/apiDelegation/apiDelegationSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import type { Organization } from '@/rtk/features/lookup/lookupApi';
import ApiIcon from '@/assets/Api.svg?react';
import { ApiDelegationPath } from '@/routes/paths';
import common from '@/resources/css/Common.module.css';
import { fetchOverviewOrgsOffered } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import { useMediaQuery } from '@/resources/hooks';
import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';

import classes from './ChooseOrgPage.module.css';
import { DelegableOrgItems } from './DelegableOrgItems';
import { ChosenItems } from './ChosenItems';
import { useOrgSearch } from './useOrgSearch';

export const ChooseOrgPage = () => {
  const chosenOrgs = useAppSelector((state) => state.apiDelegation.chosenOrgs);
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenApis);
  const overviewOrgs = useAppSelector((state) => state.overviewOrg.overviewOrgs);
  const overviewOrgsLoading = useAppSelector((state) => state.overviewOrg.loading);
  const reporteeOrgNumber = useAppSelector((state) => state.userInfo.reporteeOrgNumber);
  const dispatch = useAppDispatch();
  const [searchString, setSearchString] = useState('');
  const [viewLoading, setViewLoading] = useState(true);
  const isSm = useMediaQuery('(max-width: 768px)');
  const [chosenItemsStatusMessage, setChosenItemsStatusMessage] = useState('');
  const navigate = useNavigate();

  const { t } = useTranslation('common');

  const { matches: displayOrgs, error, isFetching } = useOrgSearch(overviewOrgs, searchString);

  const searchOrgNotExist = searchString.length === 9 && displayOrgs.length === 0;
  const promptOrgNumber = searchString.length !== 9 && displayOrgs.length === 0;

  useEffect(() => {
    if (overviewOrgsLoading) {
      void dispatch(fetchOverviewOrgsOffered());
    }

    if (!overviewOrgsLoading) {
      setViewLoading(false);
    }
  }, [overviewOrgs, overviewOrgsLoading]);

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
      (org) => !chosenOrgs.includes(org) && org.orgNumber !== reporteeOrgNumber,
    );
  };

  const infoPanel = () => {
    if (reporteeOrgNumber === searchString && searchString.length > 0) {
      return (
        <Alert
          severity='warning'
          role='alert'
        >
          <Heading
            size={'xsmall'}
            level={2}
            spacing
          >
            {t('api_delegation.own_orgnumber_delegation_heading')}
          </Heading>
          <Paragraph>{t('api_delegation.own_orgnumber_delegation_paragraph')}</Paragraph>
        </Alert>
      );
    } else if (!isFetching && searchOrgNotExist) {
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
              target='_blank'
              rel='noreferrer'
            >
              {t('common.broennoeysund_register')}
            </a>
          </div>
        </Panel>
      );
    } else if (!isFetching && promptOrgNumber) {
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
          <h2 className={classes.topText}>{t('api_delegation.new_org_content_text')}</h2>
          <StatusMessageForScreenReader>{chosenItemsStatusMessage}</StatusMessageForScreenReader>
          {isSm && chosenOrgs.length > 0 && (
            <div className={classes.chosenOrgs}>
              <h4 className={classes.chosenOrgsHeader}>
                {t('api_delegation.businesses_going_to_get_access')}
              </h4>
              <ChosenItems
                chosenOrgs={chosenOrgs}
                handleSoftRemove={handleSoftRemove}
                setChosenItemsStatusMessage={setChosenItemsStatusMessage}
              />
            </div>
          )}
          <div className={classes.searchSection}>
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
            ></Search>
          </div>
          {viewLoading ? (
            <div className={common.spinnerContainer}>
              <Spinner
                title={t('common.loading')}
                variant='interaction'
              />
            </div>
          ) : (
            <div className={classes.pageContentActionBarContainer}>
              <div className={classes.delegableOrgsContainer}>
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
                  {!isFetching &&
                    searchOrgNotExist &&
                    t('api_delegation.buisness_search_notfound_title')}
                </StatusMessageForScreenReader>
                {infoPanel()}
                <div>
                  {isFetching ? (
                    <div className={common.spinnerContainer}>
                      <Spinner
                        title={t('common.loading')}
                        variant='interaction'
                      />
                    </div>
                  ) : (
                    <DelegableOrgItems
                      delegableOrgs={removeChosenOrgs(displayOrgs)}
                      setChosenItemsStatusMessage={setChosenItemsStatusMessage}
                    />
                  )}
                </div>
              </div>
              {!isSm && (
                <div className={common.chosenOrgsContainer}>
                  <h4 className={classes.chosenOrgsHeader}>
                    {t('api_delegation.businesses_going_to_get_access')}
                  </h4>
                  <ChosenItems
                    chosenOrgs={chosenOrgs}
                    handleSoftRemove={handleSoftRemove}
                    setChosenItemsStatusMessage={setChosenItemsStatusMessage}
                  />
                </div>
              )}
            </div>
          )}
          <GroupElements>
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
          </GroupElements>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
