import { Button, Spinner, Search } from '@digdir/design-system-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterIcon } from '@navikt/aksel-icons';
import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  Page,
  PageHeader,
  PageContent,
  PageContainer,
  ErrorPanel,
  GroupElements,
  DelegationActionBar,
} from '@/components';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { ApiDelegationPath } from '@/routes/paths';
import ApiIcon from '@/assets/Api.svg?react';
import { useMediaQuery } from '@/resources/hooks';
import common from '@/resources/css/Common.module.css';
import {
  fetchDelegableApis,
  softRemoveApi,
  search,
  filter,
  apiDelegationCheck,
} from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import type { DelegableApi } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import { Filter, type FilterOption } from '@/components/Filter';
import { debounce } from '@/resources/utils';

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
  const [urlParams, setUrlParams] = useSearchParams();

  useEffect(() => {
    if (loading) {
      void fetchData();
    }
    dispatch(filter([]));
    dispatch(search(''));
  }, []);

  useEffect(() => {
    if (!loading && urlParams) {
      makeChosenApisFromParams();
    }
  }, [loading, urlParams]);

  const makeChosenApisFromParams = () => {
    for (const key of urlParams.keys()) {
      presentedApis.forEach((api: DelegableApi) => {
        if (api.identifier === key) {
          dispatch(apiDelegationCheck(api));
        }
      });
    }
  };

  const addApiToParams = (api: DelegableApi) => {
    urlParams.append(api.identifier, '');
    setUrlParams(urlParams);
  };

  const handleRemove = (api: DelegableApi) => {
    removeApiFromParams(api);
    dispatch(softRemoveApi(api));
    dispatch(filter(filters));
    dispatch(search(searchString));
  };

  const removeApiFromParams = (api: DelegableApi) => {
    urlParams.delete(api.identifier);
    setUrlParams(urlParams);
  };

  function handleSearch(searchText: string) {
    setSearchString(searchText);
    dispatch(search(searchText));
  }

  const handleFilterChange = (filterList: string[]) => {
    setFilters(filterList);
    dispatch(filter(filterList));
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
          onActionButtonClick={() => addApiToParams(api)}
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

  const debouncedSearch = debounce((searchString: string) => {
    handleSearch(searchString);
  }, 300);

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
              <Search
                label={t('api_delegation.search_for_api')}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  debouncedSearch(event.target.value);
                }}
                size='medium'
                onClear={() => {
                  handleSearch('');
                }}
              ></Search>
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
