import * as React from 'react';
import { DsHeading, formatDisplayName } from '@altinn/altinn-components';
import { Trans } from 'react-i18next';

import { arraysEqual } from '@/resources/utils';
import { useDebouncedValue } from '@/resources/hooks';
import { ResourceType, useGetResourceOwnersQuery } from '@/rtk/features/resourceApi';
import {
  useGetMaskinportenResourcesQuery,
  useSearchMaskinportenScopesQuery,
} from '@/rtk/features/maskinportenApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { PartyType } from '@/rtk/features/userInfoApi';
import { ResourceFilterToolbar } from '@/features/amUI/common/ResourceFilterToolbar/ResourceFilterToolbar';

import { useDelegationModalContext } from '../common/DelegationModal/DelegationModalContext';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ScopeSearchResults } from './ScopeSearchResults';

import classes from '../common/DelegationModal/SingleRights/ResourceSearch.module.css';

const searchResultsPerPage = 7;

export const ScopeSearch = ({
  onSelect,
}: {
  onSelect: (resource: ServiceResource, error?: boolean) => void;
}) => {
  const { fromParty, toParty } = usePartyRepresentation();
  const { searchString, setSearchString, filters, setFilters, currentPage, setCurrentPage } =
    useDelegationModalContext();
  const supplier = toParty?.orgNumber ?? '';

  const debouncedSearchString = useDebouncedValue(searchString, searchString ? 300 : 0);

  const { data, error, isFetching } = useSearchMaskinportenScopesQuery({
    searchString: debouncedSearchString,
    ROfilters: filters,
    page: currentPage,
    resultsPerPage: searchResultsPerPage,
  });
  const { data: resourceOwners } = useGetResourceOwnersQuery([ResourceType.MaskinportenSchema]);
  const { data: delegatedResources } = useGetMaskinportenResourcesQuery(
    {
      party: fromParty?.partyUuid,
      supplier,
    },
    {
      skip: !fromParty?.partyUuid || !supplier,
      refetchOnMountOrArgChange: true,
    },
  );

  const resources = data?.pageList;
  const totalNumberOfResults = data?.numEntriesTotal;
  const filterOptions =
    resourceOwners?.map((owner) => ({
      label: owner.organisationName ?? owner.organisationCode,
      value: owner.organisationCode,
    })) ?? [];
  const toPartyName = formatDisplayName({
    fullName: toParty?.name ?? '',
    type: toParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
  });

  const setSearch = (value: string) => {
    setSearchString(value);
    setCurrentPage(1);
  };

  return (
    <>
      <DsHeading
        level={2}
        data-size='sm'
      >
        <Trans
          i18nKey='maskinporten_page.search_scopes_heading'
          values={{ name: toPartyName }}
          components={{ strong: <strong /> }}
        />
      </DsHeading>
      <div className={classes.toolbarContainer}>
        <ResourceFilterToolbar
          search={searchString}
          setSearch={setSearch}
          filterState={filters}
          setFilterState={(filtersToApply) => {
            if (!arraysEqual(filtersToApply, filters)) {
              setFilters(filtersToApply ?? []);
              setCurrentPage(1);
            }
          }}
          serviceOwnerOptions={filterOptions}
        />
      </div>
      <div className={classes.searchResults}>
        <ScopeSearchResults
          isFetching={isFetching}
          error={error}
          resources={resources}
          searchString={searchString}
          delegatedResources={delegatedResources}
          totalNumberOfResults={totalNumberOfResults}
          currentPage={currentPage}
          searchResultsPerPage={searchResultsPerPage}
          onSelect={onSelect}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};
