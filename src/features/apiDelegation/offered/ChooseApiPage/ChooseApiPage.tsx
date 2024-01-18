import { SearchField } from '@altinn/altinn-design-system';
import { Button, Skeleton, Spinner } from '@digdir/design-system-react';
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
  softAddApi,
  softRemoveApi,
  search,
  filter,
} from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import type { DelegableApi } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import { Filter, type FilterOption } from '@/components/Filter';
import type { ResourceReference } from '@/rtk/features/apiDelegation/apiDelegationApi';
import { useDelegationCheckMutation } from '@/rtk/features/apiDelegation/apiDelegationApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { DelegationAccessResult } from '@/dataObjects/dtos/resourceDelegation';

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
  const [delegationCheckLoading, setDelegationCheckLoading] = useState(true);

  const partyId = getCookie('AltinnPartyId');

  const [checkCanDelegate, { data: apiAccessResult, isLoading: isCheckingAccesses }] =
    useDelegationCheckMutation();

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
  }, [loading]);

  const makeChosenApisFromParams = () => {
    for (const key of urlParams.keys()) {
      presentedApis.forEach((api: DelegableApi) => {
        if (api.identifier === key) {
          const resourceRef: ResourceReference = { resource: api.authorizationReference };
          checkCanDelegate({ partyId, resourceRef })
            .unwrap()
            .then((response: DelegationAccessResult) => {
              if (response?.status === 'Delegable') {
                dispatch(softAddApi(api));
              }
            });
        }
      });
    }
    setDelegationCheckLoading(false);
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

    const prechosenApis = Array.from(urlParams.keys());

    return presentedApis.map((api: DelegableApi) => {
      const initWithDelegationCheck = prechosenApis.includes(api.identifier);
      return (
        <DelegationActionBar
          key={api.identifier}
          scopeList={api.scopes}
          variant={'add'}
          color={'neutral'}
          api={api}
          onAdd={() => {
            addApiToParams(api);
            dispatch(softAddApi(api));
          }}
          initWithDelegationCheck={initWithDelegationCheck}
        ></DelegationActionBar>
      );
    });
  };

  const chosenApiActionBars = chosenApis.map((api: DelegableApi) => {
    return (
      <DelegationActionBar
        key={api.identifier}
        api={api}
        scopeList={api.scopes}
        variant={'remove'}
        color={'success'}
        onRemove={() => handleRemove(api)}
      ></DelegationActionBar>
    );
  });

  const skeleton = () => {
    const skeletonHeight = '66px';
    return (
      <>
        <Skeleton.Rectangle height={skeletonHeight}></Skeleton.Rectangle>
        <Skeleton.Rectangle height={skeletonHeight}></Skeleton.Rectangle>
        <Skeleton.Rectangle height={skeletonHeight}></Skeleton.Rectangle>
        <Skeleton.Rectangle height={skeletonHeight}></Skeleton.Rectangle>
        <Skeleton.Rectangle height={skeletonHeight}></Skeleton.Rectangle>
      </>
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
          <h3 className={classes.chooseApiSecondHeader}>
            {t('api_delegation.new_api_content_text2')}
          </h3>
          {isSm && chosenApis.length > 0 && (
            <div>
              <h4>{t('api_delegation.chosen_apis')}</h4>
              <div className={classes.chosenApisContainer}>
                <div className={classes.actionBarWrapper}>
                  {delegationCheckLoading ? skeleton() : chosenApiActionBars}
                </div>
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
                <div className={classes.actionBarWrapper}>
                  {delegationCheckLoading ? skeleton() : delegableApiActionBars()}
                </div>
              </div>
            </div>
            {!isSm && (
              <div>
                <h4 className={classes.explanationTexts}>{t('api_delegation.chosen_apis')}</h4>
                <div className={classes.delegableApisContainer}>
                  <div className={classes.actionBarWrapper}>
                    {delegationCheckLoading ? skeleton() : chosenApiActionBars}
                  </div>
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
