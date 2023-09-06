import { Alert, Button, Heading, Link, Paragraph, Spinner } from '@digdir/design-system-react';
import { SearchField } from '@altinn/altinn-design-system';
import type { Key } from 'react';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { useState, useEffect } from 'react';

import { ReactComponent as MinusCircle } from '@/assets/MinusCircle.svg';
import { ReactComponent as AddCircle } from '@/assets/AddCircle.svg';
import {
  Page,
  PageHeader,
  PageContent,
  ActionBar,
  NavigationButtons,
  PageContainer,
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
import { ReactComponent as ApiIcon } from '@/assets/Api.svg';
import { ApiDelegationPath } from '@/routes/paths';
import common from '@/resources/css/Common.module.css';
import { fetchOverviewOrgsOffered } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import { useMediaQuery } from '@/resources/hooks';

import classes from './ChooseOrgPage.module.css';

export const ChooseOrgPage = () => {
  const delegableOrgs = useAppSelector((state) => state.delegableOrg.presentedOrgList);
  const chosenOrgs = useAppSelector((state) => state.delegableOrg.chosenDelegableOrgList);
  const searchOrgNotExist = useAppSelector((state) => state.delegableOrg.searchOrgNonexistant);
  const overviewOrgs = useAppSelector((state) => state.overviewOrg.overviewOrgs);
  const overviewOrgsLoading = useAppSelector((state) => state.overviewOrg.loading);
  const searchLoading = useAppSelector((state) => state.delegableOrg.searchLoading);
  const dispatch = useAppDispatch();
  const [searchString, setSearchString] = useState('');
  const [promptOrgNumber, setPromptOrgNumber] = useState(false);
  const [viewLoading, setViewLoading] = useState(true);
  const isSm = useMediaQuery('(max-width: 768px)');

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
              icon={<AddCircle />}
              variant={'quiet'}
              color={'success'}
              onClick={() => dispatch(softAddOrg(org))}
              aria-label={t('common.add') + ' ' + org.orgName}
              size='medium'
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
              icon={<MinusCircle />}
              variant={'quiet'}
              color={'danger'}
              onClick={() => {
                handleSoftRemove(org);
              }}
              aria-label={t('common.remove') + ' ' + org.orgName}
              size='medium'
            ></Button>
          }
          color={'success'}
        />
      </div>
    );
  });

  const notFoundAlert = () => {
    if (!searchLoading && searchOrgNotExist) {
      return (
        <Alert
          severity='danger'
          role='status'
        >
          <Heading
            size={'small'}
            level={4}
            spacing
          >
            {String(t('api_delegation.buisness_search_notfound_title'))}
          </Heading>
          <Paragraph>{t('api_delegation.buisness_search_notfound_content')}</Paragraph>
          <Link
            href='https://www.brreg.no/'
            target='_blank'
            rel='noreferrer'
          >
            {t('common.broennoeysund_register')}
          </Link>
        </Alert>
      );
    } else if (!searchLoading && promptOrgNumber) {
      return (
        <Alert
          severity='info'
          role='status'
        >
          <Heading
            size={'small'}
            level={4}
            spacing
          >
            {String(t('api_delegation.buisness_search_info_title'))}
          </Heading>
          <Paragraph>{t('api_delegation.buisness_search_info_content')}</Paragraph>
        </Alert>
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
          <h2 className={classes.topText}>{t('api_delegation.new_org_content_text')}</h2>
          {isSm && chosenItems.length > 0 && (
            <div className={classes.chosenOrgs}>
              <h3 className={classes.chosenOrgsHeader}>
                {t('api_delegation.businesses_going_to_get_access')}
              </h3>
              <div className={classes.actionBarScrollContainer}>{chosenItems}</div>
            </div>
          )}
          <div className={classes.searchSection}>
            <SearchField
              label={String(t('api_delegation.search_for_buisness'))}
              value={searchString}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                handleSearch(event.target.value);
              }}
              aria-label={String(t('api_delegation.search_for_buisness'))}
            ></SearchField>
          </div>
          {viewLoading ? (
            <div className={common.spinnerContainer}>
              <Spinner
                size='large'
                title={String(t('common.loading'))}
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
                {notFoundAlert()}
                <div className={classes.actionBarScrollContainer}>
                  {searchLoading ? (
                    <div className={common.spinnerContainer}>
                      <Spinner
                        size='large'
                        title={String(t('common.loading'))}
                      />
                    </div>
                  ) : (
                    delegableOrgItems
                  )}
                </div>
              </div>
              {!isSm && (
                <div className={common.chosenOrgsContainer}>
                  <h3 className={classes.chosenOrgsHeader}>
                    {t('api_delegation.businesses_going_to_get_access')}
                  </h3>
                  <div className={classes.actionBarScrollContainer}>{chosenItems}</div>
                </div>
              )}
            </div>
          )}
          <NavigationButtons
            previousText={t('common.cancel')}
            previousPath={
              '/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.Overview
            }
            nextText={t('api_delegation.next')}
            nextDisabled={chosenOrgs.length === 0}
            nextPath={
              '/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.ChooseApi
            }
          />
        </PageContent>
      </Page>
    </PageContainer>
  );
};
