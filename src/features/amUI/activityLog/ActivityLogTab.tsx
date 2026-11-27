import React, { useCallback, useMemo, useState } from 'react';

import {
  type ActivityLogListParam,
  type ActivityLogQueryArgs,
  useGetActivityLogFilterFieldsQuery,
  useGetActivityLogFilterOptionsQuery,
  useGetActivityLogFilterValuesQuery,
  useGetActivityLogInfiniteQuery,
} from '@/rtk/features/activityLogApi';
import { useDebouncedValue } from '@/resources/hooks';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { ActivityLogTabPanel } from './ActivityLogTabPanel';
import type { ActivityLogArea } from './types';
import {
  getActivityLogValueFilters,
  getSelectedIds,
  useActivityLogFilterOptions,
  useActivityLogQueryState,
} from './useActivityLogQueryState';

export const ACTIVITY_LOG_PAGE_SIZE = 50;
/** How many values a filter picker offers at a time; the user narrows them by searching. */
export const ACTIVITY_LOG_FILTER_PAGE_SIZE = 20;

/** The filter fields assumed when the area's own list cannot be fetched. */
const FALLBACK_FILTER_FIELDS = ['from', 'to', 'by'];

/** What is typed in the one picker that is open. */
interface PickerSearch {
  name: string;
  term: string;
}

/** Fetches one area of the activity log for the current reportee and renders it. */
export const ActivityLogTab = ({
  area,
  reporteeName,
}: {
  area: ActivityLogArea;
  reporteeName: string;
}) => {
  // Read once per mounted view and passed explicitly, so the reportee is part of the cache key.
  const [party] = useState(() => getCookie('AltinnPartyUuid'));
  const { direction, changeDirection, filterState, changeFilterState, after, before } =
    useActivityLogQueryState();

  // The area says which filters apply to it; until it has answered only the period can be chosen.
  const { data: fetchedFilterFields, isError: isFilterFieldsError } =
    useGetActivityLogFilterFieldsQuery({ area });
  const valueFilters = useMemo(
    () =>
      getActivityLogValueFilters(
        fetchedFilterFields ?? (isFilterFieldsError ? FALLBACK_FILTER_FIELDS : []),
        direction,
      ),
    [fetchedFilterFields, isFilterFieldsError, direction],
  );
  const selectedIdsByName = useMemo(
    () =>
      Object.fromEntries(
        valueFilters.map((filter) => [filter.name, getSelectedIds(filterState, filter.name)]),
      ),
    [valueFilters, filterState],
  );

  // The same search for the entries and the filter pickers, so the pickers only offer values that
  // give hits; the API disregards the filter for the field being looked up.
  const selectedParams: Partial<Record<ActivityLogListParam, string[]>> = {};
  valueFilters.forEach((filter) => {
    selectedParams[filter.param] = selectedIdsByName[filter.name];
  });
  const search: ActivityLogQueryArgs = {
    area,
    party,
    direction,
    after,
    before,
    ...selectedParams,
  };
  // The pickers show the most recent values first and let the user search the rest on the server.
  const lookup = { ...search, orderBy: 'When' as const, pageSize: ACTIVITY_LOG_FILTER_PAGE_SIZE };

  const { currentData, isFetching, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetActivityLogInfiniteQuery({ ...search, pageSize: ACTIVITY_LOG_PAGE_SIZE });
  const isLoading = isFetching && !isFetchingNextPage;
  const { data: defaultValues, isLoading: isDefaultValuesLoading } =
    useGetActivityLogFilterOptionsQuery(
      { ...lookup, fields: valueFilters.map((filter) => filter.field) },
      { skip: valueFilters.length === 0 },
    );

  // At most one picker is open, so at most one of them is being searched on the server. Its hits
  // replace the picker's default values once they arrive; until then the picker narrows what it has.
  const [pickerSearch, setPickerSearch] = useState<PickerSearch>();
  const term = useDebouncedValue(pickerSearch?.term ?? '', pickerSearch?.term ? 300 : 0).trim();
  const searchedFilter = term
    ? valueFilters.find((filter) => filter.name === pickerSearch?.name)
    : undefined;
  const { currentData: searchHits } = useGetActivityLogFilterValuesQuery(
    { ...lookup, field: searchedFilter?.field ?? '', term },
    { skip: !searchedFilter },
  );
  const onValueFilterSearch = useCallback(
    (name: string, newTerm: string) =>
      setPickerSearch(newTerm ? { name, term: newTerm } : undefined),
    [],
  );

  const valuesByName = useMemo(
    () =>
      Object.fromEntries(
        valueFilters.map((filter) => [
          filter.name,
          searchedFilter?.name === filter.name && searchHits
            ? searchHits.data
            : defaultValues?.[filter.field],
        ]),
      ),
    [valueFilters, searchedFilter, searchHits, defaultValues],
  );
  const optionsByName = useActivityLogFilterOptions(valuesByName, selectedIdsByName);

  return (
    <ActivityLogTabPanel
      area={area}
      direction={direction}
      onDirectionChange={changeDirection}
      reporteeName={reporteeName}
      filterState={filterState}
      onFilterStateChange={changeFilterState}
      valueFilters={valueFilters.map((filter) => ({
        name: filter.name,
        field: filter.field,
        options: optionsByName[filter.name] ?? [],
        isLoading: isDefaultValuesLoading,
      }))}
      onValueFilterSearch={onValueFilterSearch}
      entries={currentData?.pages.flatMap((page) => page.data) ?? []}
      isLoading={isLoading}
      isError={isError}
      hasMore={hasNextPage}
      isLoadingMore={isFetchingNextPage}
      onLoadMore={() => void fetchNextPage()}
    />
  );
};
