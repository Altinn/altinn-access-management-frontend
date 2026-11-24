import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsButton, DsParagraph } from '@altinn/altinn-components';

import {
  useSearchResourcesInfiniteQuery,
  type ResourceDelegation,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';
import {
  ResourceList,
  type ResourceListProps,
} from '@/features/amUI/common/ResourceList/ResourceList';

import { CollapsibleContainer } from '../CollapsibleContainer/CollapsibleContainer';
import { SearchHitsStatus } from '../SearchHitsStatus/SearchHitsStatus';
import { useFilteredResources } from '../ResourceList/useFilteredResources';
import { matchesAnySearchWord } from '../ResourceList/utils';

import { ServicesToolbar } from './ServicesToolbar';
import classes from './ServiceSearchLists.module.css';

const searchResultsPerPage = 7;

/** Row behaviour for one of the two lists. */
export type ServiceListConfig = Pick<
  ResourceListProps,
  'onSelect' | 'getItemAs' | 'renderControls'
> & {
  /** Collapsible heading; also names the list in the default search hits message. */
  heading?: string;
  /** Shown when the list is empty and no search or filter is active. */
  noResourcesText?: string;
};

interface ServiceSearchListsProps {
  /** Services already delegated. These make up the first list and are excluded from the second. */
  delegations: ResourceDelegation[] | undefined;
  isLoading?: boolean;
  assignedList?: ServiceListConfig;
  otherList?: ServiceListConfig;
  /** Rendered beside the search toolbar, e.g. a button opening the delegation modal. */
  toolbarAction?: ReactNode;
  size?: ResourceListProps['size'];
  /**
   * Replaces the screen reader / visible search hits text, which by default is
   * "{count} treff i {heading}" per list.
   */
  getSearchHitsMessage?: (hits: { assigned: number; other: number }) => string;
  /**
   * Until a search or service owner filter is active, show only the assigned list and without a
   * heading. The other services list, and its server search, start with the first search.
   */
  hideListHeadingsUntilSearch?: boolean;
}

/**
 * A shared search toolbar over two lists: the services already delegated (filtered client-side)
 * and all other services (searched server-side, paged with "show more").
 */
export const ServiceSearchLists = ({
  delegations,
  isLoading = false,
  assignedList = {},
  otherList = {},
  toolbarAction,
  size = 'md',
  getSearchHitsMessage,
  hideListHeadingsUntilSearch = false,
}: ServiceSearchListsProps) => {
  const { t } = useTranslation();
  const assignedSectionId = useId();
  const otherSectionId = useId();

  const assignedHeading =
    assignedList.heading ?? t('poa_overview_page.services_tab.assigned_services_title');
  const otherHeading =
    otherList.heading ?? t('poa_overview_page.services_tab.other_services_title');

  // Only the debounced search value lives here. The raw, per-keystroke value is owned by
  // ServicesToolbar so that typing does not re-render the service lists below.
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterState, setFilterState] = useState<string[]>([]);
  // How many non-delegated results the "other services" list should try to display. Grows by
  // one page per "show more" click, reset to one page whenever the search changes below.
  const [targetResultCount, setTargetResultCount] = useState(searchResultsPerPage);

  const handleSearchChange = useCallback((search: string) => {
    setDebouncedSearch(search);
    setTargetResultCount(searchResultsPerPage);
  }, []);

  const handleFilterChange = useCallback((filters: string[]) => {
    setFilterState(filters);
    setTargetResultCount(searchResultsPerPage);
  }, []);

  const hasSearch = debouncedSearch !== '' || filterState.length > 0;
  const showListHeadings = hasSearch || !hideListHeadingsUntilSearch;

  const {
    data: searchData,
    currentData: currentSearchData,
    isFetching: isSearchFetching,
    isError: isSearchError,
    hasNextPage,
    fetchNextPage,
  } = useSearchResourcesInfiniteQuery(
    {
      searchString: debouncedSearch,
      ROfilters: filterState,
      resultsPerPage: searchResultsPerPage,
      includeExpired: true,
    },
    { skip: !showListHeadings },
  );

  const resources = useMemo(
    () => (delegations ?? []).map((delegation) => delegation.resource).filter(Boolean),
    [delegations],
  );

  const delegatedIds = useMemo(() => new Set(resources.map((r) => r.identifier)), [resources]);

  // `pages` accumulates every page fetched so far for the current search arguments.
  const searchResources = useMemo(() => {
    return (searchData?.pages.flatMap((p) => p.pageList) ?? []).filter(
      (r) => !delegatedIds.has(r.identifier),
    );
  }, [searchData, delegatedIds]);

  // Resources already assigned are filtered out of each fetched page above, so a fetched page can
  // contribute fewer results than `searchResultsPerPage`. Keep fetching until enough non-delegated
  // results have been found to reach the target, or there is nothing more to fetch.
  useEffect(() => {
    if (
      searchResources.length < targetResultCount &&
      hasNextPage &&
      !isSearchFetching &&
      !isSearchError
    ) {
      void fetchNextPage();
    }
  }, [
    searchResources.length,
    targetResultCount,
    hasNextPage,
    isSearchFetching,
    fetchNextPage,
    isSearchError,
  ]);

  const { resources: filteredResources } = useFilteredResources<ServiceResource>({
    resources,
    serviceOwnerFilter: filterState,
    searchString: debouncedSearch,
    includeExpiredResources: true,
    matchesSearch: matchesAnySearchWord,
  });

  // The backend total also counts delegated services, which are listed under assigned services.
  // currentData is undefined while a new search loads.
  const otherHitsCount = Math.max(
    0,
    (currentSearchData?.pages[0]?.numEntriesTotal ?? 0) - filteredResources.length,
  );
  const searchHits =
    hasSearch && currentSearchData && !isLoading
      ? [
          { count: filteredResources.length, listHeading: assignedHeading },
          { count: otherHitsCount, listHeading: otherHeading },
        ]
      : undefined;
  const searchHitsMessage = getSearchHitsMessage?.({
    assigned: filteredResources.length,
    other: otherHitsCount,
  });

  const assignedResourceList = (
    <ResourceList
      resources={filteredResources}
      isLoading={isLoading}
      enableSearch={false}
      showDetails={false}
      onSelect={assignedList.onSelect}
      getItemAs={assignedList.getItemAs}
      renderControls={assignedList.renderControls}
      noResourcesText={
        hasSearch
          ? t('poa_overview_page.services_tab.no_services_found')
          : (assignedList.noResourcesText ?? t('poa_overview_page.services_tab.no_services'))
      }
      size={size}
    />
  );

  return (
    <>
      <div className={classes.toolbarRow}>
        <ServicesToolbar
          onSearchChange={handleSearchChange}
          filterState={filterState}
          setFilterState={handleFilterChange}
        />
        {toolbarAction}
      </div>
      <SearchHitsStatus
        hits={searchHits}
        message={searchHitsMessage}
        searchString={debouncedSearch + filterState.join('')}
      />
      {showListHeadings ? (
        <section
          aria-labelledby={assignedSectionId}
          className={classes.resourceList}
        >
          <CollapsibleContainer
            heading={assignedHeading}
            searchString={debouncedSearch}
            id={assignedSectionId}
            defaultOpen
          >
            {assignedResourceList}
          </CollapsibleContainer>
        </section>
      ) : (
        <div className={classes.resourceList}>{assignedResourceList}</div>
      )}
      {showListHeadings && (
        <section
          aria-labelledby={otherSectionId}
          className={classes.resourceList}
        >
          <CollapsibleContainer
            heading={otherHeading}
            searchString={debouncedSearch + filterState.join('')}
            id={otherSectionId}
          >
            {isSearchError ? (
              <DsAlert
                role='alert'
                data-color='danger'
              >
                <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
              </DsAlert>
            ) : (
              <>
                <ResourceList
                  resources={searchResources}
                  isLoading={isLoading || (isSearchFetching && searchResources.length === 0)}
                  enableSearch={false}
                  showDetails={false}
                  onSelect={otherList.onSelect}
                  getItemAs={otherList.getItemAs}
                  renderControls={otherList.renderControls}
                  noResourcesText={
                    otherList.noResourcesText ??
                    t('poa_overview_page.services_tab.no_other_services')
                  }
                  size={size}
                />
                {hasNextPage && (
                  <div className={classes.showMoreButton}>
                    <DsButton
                      variant='secondary'
                      data-size='sm'
                      onClick={() => {
                        if (!isSearchFetching) {
                          setTargetResultCount((count) => count + searchResultsPerPage);
                        }
                      }}
                      aria-disabled={isSearchFetching}
                    >
                      {t('common.show_more')}
                    </DsButton>
                  </div>
                )}
              </>
            )}
          </CollapsibleContainer>
        </section>
      )}
    </>
  );
};
