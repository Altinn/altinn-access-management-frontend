import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { FilterIcon } from '@navikt/aksel-icons';
import { useParams } from 'react-router';
import {
  DsAlert,
  DsChip,
  DsHeading,
  DsParagraph,
  DsSearch,
  DsSpinner,
  ResourceListItem,
} from '@altinn/altinn-components';
import { useCallback } from 'react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import {
  useGetPaginatedSearchQuery,
  useGetSingleRightsForRightholderQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import { useGetResourceOwnersQuery } from '@/rtk/features/resourceApi';
import { arraysEqual, debounce } from '@/resources/utils';
import { Filter, List } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { AmPagination } from '@/components/Paginering/AmPaginering';
import type { Party } from '@/rtk/features/lookupApi';

import { useDelegationModalContext } from '../DelegationModalContext';

import classes from './ResourceSearch.module.css';

export interface ResourceSearchProps {
  onSelection: (resource: ServiceResource) => void;
  toParty?: Party;
}

const searchResultsPerPage = 7;

export const ResourceSearch = ({ onSelection, toParty }: ResourceSearchProps) => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { searchString, setSearchString, filters, setFilters, currentPage, setCurrentPage } =
    useDelegationModalContext();
  const [debouncedSearchString, setDebouncedSearchString] = React.useState(searchString);
  const {
    data: searchData,
    error,
    isFetching,
  } = useGetPaginatedSearchQuery({
    searchString: debouncedSearchString,
    ROfilters: filters,
    page: currentPage,
    resultsPerPage: searchResultsPerPage,
  });
  const { data: delegatedResources } = useGetSingleRightsForRightholderQuery({
    party: getCookie('AltinnPartyId'),
    userId: id || '',
  });

  const displayPopularResources =
    !searchString && filters.length === 0 && window.featureFlags.displayPopularSingleRightsServices;

  const resources = searchData?.pageList;
  const totalNumberOfResults = searchData?.numEntriesTotal;
  const { data: ROdata } = useGetResourceOwnersQuery();

  const filterOptions = ROdata
    ? ROdata.map((ro) => {
        return {
          label: ro.organisationName,
          value: ro.organisationNumber,
        };
      })
    : [];

  const unCheckFilter = (filter: string) => {
    setFilters((prevState: string[]) => prevState.filter((f) => f !== filter));
    setCurrentPage(1);
  };

  const getFilterLabel = (value: string) => {
    const option = filterOptions.find((option) => option.value === value);
    return option ? option.label : '';
  };

  const filterChips = () => (
    <div className={classes.filterChips}>
      {filters.map((filterValue: string) => (
        <DsChip.Removable
          data-size='sm'
          key={filterValue}
          aria-label={`${t('common.remove')} ${String(getFilterLabel(filterValue))}`}
          onClick={() => {
            unCheckFilter(filterValue);
          }}
        >
          {getFilterLabel(filterValue)}
        </DsChip.Removable>
      ))}
    </div>
  );

  const searchResults = () => {
    if (isFetching) {
      return (
        <div className={classes.spinner}>
          <DsSpinner
            aria-label={t('common.loading')}
            data-size='md'
          />
        </div>
      );
    }
    if (error) {
      return (
        <DsAlert
          role='alert'
          className={classes.searchError}
          data-color='danger'
        >
          <DsHeading
            level={2}
            data-size='xs'
          >
            {t('common.general_error_title')}
          </DsHeading>
          <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
        </DsAlert>
      );
    }
    return (
      <>
        <div className={classes.resultCountAndChips}>
          {totalNumberOfResults !== undefined && (
            <DsParagraph>
              {displayPopularResources
                ? t('single_rights.popular_services')
                : `${String(totalNumberOfResults)} ${t('single_rights.search_hits')}`}
            </DsParagraph>
          )}
          {filterChips()}
        </div>
        <List className={classes.resourceList}>{listedResources}</List>
        {totalNumberOfResults !== undefined &&
          totalNumberOfResults > searchResultsPerPage &&
          !displayPopularResources && (
            <AmPagination
              className={classes.pagination}
              currentPage={currentPage}
              totalPages={Math.ceil(totalNumberOfResults / searchResultsPerPage)}
              setCurrentPage={setCurrentPage}
              size='sm'
              hideLabels={true}
            />
          )}
      </>
    );
  };

  const listedResources = resources?.map((resource: ServiceResource, index: number) => {
    const hasPoa =
      !!delegatedResources &&
      delegatedResources.some(
        (delegation) => delegation.resource?.identifier === resource.identifier,
      );
    return (
      <ResourceListItem
        key={resource.identifier ?? index}
        id={resource.identifier}
        ownerName={resource.resourceOwnerName ?? ''}
        resourceName={resource.title}
        ownerLogoUrl={resource.resourceOwnerLogoUrl}
        ownerLogoUrlAlt={resource.resourceOwnerName}
        onClick={() => onSelection(resource)}
        badge={hasPoa ? { label: t('common.has_poa'), theme: 'base', color: 'success' } : undefined}
      />
    );
  });

  const debouncedSearch = useCallback(
    debounce((searchString: string) => {
      setDebouncedSearchString(searchString);
      setCurrentPage(1);
    }, 300),
    [],
  );

  return (
    <>
      <DsHeading
        level={2}
        data-size='sm'
      >
        <Trans
          i18nKey='delegation_modal.give_service_to_name'
          values={{ name: toParty?.name }}
          components={{ strong: <strong /> }}
        />
      </DsHeading>
      <search className={classes.searchSection}>
        <div className={classes.searchInputs}>
          <div className={classes.searchField}>
            <DsSearch aria-label={t('single_rights.search_label')}>
              <DsSearch.Input
                aria-label={t('single_rights.search_label')}
                placeholder={t('single_rights.search_label')}
                value={searchString}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  debouncedSearch(event.target.value);
                  setSearchString(event.target.value);
                }}
              />
              <DsSearch.Clear
                onClick={() => {
                  setDebouncedSearchString('');
                  setSearchString('');
                  setCurrentPage(1);
                }}
              />
            </DsSearch>
          </div>
          <Filter
            className={classes.filter}
            icon={<FilterIcon />}
            label={t('single_rights.filter_label')}
            options={filterOptions}
            applyButtonLabel={t('common.apply')}
            resetButtonLabel={t('common.reset_choices')}
            closeButtonAriaLabel={t('common.close')}
            searchable
            values={filters}
            onApply={(filtersToApply: string[]) => {
              if (!arraysEqual(filtersToApply, filters)) {
                setFilters(filtersToApply);
                setCurrentPage(1);
              }
            }}
          />
        </div>
        <div className={classes.searchResults}>{searchResults()}</div>
      </search>
    </>
  );
};
