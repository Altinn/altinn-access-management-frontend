import * as React from 'react';
import { useCallback, useEffect } from 'react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import {
  useGetPaginatedSearchQuery,
  useGetSingleRightsForRightholderQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import { useGetResourceOwnersQuery } from '@/rtk/features/resourceApi';
import { arraysEqual, debounce } from '@/resources/utils';
import type { PartyEntity } from '@/dataObjects/dtos/Party';

import { useDelegationModalContext } from '../DelegationModalContext';
import { ResourceFilterToolbar } from '../../ResourceFilterToolbar/ResourceFilterToolbar';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { type DelegationAction } from '../EditModal';

import { SearchResults } from './SearchResults';
import classes from './ResourceSearch.module.css';

export interface ResourceSearchProps {
  onSelect: (resource: ServiceResource, error?: boolean) => void;
  toParty?: PartyEntity;
  availableActions?: DelegationAction[];
}

const searchResultsPerPage = 7;

export const ResourceSearch = ({ onSelect, availableActions }: ResourceSearchProps) => {
  const { actingParty, fromParty, toParty } = usePartyRepresentation();
  const {
    searchString,
    setSearchString,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    includeExpiredResources,
    setIncludeExpiredResources,
  } = useDelegationModalContext();
  const [debouncedSearchString, setDebouncedSearchString] = React.useState(searchString);

  useEffect(() => {
    if (!searchString) {
      debouncedSearch.cancel?.();
      setDebouncedSearchString('');
    }
  }, [searchString]);

  const {
    data: searchData,
    error,
    isFetching,
  } = useGetPaginatedSearchQuery({
    searchString: debouncedSearchString,
    ROfilters: filters,
    page: currentPage,
    resultsPerPage: searchResultsPerPage,
    includeExpired: includeExpiredResources,
  });
  const { data: delegatedResources } = useGetSingleRightsForRightholderQuery(
    {
      actingParty: actingParty?.id || '',
      from: fromParty?.id || '',
      to: toParty?.id || '',
    },
    { skip: !toParty || !fromParty || !actingParty },
  );

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

  const debouncedSearch = useCallback(
    debounce((searchString: string) => {
      setDebouncedSearchString(searchString);
      setCurrentPage(1);
    }, 300),
    [],
  );

  return (
    <>
      <div className={classes.toolbarContainer}>
        <ResourceFilterToolbar
          search={searchString}
          setSearch={(searchString: string) => {
            debouncedSearch(searchString);
            setSearchString(searchString);
          }}
          filterState={filters}
          setFilterState={(filtersToApply: string[]) => {
            if (!arraysEqual(filtersToApply, filters)) {
              setFilters(filtersToApply ?? []);
              setCurrentPage(1);
            }
          }}
          serviceOwnerOptions={filterOptions}
          expiredToggle={{
            checked: includeExpiredResources,
            onChange: (checked) => {
              setCurrentPage(1);
              setIncludeExpiredResources(checked);
            },
          }}
        />
      </div>
      <div className={classes.searchResults}>
        <SearchResults
          isFetching={isFetching}
          error={error}
          resources={resources}
          searchString={debouncedSearchString}
          delegatedResources={delegatedResources}
          totalNumberOfResults={totalNumberOfResults}
          currentPage={currentPage}
          searchResultsPerPage={searchResultsPerPage}
          onSelect={onSelect}
          setCurrentPage={setCurrentPage}
          availableActions={availableActions}
        />
      </div>
    </>
  );
};
