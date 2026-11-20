import React from 'react';

import {
  useGetActivityLogFilterValuesQuery,
  useGetActivityLogInfiniteQuery,
  useGetActivityTypesQuery,
} from '@/rtk/features/activityLogApi';
import { useLanguageCode } from '@/resources/hooks/useLanguageCode';

import { ActivityLogTabPanel } from './ActivityLogTabPanel';
import type { ActivityLogArea } from './types';
import { useActivityLogFilterOptions, useActivityLogQueryState } from './useActivityLogQueryState';

export const ACTIVITY_LOG_PAGE_SIZE = 50;

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

  const { currentData, isFetching, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetActivityLogInfiniteQuery({ ...search, pageSize: ACTIVITY_LOG_PAGE_SIZE });
  const isLoading = isFetching && !isFetchingNextPage;
  const { data: partyValues } = useGetActivityLogFilterValuesQuery({
    ...search,
    field: counterpartField,
  });
  const { data: byValues } = useGetActivityLogFilterValuesQuery({ ...search, field: 'by' });
  const partyOptions = useActivityLogFilterOptions(partyValues?.data, selectedPartyIds);
  const byOptions = useActivityLogFilterOptions(byValues?.data, selectedByIds);
  const { data: activityTypes } = useGetActivityTypesQuery({ area, language });

  return (
    <ActivityLogTabPanel
      area={area}
      direction={direction}
      onDirectionChange={changeDirection}
      reporteeName={reporteeName}
      filterState={filterState}
      onFilterStateChange={changeFilterState}
      partyOptions={partyOptions}
      byOptions={byOptions}
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
