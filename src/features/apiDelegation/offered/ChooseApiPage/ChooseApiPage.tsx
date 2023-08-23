import { PanelVariant, Panel, SearchField } from '@altinn/altinn-design-system';
import { List, Spinner } from '@digdir/design-system-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterIcon } from '@navikt/aksel-icons';
import * as React from 'react';

import {
  Page,
  PageHeader,
  PageContent,
  NavigationButtons,
  PageContainer,
  ErrorPanel,
} from '@/components';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { ReactComponent as OfficeIcon } from '@/assets/Office1.svg';
import { ApiDelegationPath } from '@/routes/paths';
import { ReactComponent as ApiIcon } from '@/assets/Api.svg';
import { CompactDeletableListItem } from '@/components/CompactDeletableListItem';
import { useMediaQuery } from '@/resources/hooks';
import common from '@/resources/css/Common.module.css';
import { softRemoveOrg } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import type { DelegableOrg } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import {
  fetchDelegableApis,
  softAddApi,
  softRemoveApi,
  search,
  filter,
} from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import type { DelegableApi } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import { Filter, type FilterOption } from '@/components/Filter';
import { DelegationActionBar } from '@/components/DelegationActionBar';

import classes from './ChooseApiPage.module.css';

export const ChooseApiPage = () => {
  const [searchString, setSearchString] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const delegableApis = useAppSelector((state) => state.delegableApi.presentedApiList);
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenDelegableApiList);
  const chosenOrgs = useAppSelector((state) => state.delegableOrg.chosenDelegableOrgList);
  const apiProviders = useAppSelector((state) => state.delegableApi.apiProviders);
  const loading = useAppSelector((state) => state.delegableApi.loading);
  const error = useAppSelector((state) => state.delegableApi.error);
  const isSm = useMediaQuery('(max-width: 768px)');
  const dispatch = useAppDispatch();
  const { t } = useTranslation('common');
  const fetchData = async () => await dispatch(fetchDelegableApis());

  useEffect(() => {
    if (loading) {
      void fetchData();
    }
    dispatch(filter([]));
    dispatch(search(''));
  }, []);

  function handleSearch(searchText: string) {
    setSearchString(searchText);
    dispatch(search(searchText));
  }

  const handleFilterChange = (filterList: string[]) => {
    setFilters(filterList);
    dispatch(filter(filterList));
    dispatch(search(searchString));
  };

  const handleRemove = (api: DelegableApi) => {
    dispatch(softRemoveApi(api));
    dispatch(filter(filters));
    dispatch(search(searchString));
  };

  const filterOptions: FilterOption[] = apiProviders.map((provider: string) => ({
    label: provider,
    value: provider,
  }));

  const delegableApiActionBars = () => {
    if (error.message) {
      return (
        <ErrorPanel
          title={t('api_delegation.data_retrieval_failed')}
          message={error.message}
          statusCode={error.statusCode}
        ></ErrorPanel>
      );
    } else if (loading) {
      return (
        <div className={common.spinnerContainer}>
          <Spinner
            title={String(t('common.loading'))}
            size='large'
          />
        </div>
      );
    }
    return delegableApis.map((api: DelegableApi) => {
      return (
        <DelegationActionBar
          key={api.id}
          title={api.apiName}
          subtitle={api.orgName}
          topContentText={api.rightDescription}
          bottomContentText={api.description}
          scopeList={api.scopes}
          buttonType={'add'}
          onActionButtonClick={() => dispatch(softAddApi(api))}
          color={'neutral'}
        ></DelegationActionBar>
      );
    });
  };

  const chosenApiActionBars = chosenApis.map((api: DelegableApi) => {
    return (
      <DelegationActionBar
        key={api.id}
        title={api.apiName}
        subtitle={api.orgName}
        topContentText={api.rightDescription}
        bottomContentText={api.description}
        scopeList={api.scopes}
        buttonType={'remove'}
        onActionButtonClick={() => {
          handleRemove(api);
        }}
        color={'success'}
      ></DelegationActionBar>
    );
  });

  const chosenDelegableOrgs = chosenOrgs.map((org: DelegableOrg) => {
    return (
      <CompactDeletableListItem
        key={org.orgNr}
        startIcon={<OfficeIcon />}
        removeCallback={chosenOrgs.length > 1 ? () => dispatch(softRemoveOrg(org)) : null}
        leftText={org.orgName}
        middleText={!isSm ? t('api_delegation.org_nr') + ' ' + org.orgNr : undefined}
      ></CompactDeletableListItem>
    );
  });

  return (
    <PageContainer>
      <Page
        color='dark'
        size={isSm ? 'small' : 'medium'}
      >
        <PageHeader icon={<ApiIcon />}>{t('api_delegation.give_access_to_new_api')}</PageHeader>
        <PageContent>
          {chosenDelegableOrgs.length < 1 ? (
            <Panel
              title={t('common.error')}
              variant={PanelVariant.Warning}
              forceMobileLayout={isSm}
            >
              {t('api_delegation.orgs_not_chosen_subtitle')}
            </Panel>
          ) : (
            <div>
              <h3>{t('api_delegation.chosen_orgs')}:</h3>
              <List borderStyle={'dashed'}>{chosenDelegableOrgs}</List>
            </div>
          )}
          <h3 className={classes.chooseApiSecondHeader}>
            {t('api_delegation.new_api_content_text2')}
          </h3>
          {isSm && chosenApis.length > 0 && (
            <div className={common.apiAccordions}>
              <h4>{t('api_delegation.chosen_apis')}</h4>
              <div className={classes.chosenApisContainer}>
                <div className={classes.actionBarWrapper}>{chosenApiActionBars}</div>
              </div>
            </div>
          )}
          <div className={classes.searchSection}>
            <div className={classes.searchField}>
              <SearchField
                value={searchString}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  handleSearch(event.target.value);
                }}
                aria-label={String(t('api_delegation.search_for_api'))}
              ></SearchField>
            </div>
            <div className={classes.filter}>
              <Filter
                options={filterOptions}
                icon={<FilterIcon />}
                label={String(t('api_delegation.filter_label'))}
                applyButtonLabel={String(t('common.apply'))}
                resetButtonLabel={String(t('common.reset_choices'))}
                closeButtonAriaLabel={String(t('common.close'))}
                onApply={handleFilterChange}
                searchable={true}
                fullScreenModal={isSm}
              />
            </div>
          </div>
          <div className={classes.pageContentActionBarsContainer}>
            <div className={common.apiAccordions}>
              <h4 className={classes.explanationTexts}>{t('api_delegation.delegable_apis')}:</h4>
              <div className={classes.delegableApisContainer}>
                <div className={classes.actionBarWrapper}>{delegableApiActionBars()}</div>
              </div>
            </div>
            {!isSm && (
              <div className={common.apiAccordions}>
                <h4 className={classes.explanationTexts}>{t('api_delegation.chosen_apis')}</h4>
                <div className={classes.delegableApisContainer}>
                  <div className={classes.actionBarWrapper}>{chosenApiActionBars}</div>
                </div>
              </div>
            )}
          </div>
          <NavigationButtons
            previousText={t('api_delegation.previous')}
            previousPath={
              '/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.ChooseOrg
            }
            nextText={t('api_delegation.next')}
            nextPath={
              '/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.Confirmation
            }
            nextDisabled={chosenApis.length < 1 || chosenOrgs.length < 1}
          ></NavigationButtons>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
