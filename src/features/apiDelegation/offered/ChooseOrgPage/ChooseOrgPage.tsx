import { Alert, Button, Heading, Paragraph, Spinner, Search } from '@digdir/design-system-react';
import { Panel, PanelVariant } from '@altinn/altinn-design-system';
import type { Key } from 'react';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircleIcon, MinusCircleIcon } from '@navikt/aksel-icons';

import {
  Page,
  PageHeader,
  PageContent,
  ActionBar,
  PageContainer,
  GroupElements,
  RestartPrompter,
} from '@/components';
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
import ApiIcon from '@/assets/Api.svg?react';
import { ApiDelegationPath } from '@/routes/paths';
import common from '@/resources/css/Common.module.css';
import { fetchOverviewOrgsOffered } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import { useMediaQuery } from '@/resources/hooks';

import classes from './ChooseOrgPage.module.css';

export const ChooseOrgPage = () => {
  const delegableOrgs = useAppSelector((state) => state.delegableOrg.presentedOrgList);
  const chosenOrgs = useAppSelector((state) => state.delegableOrg.chosenDelegableOrgList);
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenApis);
  const searchOrgNotExist = useAppSelector((state) => state.delegableOrg.searchOrgNonexistant);
  const overviewOrgs = useAppSelector((state) => state.overviewOrg.overviewOrgs);
  const overviewOrgsLoading = useAppSelector((state) => state.overviewOrg.loading);
  const searchLoading = useAppSelector((state) => state.delegableOrg.searchLoading);
  const reporteeOrgNumber = useAppSelector((state) => state.userInfo.reporteeOrgNumber);
  const dispatch = useAppDispatch();
  const [searchString, setSearchString] = useState('');
  const [promptOrgNumber, setPromptOrgNumber] = useState(false);
  const [viewLoading, setViewLoading] = useState(true);
  const isSm = useMediaQuery('(max-width: 768px)');
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

  const delegableOrgItems = delegableOrgs.map((org: DelegableOrg) => {
    return (
      <div
        className={classes.actionBarWrapper}
        key={org.orgNr}
      >
        <ActionBar
          key={org.orgNr}
          title={org.orgName}
          subtitle={t('api_delegation.org_nr') + ' ' + org.orgNr}
          actions={
            <Button
              icon={<PlusCircleIcon fontSize='3rem' />}
              variant={'tertiary'}
              color={'second'}
              onClick={() => dispatch(softAddOrg(org))}
              aria-label={t('common.add') + ' ' + org.orgName}
              size='large'
            ></Button>
          }
          color={'neutral'}
        />
      </div>
    );
  });

  const chosenItems = chosenOrgs.map((org: DelegableOrg, index: Key | null | undefined) => {
    return (
      <div
        className={classes.actionBarWrapper}
        key={index}
      >
        <ActionBar
          key={index}
          title={org.orgName}
          subtitle={t('api_delegation.org_nr') + ' ' + org.orgNr}
          actions={
            <Button
              icon={<MinusCircleIcon />}
              variant={'tertiary'}
              color={'danger'}
              onClick={() => {
                handleSoftRemove(org);
              }}
              aria-label={t('common.remove') + ' ' + org.orgName}
              size='large'
            ></Button>
          }
          color={'success'}
        />
      </div>
    );
  });

  const infoPanel = () => {
    if (reporteeOrgNumber === searchString && searchString.length > 0) {
      return (
        <Alert severity='warning'>
          <Heading
            size={'xsmall'}
            level={2}
            spacing
            role='alert'
          >
            {t('api_delegation.own_orgnumber_delegation_heading')}
          </Heading>
          <Paragraph>{t('api_delegation.own_orgnumber_delegation_paragraph')}</Paragraph>
        </Alert>
      );
    } else if (!searchLoading && searchOrgNotExist) {
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
          {isSm && chosenItems.length > 0 && (
            <div className={classes.chosenOrgs}>
              <h4 className={classes.chosenOrgsHeader}>
                {t('api_delegation.businesses_going_to_get_access')}
              </h4>
              <div className={classes.actionBarScrollContainer}>{chosenItems}</div>
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
                {infoPanel()}
                <div className={classes.actionBarScrollContainer}>
                  {searchLoading ? (
                    <div className={common.spinnerContainer}>
                      <Spinner
                        title={t('common.loading')}
                        variant='interaction'
                      />
                    </div>
                  ) : (
                    delegableOrgItems
                  )}
                </div>
              </div>
              {!isSm && (
                <div className={common.chosenOrgsContainer}>
                  <h4 className={classes.chosenOrgsHeader}>
                    {t('api_delegation.businesses_going_to_get_access')}
                  </h4>
                  <div className={classes.actionBarScrollContainer}>{chosenItems}</div>
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
              disabled={chosenOrgs.length === 0}
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
