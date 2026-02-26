import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { DsHeading } from '@altinn/altinn-components';
import { useCallback } from 'react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import {
  useGetPaginatedSearchQuery,
  useGetSingleRightsForRightholderQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import { useGetResourceOwnersQuery } from '@/rtk/features/resourceApi';
import { arraysEqual, debounce } from '@/resources/utils';
import type { Party } from '@/rtk/features/lookupApi';

import { useDelegationModalContext } from '../DelegationModalContext';
import { SearchResults } from './SearchResults';
import { ResourceFilterToolbar } from '../../ResourceFilterToolbar/ResourceFilterToolbar';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';

import classes from './ResourceSearch.module.css';
import { DelegationAction } from '../EditModal';

export interface ResourceSearchProps {
  onSelect: (resource: ServiceResource, error?: boolean) => void;
  toParty?: Party;
  availableActions?: DelegationAction[];
}

const searchResultsPerPage = 7;

export const ResourceSearch = ({ onSelect, availableActions }: ResourceSearchProps) => {
  const { t } = useTranslation();

  const { actingParty, fromParty, toParty } = usePartyRepresentation();
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
    includeA2Services: false,
    includeMigratedApps: true,
  });
  const { data: delegatedResources } = useGetSingleRightsForRightholderQuery(
    {
      actingParty: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid || '',
      to: toParty?.partyUuid || '',
    },
    { skip: !toParty || !fromParty || !actingParty },
  );

  const displayPopularResources =
    !searchString &&
    filters.length === 0 &&
    window.featureFlags.displayPopularSingleRightsServices &&
    false; // Popular resources are currently disabled as the list is not curated for the new UI. Will be re-enabled when a curated list is in place.

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
        />
      </div>
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
          availableActions={availableActions}
        />
      </div>
    </>
  );
};
