import * as React from 'react';
import {
  DsAlert,
  DsHeading,
  DsParagraph,
  DsSpinner,
  formatDisplayName,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { AmPagination } from '@/components/Paginering/AmPaginering';
import { ResourceFilterToolbar } from '@/features/amUI/common/ResourceFilterToolbar/ResourceFilterToolbar';
import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';
import { debounce } from '@/resources/utils';
import { ResourceType, useGetResourceOwnersQuery } from '@/rtk/features/resourceApi';
import { useSearchMaskinportenScopesQuery } from '@/rtk/features/maskinportenApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { PartyType } from '@/rtk/features/userInfoApi';

import classes from '../common/DelegationModal/SingleRights/ResourceSearch.module.css';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

const searchResultsPerPage = 7;

const getScopeCount = (resource: ServiceResource) =>
  resource.resourceReferences?.filter(
    (reference) => reference.referenceType === 'MaskinportenScope' && reference.reference?.trim(),
  ).length ?? 0;

export const MaskinportenScopeSearch = ({
  onSelect,
  searchString,
  setSearchString,
}: {
  onSelect: (resource: ServiceResource) => void;
  searchString: string;
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { t } = useTranslation();
  const { toParty } = usePartyRepresentation();
  const [debouncedSearchString, setDebouncedSearchString] = React.useState(searchString);
  const [filters, setFilters] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);

  const debouncedSearch = React.useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearchString(value);
        setCurrentPage(1);
      }, 300),
    [],
  );

  React.useEffect(() => {
    return () => debouncedSearch.cancel?.();
  }, [debouncedSearch]);

  React.useEffect(() => {
    if (!searchString) {
      debouncedSearch.cancel?.();
      setDebouncedSearchString('');
      setCurrentPage(1);
    }
  }, [debouncedSearch, searchString]);

  const { data, error, isFetching } = useSearchMaskinportenScopesQuery({
    searchString: debouncedSearchString,
    ROfilters: filters,
    page: currentPage,
    resultsPerPage: searchResultsPerPage,
  });
  const { data: resourceOwners } = useGetResourceOwnersQuery([ResourceType.MaskinportenSchema]);

  const resources = data?.pageList ?? [];
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
    if (!value) {
      debouncedSearch.cancel?.();
      setDebouncedSearchString('');
      setCurrentPage(1);
      return;
    }
    debouncedSearch(value);
  };

  return (
    <>
      <DsHeading
        level={2}
        data-size='sm'
      >
        {t('maskinporten_page.search_scopes_heading', { name: toPartyName })}
      </DsHeading>
      <div className={classes.toolbarContainer}>
        <ResourceFilterToolbar
          search={searchString}
          setSearch={setSearch}
          filterState={filters}
          setFilterState={(nextFilters) => {
            setFilters(nextFilters);
            setCurrentPage(1);
          }}
          serviceOwnerOptions={filterOptions}
        />
      </div>
      <div className={classes.searchResults}>
        {isFetching ? (
          <div className={classes.spinner}>
            <DsSpinner
              aria-label={t('common.loading')}
              data-size='md'
            />
          </div>
        ) : error ? (
          <DsAlert
            role='alert'
            data-color='danger'
          >
            <DsHeading
              level={3}
              data-size='xs'
            >
              {t('common.general_error_title')}
            </DsHeading>
            <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
          </DsAlert>
        ) : (
          <>
            {totalNumberOfResults !== undefined && (
              <DsParagraph>
                {String(totalNumberOfResults)} {t('single_rights.search_hits')}
              </DsParagraph>
            )}
            {resources.length > 0 ? (
              <ResourceList
                resources={resources}
                enableSearch={false}
                showDetails={false}
                onSelect={onSelect}
                size='sm'
                titleAs='h3'
                getBadge={(resource) => {
                  return {
                    label: t('maskinporten_page.scope_count', { count: getScopeCount(resource) }),
                    color: 'neutral',
                  };
                }}
              />
            ) : (
              <DsParagraph data-size='md'>
                {searchString
                  ? t('resource_list.no_resources_filtered', { searchTerm: searchString })
                  : t('maskinporten_page.no_scopes')}
              </DsParagraph>
            )}
            {totalNumberOfResults !== undefined && totalNumberOfResults > searchResultsPerPage && (
              <AmPagination
                className={classes.pagination}
                currentPage={currentPage}
                totalPages={Math.ceil(totalNumberOfResults / searchResultsPerPage)}
                setCurrentPage={setCurrentPage}
                size='xs'
                hideLabels={true}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};
