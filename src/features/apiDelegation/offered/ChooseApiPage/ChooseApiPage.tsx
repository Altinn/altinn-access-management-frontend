import { Button, Spinner, Search, Skeleton } from '@digdir/designsystemet-react';
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
} from '@/components';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { ApiDelegationPath } from '@/routes/paths';
import ApiIcon from '@/assets/Api.svg?react';
import { useMediaQuery } from '@/resources/hooks';
import common from '@/resources/css/Common.module.css';
import {
  softAddApi,
  softRemoveApi,
} from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import type { DelegableApi } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import { Filter, type FilterOption } from '@/components/Filter';
import { debounce } from '@/resources/utils';
import type { ResourceReference } from '@/rtk/features/apiDelegation/apiDelegationApi';
import {
  useDelegationCheckMutation,
  useSearchQuery,
} from '@/rtk/features/apiDelegation/apiDelegationApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { DelegationAccessResult } from '@/dataObjects/dtos/resourceDelegation';
import type { ResourceOwner } from '@/rtk/features/resourceApi';
import { ResourceType, useGetResourceOwnersQuery } from '@/rtk/features/resourceApi';

import { ApiActionBar } from '../../components/ApiActionBar';

import classes from './ChooseApiPage.module.css';

export const ChooseApiPage = () => {
  const [searchString, setSearchString] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [filters, setFilters] = useState<string[]>([]);
  const isSm = useMediaQuery('(max-width: 768px)');
  const { t } = useTranslation('common');
  const partyId = getCookie('AltinnPartyId');
  const navigate = useNavigate();
  const [urlParams, setUrlParams] = useSearchParams();

  const chosenApis = useAppSelector((state) => state.delegableApi.chosenApis);
  const dispatch = useAppDispatch();
  const [delegationCheck] = useDelegationCheckMutation();
  const resourceTypeList: ResourceType[] = [ResourceType.MaskinportenSchema];

  const {
    data: searchResults,
    error,
    isFetching,
  } = useSearchQuery({ searchString, ROfilters: filters });

  const { data: apiProviders } = useGetResourceOwnersQuery(resourceTypeList);

  useEffect(() => {
    if (!isFetching && urlParams) {
      makeChosenApisFromParams();
    }
  }, [isFetching]);

  const makeChosenApisFromParams = () => {
    const promises: Promise<void>[] = [];

    for (const key of urlParams.keys()) {
      searchResults?.forEach((api: DelegableApi) => {
        if (api.identifier === key) {
          const resourceRef: ResourceReference = { resource: api.authorizationReference };
          const promise = delegationCheck({
            partyId,
            resourceRef,
          })
            .unwrap()
            .then((response: DelegationAccessResult) => {
              if (response?.status === 'Delegable') {
                dispatch(softAddApi(api));
              }
            });
          promises.push(promise);
        }
      });
    }

    Promise.all(promises).then(() => {
      setShowSkeleton(false);
    });
  };

  const addApiToParams = (api: DelegableApi) => {
    urlParams.append(api.identifier, '');
    setUrlParams(urlParams);
  };

  const handleRemove = (api: DelegableApi) => {
    removeApiFromParams(api);
    dispatch(softRemoveApi(api));
  };

  const removeApiFromParams = (api: DelegableApi) => {
    urlParams.delete(api.identifier);
    setUrlParams(urlParams);
  };

  const filterOptions: FilterOption[] | undefined = apiProviders
    ? apiProviders.map((provider: ResourceOwner) => {
        return {
          label: provider.organisationName,
          value: provider.organisationNumber,
        };
      })
    : [];

  const delegableApiActionBars = () => {
    if (error?.message) {
      return (
        <ErrorPanel
          title={t('api_delegation.data_retrieval_failed')}
          message={error?.message}
          statusCode={error?.statusCode}
        ></ErrorPanel>
      );
    } else if (isFetching) {
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

    const unchosenApis = searchResults?.filter(
      (searchResultApi) => !chosenApis.some((api) => api.identifier === searchResultApi.identifier),
    );

    return unchosenApis?.map((api: DelegableApi) => {
      const initWithDelegationCheck = prechosenApis.includes(api.identifier);
      return (
        <ApiActionBar
          key={api.identifier}
          variant={'add'}
          color={'neutral'}
          api={api}
          onAdd={() => {
            addApiToParams(api);
            dispatch(softAddApi(api));
          }}
          initWithDelegationCheck={initWithDelegationCheck}
        ></ApiActionBar>
      );
    });
  };

  const chosenApiActionBars = chosenApis.map((api: DelegableApi) => {
    return (
      <ApiActionBar
        key={api.identifier}
        api={api}
        variant={'remove'}
        color={'success'}
        onRemove={() => handleRemove(api)}
      ></ApiActionBar>
    );
  });

  const DelegableApiSkeleton = () => {
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

  const ChosenApiSkeleton = () => {
    const skeletonHeight = '66px';
    return Array.from(urlParams).map((_, index) => (
      <Skeleton.Rectangle
        key={index}
        height={skeletonHeight}
      ></Skeleton.Rectangle>
    ));
  };

  const debouncedSearch = debounce((searchString: string) => {
    setSearchString(searchString);
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
          {isSm && (chosenApis.length > 0 || urlParams.size > 0) && (
            <div>
              <h4 className={classes.explanationTexts}>{t('api_delegation.chosen_apis')}</h4>
              <div className={classes.chosenApisContainer}>
                <div className={classes.actionBarWrapper}>
                  {showSkeleton ? ChosenApiSkeleton() : chosenApiActionBars}
                </div>
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
                  setSearchString('');
                }}
              ></Search>
            </div>
            <div className={classes.filter}>
              <Filter
                icon={<FilterIcon />}
                label={String(t('api_delegation.filter_label'))}
                options={filterOptions}
                applyButtonLabel={String(t('common.apply'))}
                resetButtonLabel={String(t('common.reset_choices'))}
                closeButtonAriaLabel={String(t('common.close'))}
                values={filters}
                onApply={(filters) => {
                  setFilters(filters);
                }}
                searchable
                fullScreenModal={isSm}
              />
            </div>
          </div>
          <div className={classes.pageContentActionBarsContainer}>
            <div>
              <h4 className={classes.explanationTexts}>{t('api_delegation.delegable_apis')}:</h4>
              <div className={classes.delegableApisContainer}>
                <div className={classes.actionBarWrapper}>
                  {showSkeleton ? DelegableApiSkeleton() : delegableApiActionBars()}
                </div>
              </div>
            </div>
            {!isSm && (
              <div>
                <h4 className={classes.explanationTexts}>{t('api_delegation.chosen_apis')}</h4>
                <div className={classes.delegableApisContainer}>
                  <div className={classes.actionBarWrapper}>
                    {showSkeleton ? ChosenApiSkeleton() : chosenApiActionBars}
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
