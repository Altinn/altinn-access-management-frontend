import { Button, Search, Skeleton } from '@digdir/designsystemet-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterIcon } from '@navikt/aksel-icons';
import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Page, PageHeader, PageContent, PageContainer } from '@/components';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { ApiDelegationPath } from '@/routes/paths';
import ApiIcon from '@/assets/Api.svg?react';
import { useMediaQuery } from '@/resources/hooks';
import {
  softAddApi,
  softRemoveApi,
} from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import type { DelegableApi } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import { Filter, type FilterOption } from '@/components/Filter';
import { debounce } from '@/resources/utils';
import {
  useDelegationCheckMutation,
  useSearchQuery,
} from '@/rtk/features/apiDelegation/apiDelegationApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type {
  DelegationAccessResult,
  ResourceReference,
} from '@/dataObjects/dtos/resourceDelegation';
import type { ResourceOwner } from '@/rtk/features/resourceApi';
import { ResourceType, useGetResourceOwnersQuery } from '@/rtk/features/resourceApi';
import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';

import { ApiActionBar } from '../../components/ApiActionBar';

import classes from './ChooseApiPage.module.css';
import { ApiSearchResults } from './ApiSearchResult';

export const ChooseApiPage = () => {
  const [searchString, setSearchString] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [filters, setFilters] = useState<string[]>([]);
  const isSm = useMediaQuery('(max-width: 768px)');
  const { t } = useTranslation();
  const partyId = getCookie('AltinnPartyId');
  const navigate = useNavigate();
  const [urlParams, setUrlParams] = useSearchParams();
  useDocumentTitle(t('api_delegation.delegate_page_title'));

  const chosenApis = useAppSelector((state) => state.delegableApi.chosenApis);
  const dispatch = useAppDispatch();
  const [delegationCheck] = useDelegationCheckMutation();
  const resourceTypeList: ResourceType[] = [ResourceType.MaskinportenSchema];
  const [chosenItemsStatusMessage, setChosenItemsStatusMessage] = useState('');

  const {
    data: searchResults,
    error,
    isFetching,
    isLoading,
  } = useSearchQuery({ searchString, ROfilters: filters });

  const { data: apiProviders } = useGetResourceOwnersQuery(resourceTypeList);

  useEffect(() => {
    if (!isLoading && urlParams) {
      makeChosenApisFromParams();
    }
  }, [isLoading]);

  const makeChosenApisFromParams = () => {
    const promises: Promise<void>[] = [];

    for (const key of urlParams.keys()) {
      searchResults?.forEach((api: DelegableApi) => {
        if (
          api.identifier === key &&
          chosenApis.filter((chosenApi: DelegableApi) => chosenApi.identifier === key).length === 0
        ) {
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
    setChosenItemsStatusMessage(`${t('common.removed')}: ${api.apiName}`);
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

  const chosenApiActionBars = chosenApis.map((api: DelegableApi, index) => {
    return (
      <ApiActionBar
        key={`${api.identifier}${index}`}
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
        <Skeleton
          variant='rectangle'
          height={skeletonHeight}
        />
        <Skeleton
          variant='rectangle'
          height={skeletonHeight}
        />
        <Skeleton
          variant='rectangle'
          height={skeletonHeight}
        />
        <Skeleton
          variant='rectangle'
          height={skeletonHeight}
        />
        <Skeleton
          variant='rectangle'
          height={skeletonHeight}
        />
      </>
    );
  };

  const ChosenApiSkeleton = () => {
    const skeletonHeight = '66px';
    return Array.from(urlParams).map((_, index) => (
      <Skeleton
        variant='rectangle'
        key={index}
        height={skeletonHeight}
      />
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
          <div className={classes.pageContentContainer}>
            <h2 className={classes.chooseApiSecondHeader}>
              {t('api_delegation.new_api_content_text2')}
            </h2>
            <search className={classes.semanticOnlyTag}>
              <div className={classes.searchFormTextInputSection}>
                <Search
                  label={t('api_delegation.search_for_api')}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    debouncedSearch(event.target.value);
                  }}
                  size='md'
                  onClear={() => {
                    setSearchString('');
                  }}
                />
              </div>
              <div className={classes.searchFormFilterSection}>
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
              <div className={classes.searchResultsSection}>
                <StatusMessageForScreenReader>
                  {chosenItemsStatusMessage}
                </StatusMessageForScreenReader>
                <h3 className={classes.explanationTexts}>{t('api_delegation.delegable_apis')}:</h3>
                <div className={classes.delegableApisContainer}>
                  {showSkeleton ? (
                    DelegableApiSkeleton()
                  ) : (
                    <ApiSearchResults
                      addApi={(api) => {
                        addApiToParams(api);
                        dispatch(softAddApi(api));
                        setChosenItemsStatusMessage(`${t('common.added')}: ${api.apiName}`);
                      }}
                      error={error}
                      isFetching={isFetching}
                      urlParams={urlParams}
                      searchResults={searchResults || []}
                      chosenApis={chosenApis}
                    />
                  )}
                </div>
              </div>
            </search>
            <div className={classes.selectedSearchResultsSection}>
              <h3 className={classes.explanationTexts}>{t('api_delegation.chosen_apis')}</h3>
              <div className={classes.delegableApisContainer}>
                <div className={classes.actionBarWrapper}>
                  {showSkeleton ? ChosenApiSkeleton() : chosenApiActionBars}
                </div>
              </div>
            </div>
            <div className={classes.navigationSection}>
              <Button
                variant={'secondary'}
                onClick={() =>
                  navigate(
                    '/' +
                      ApiDelegationPath.OfferedApiDelegations +
                      '/' +
                      ApiDelegationPath.Overview,
                  )
                }
              >
                {t('common.cancel')}
              </Button>
              <Button
                disabled={chosenApis.length < 1}
                onClick={() =>
                  navigate(
                    '/' +
                      ApiDelegationPath.OfferedApiDelegations +
                      '/' +
                      ApiDelegationPath.ChooseOrg,
                  )
                }
              >
                {t('common.next')}
              </Button>
            </div>
          </div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
