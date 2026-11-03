import React from 'react';

import {
  useGetActivityLogFilterValuesQuery,
  useGetActivityLogInfiniteQuery,
  useGetActivityTypesQuery,
} from '@/rtk/features/activityLogApi';
import { useLanguageCode } from '@/resources/hooks/useLanguageCode';

import { ActivityLogTabPanel } from './ActivityLogTabPanel';
import type { ActivityLogArea } from './types';
import { useActivityLogQueryState } from './useActivityLogQueryState';

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
    counterpartField,
  } = useActivityLogQueryState();

  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetActivityLogInfiniteQuery({
      area,
      direction,
      [counterpartField]: selectedPartyIds,
      pageSize: ACTIVITY_LOG_PAGE_SIZE,
    });
  const { data: partyValues } = useGetActivityLogFilterValuesQuery({
    area,
    direction,
    field: counterpartField,
  });
  const { data: activityTypes } = useGetActivityTypesQuery({ area, language });

  return (
    <ActivityLogTabPanel
      area={area}
      direction={direction}
      onDirectionChange={changeDirection}
      reporteeName={reporteeName}
      filterState={filterState}
      onFilterStateChange={changeFilterState}
      partyOptions={partyValues?.data ?? []}
      entries={data?.pages.flatMap((page) => page.data) ?? []}
      activityTypes={activityTypes}
      isLoading={isLoading}
      isError={isError}
      hasMore={hasNextPage}
      isLoadingMore={isFetchingNextPage}
      onLoadMore={() => void fetchNextPage()}
    />
  );
};
