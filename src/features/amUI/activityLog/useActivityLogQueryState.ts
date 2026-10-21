import { useCallback, useMemo, useState } from 'react';
import type { FilterState } from '@altinn/altinn-components';

import { getCookie } from '@/resources/Cookie/CookieMethods';

import type { ActivityLogDirection, ActivityLogQueryParams } from './types';

export const ACTIVITY_LOG_PAGE_SIZE = 50;
export const ACTIVITY_LOG_PARTY_FILTER = 'party';

/**
 * Holds what the user has chosen for one area of the activity log (direction, party filter and
 * how many pages to show) and turns it into the query parameters the area endpoint expects.
 * Changing the direction or the filter starts over from the first page.
 */
export const useActivityLogQueryState = () => {
  const [direction, setDirection] = useState<ActivityLogDirection>('from');
  const [filterState, setFilterState] = useState<FilterState>({});
  const [pageNo, setPageNo] = useState(0);

  const selectedPartyIds = useMemo(
    () => (filterState[ACTIVITY_LOG_PARTY_FILTER] ?? []).map(String),
    [filterState],
  );

  const changeDirection = useCallback((newDirection: ActivityLogDirection) => {
    setDirection(newDirection);
    setFilterState({});
    setPageNo(0);
  }, []);

  const changeFilterState = useCallback((newFilterState: FilterState) => {
    setFilterState(newFilterState);
    setPageNo(0);
  }, []);

  const loadMore = useCallback(() => setPageNo((current) => current + 1), []);

  const party = getCookie('AltinnPartyUuid') ?? '';

  const queryParams = useMemo<ActivityLogQueryParams>(
    () => ({
      party,
      direction,
      [direction === 'from' ? 'to' : 'from']: selectedPartyIds,
      pageNo,
      pageSize: ACTIVITY_LOG_PAGE_SIZE,
    }),
    [party, direction, selectedPartyIds, pageNo],
  );

  return {
    direction,
    changeDirection,
    filterState,
    changeFilterState,
    selectedPartyIds,
    pageNo,
    loadMore,
    queryParams,
  };
};
