import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { FilterIcon } from '@navikt/aksel-icons';
import { useParams } from 'react-router';
import { DsHeading, DsSearch } from '@altinn/altinn-components';
import { useCallback } from 'react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import {
  useGetPaginatedSearchQuery,
  useGetSingleRightsForRightholderQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import { useGetResourceOwnersQuery } from '@/rtk/features/resourceApi';
import { arraysEqual, debounce } from '@/resources/utils';
import { Filter } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { Party } from '@/rtk/features/lookupApi';

import { useDelegationModalContext } from '../DelegationModalContext';
import { SearchResults } from './SearchResults';
import { FilterChips } from './FilterChips';

import classes from './ResourceSearch.module.css';

export interface ResourceSearchProps {
  onSelect: (resource: ServiceResource) => void;
  toParty?: Party;
}

const searchResultsPerPage = 7;

export const ResourceSearch = ({ onSelect, toParty }: ResourceSearchProps) => {
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
        const label = ro.organisationName || ro.organisationCode;
        return {
          label,
          value: ro.organisationCode,
        };
      })
    : [];

  const unCheckFilter = (filter: string) => {
    setFilters((prevState: string[]) => prevState.filter((f) => f !== filter));
    setCurrentPage(1);
  };

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
        <FilterChips
          filters={filters}
          filterOptions={filterOptions}
          onRemoveFilter={unCheckFilter}
        />
        <div className={classes.searchResults}>
          <SearchResults
            isFetching={isFetching}
            error={error}
            resources={resources}
            searchString={searchString}
            delegatedResources={delegatedResources}
            totalNumberOfResults={totalNumberOfResults}
            displayPopularResources={displayPopularResources}
            currentPage={currentPage}
            searchResultsPerPage={searchResultsPerPage}
            onSelect={onSelect}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </search>
    </>
  );
};
