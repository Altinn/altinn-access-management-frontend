import React, { useState } from 'react';

import {
  useGetActivityLogFilterFieldsQuery,
  useGetActivityLogFilterValuesQuery,
  useGetActivityLogInfiniteQuery,
  useGetActivityTypesQuery,
} from '@/rtk/features/activityLogApi';
import { useDebouncedValue } from '@/resources/hooks';
import { useLanguageCode } from '@/resources/hooks/useLanguageCode';

import { ActivityLogTabPanel } from './ActivityLogTabPanel';
import type { ActivityLogArea } from './types';
import {
  ACTIVITY_LOG_BY_FILTER,
  useActivityLogFilterOptions,
  useActivityLogQueryState,
} from './useActivityLogQueryState';

export const ACTIVITY_LOG_PAGE_SIZE = 50;
/** How many values a filter picker offers at a time; the user narrows them by searching. */
export const ACTIVITY_LOG_FILTER_PAGE_SIZE = 20;

/** The filter fields assumed when the area's own list cannot be fetched. */
const FALLBACK_FILTER_FIELDS = ['from', 'to', ACTIVITY_LOG_BY_FILTER];

/** What the user has typed in a filter picker, settled for the lookup: trimmed, debounced and empty when cleared. */
const useFilterSearchTerm = () => {
  const [term, setTerm] = useState('');
  const settled = useDebouncedValue(term, term ? 300 : 0).trim();
  return { term: settled || undefined, setTerm };
};

/** Fetches one area of the activity log for the current reportee and renders it. */
export const ActivityLogTab = ({
  area,
  reporteeName,
}: {
  area: ActivityLogArea;
  reporteeName: string;
}) => {
  const language = useLanguageCode();
  const {
    direction,
    changeDirection,
    filterState,
    changeFilterState,
    selectedPartyIds,
    selectedByIds,
    after,
    before,
    counterpartField,
  } = useActivityLogQueryState();
  const partySearch = useFilterSearchTerm();
  const bySearch = useFilterSearchTerm();

  // The area says which filters apply to it; until it has answered only the period can be chosen.
  const { data: fetchedFilterFields, isError: isFilterFieldsError } =
    useGetActivityLogFilterFieldsQuery({ area });
  const filterFields = fetchedFilterFields ?? (isFilterFieldsError ? FALLBACK_FILTER_FIELDS : []);
  const hasPartyFilter = filterFields.includes(counterpartField);
  const hasByFilter = filterFields.includes(ACTIVITY_LOG_BY_FILTER);

  // The same search for the entries and the filter pickers, so the pickers only offer values that
  // give hits; the API disregards the filter for the field being looked up.
  const search = {
    area,
    direction,
    [counterpartField]: selectedPartyIds,
    by: selectedByIds,
    after,
    before,
  };
  // The pickers show the most recent values first and let the user search the rest on the server.
  const lookup = { ...search, orderBy: 'When' as const, pageSize: ACTIVITY_LOG_FILTER_PAGE_SIZE };

  const { currentData, isFetching, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetActivityLogInfiniteQuery({ ...search, pageSize: ACTIVITY_LOG_PAGE_SIZE });
  const isLoading = isFetching && !isFetchingNextPage;
  const partyValues = useGetActivityLogFilterValuesQuery(
    { ...lookup, field: counterpartField, term: partySearch.term },
    { skip: !hasPartyFilter },
  );
  const byValues = useGetActivityLogFilterValuesQuery(
    { ...lookup, field: ACTIVITY_LOG_BY_FILTER, term: bySearch.term },
    { skip: !hasByFilter },
  );
  const partyOptions = useActivityLogFilterOptions(partyValues.data?.data, selectedPartyIds);
  const byOptions = useActivityLogFilterOptions(byValues.data?.data, selectedByIds);
  const { data: activityTypes } = useGetActivityTypesQuery({ area, language });

  return (
    <ActivityLogTabPanel
      area={area}
      direction={direction}
      onDirectionChange={changeDirection}
      reporteeName={reporteeName}
      filterState={filterState}
      onFilterStateChange={changeFilterState}
      filterFields={filterFields}
      partyOptions={partyOptions}
      onPartySearch={partySearch.setTerm}
      isPartyOptionsLoading={partyValues.isLoading}
      byOptions={byOptions}
      onBySearch={bySearch.setTerm}
      isByOptionsLoading={byValues.isLoading}
      entries={currentData?.pages.flatMap((page) => page.data) ?? []}
      activityTypes={activityTypes}
      isLoading={isLoading}
      isError={isError}
      hasMore={hasNextPage}
      isLoadingMore={isFetchingNextPage}
      onLoadMore={() => void fetchNextPage()}
    />
  );
};
