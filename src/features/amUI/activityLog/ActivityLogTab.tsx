import React, { useState } from 'react';

import {
  useGetActivityLogFilterValuesQuery,
  useGetActivityLogInfiniteQuery,
  useGetActivityTypesQuery,
} from '@/rtk/features/activityLogApi';
import { useLanguageCode } from '@/resources/hooks/useLanguageCode';
import { getCookie } from '@/resources/Cookie/CookieMethods';

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
  // Read once per mounted view and passed explicitly, so the reportee is part of the cache key
  const [party] = useState(() => getCookie('AltinnPartyUuid'));
  const {
    direction,
    changeDirection,
    filterState,
    changeFilterState,
    selectedPartyIds,
    counterpartField,
  } = useActivityLogQueryState();

  const { currentData, isFetching, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetActivityLogInfiniteQuery({
      area,
      party,
      direction,
      [counterpartField]: selectedPartyIds,
      pageSize: ACTIVITY_LOG_PAGE_SIZE,
    });
  const isLoading = isFetching && !isFetchingNextPage;
  const { data: partyValues } = useGetActivityLogFilterValuesQuery({
    area,
    party,
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
