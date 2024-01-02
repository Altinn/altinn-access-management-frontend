import { SearchField } from '@altinn/altinn-design-system';
import { Button, Spinner } from '@digdir/design-system-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterIcon, Buldings3Icon } from '@navikt/aksel-icons';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Page,
  PageHeader,
  PageContent,
  PageContainer,
  ErrorPanel,
  GroupElements,
  RestartPrompter,
  DelegationActionBar,
  BorderedList,
} from '@/components';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { ApiDelegationPath } from '@/routes/paths';
import ApiIcon from '@/assets/Api.svg?react';
import { CompactDeletableListItem } from '@/components/CompactDeletableListItem';
import { useMediaQuery } from '@/resources/hooks';
import common from '@/resources/css/Common.module.css';
import { softRemoveOrg } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import type { DelegableOrg } from '@/rtk/features/apiDelegation/delegableOrg/delegableOrgSlice';
import {
  fetchDelegableApis,
  softRemoveApi,
  search,
  filter,
  apiDelegationCheck,
} from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import type {
  DelegableApi,
  DelegationCheckDto,
} from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import { Filter, type FilterOption } from '@/components/Filter';

import classes from './ChooseApiPage.module.css';

export const ChooseApiPage = () => {
  const [searchString, setSearchString] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const presentedApis = useAppSelector((state) => state.delegableApi.presentedApiList);
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenDelegableApiList);
  const apiProviders = useAppSelector((state) => state.delegableApi.apiProviders);
  const loading = useAppSelector((state) => state.delegableApi.loading);
  const error = useAppSelector((state) => state.delegableApi.error);
  const isSm = useMediaQuery('(max-width: 768px)');
  const dispatch = useAppDispatch();
  const { t } = useTranslation('common');
  const fetchData = async () => await dispatch(fetchDelegableApis());
  const navigate = useNavigate();

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

  const delegationCheck = (api: DelegableApi) => {
    const dto: DelegationCheckDto = {
      delegableApi: api,
    };
    dispatch(apiDelegationCheck(dto));
  };

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
            title={t('common.loading')}
            variant='interaction'
          />
        </div>
      );
    }
    return presentedApis.map((api: DelegableApi) => {
      return (
        <DelegationActionBar
          key={api.identifier}
          title={api.apiName}
          subtitle={api.orgName}
          topContentText={api.rightDescription}
          bottomContentText={api.description}
          scopeList={api.scopes}
          buttonType={'add'}
          onActionButtonClick={() => delegationCheck(api)}
          color={'neutral'}
          isLoading={api.isLoading}
          errorCode={api.errorCode}
        ></DelegationActionBar>
      );
    });
  };

  const chosenApiActionBars = chosenApis.map((api: DelegableApi) => {
    return (
      <DelegationActionBar
        key={api.identifier}
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
        errorCode={api.errorCode}
      ></DelegationActionBar>
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
          <h3 className={classes.chooseApiSecondHeader}>
            {t('api_delegation.new_api_content_text2')}
          </h3>
          {isSm && chosenApis.length > 0 && (
            <div>
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
            <div>
              <h4 className={classes.explanationTexts}>{t('api_delegation.delegable_apis')}:</h4>
              <div className={classes.delegableApisContainer}>
                <div className={classes.actionBarWrapper}>{delegableApiActionBars()}</div>
              </div>
            </div>
            {!isSm && (
              <div>
                <h4 className={classes.explanationTexts}>{t('api_delegation.chosen_apis')}</h4>
                <div className={classes.delegableApisContainer}>
                  <div className={classes.actionBarWrapper}>{chosenApiActionBars}</div>
                </div>
              </div>
            )}
          </div>
          <GroupElements>
            <Button
              variant={'secondary'}
              onClick={() =>
                navigate(
                  '/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.Overview,
                )
              }
              fullWidth={isSm}
            >
              {t('common.cancel')}
            </Button>
            <Button
              disabled={chosenApis.length < 1}
              fullWidth={isSm}
              onClick={() =>
                navigate(
                  '/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.ChooseOrg,
                )
              }
            >
              {t('common.next')}
            </Button>
          </GroupElements>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
