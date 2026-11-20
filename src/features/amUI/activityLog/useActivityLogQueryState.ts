import { useCallback, useMemo, useState } from 'react';
import type { FilterState } from '@altinn/altinn-components';

import type { ActivityLogDirection } from './types';

/** Filter key for the counterpart: the receivers when the reportee gave access, else the givers. */
export const ACTIVITY_LOG_PARTY_FILTER = 'party';
/** Filter key for the user or system that performed the change. */
export const ACTIVITY_LOG_BY_FILTER = 'by';
/**
 * Filter key for the period. `SelectDateFilter` marks it with `fromAndToDate` and keeps the chosen
 * dates (YYYY-MM-DD) under `fromDate` and `toDate` in the same filter state.
 */
export const ACTIVITY_LOG_DATE_FILTER = 'date';

const DATE_FILTER_RANGE = 'fromAndToDate';

export interface ActivityLogDateBounds {
  /** ISO 8601 instant at the start of the chosen first day. */
  after?: string;
  /** ISO 8601 instant at the end of the chosen last day. */
  before?: string;
}

const toInstant = (localDateTime: string): string | undefined => {
  const date = new Date(localDateTime);
  return isNaN(date.getTime()) ? undefined : date.toISOString();
};

/**
 * The `after` and `before` bounds for the chosen period. Removing the date filter clears only its
 * marker, so the dates count only while the marker is set. The days are taken in the user's time
 * zone.
 */
export const getActivityLogDateBounds = (filterState: FilterState): ActivityLogDateBounds => {
  if (filterState[ACTIVITY_LOG_DATE_FILTER]?.[0] !== DATE_FILTER_RANGE) {
    return {};
  }
  const fromDate = filterState.fromDate?.[0];
  const toDate = filterState.toDate?.[0];
  return {
    after: fromDate ? toInstant(`${fromDate}T00:00:00`) : undefined,
    before: toDate ? toInstant(`${toDate}T23:59:59.999`) : undefined,
  };
};

const selectedIds = (filterState: FilterState, name: string): string[] =>
  (filterState[name] ?? []).map(String);

/**
 * Holds what the user has chosen for one area of the activity log: the direction and the filters
 * (counterpart, who performed the change, period). Changing the direction clears the counterpart
 * filter, since the parties to choose from differ; the other filters apply to both directions.
 */
export const useActivityLogQueryState = () => {
  const [direction, setDirection] = useState<ActivityLogDirection>('from');
  const [filterState, setFilterState] = useState<FilterState>({});

  const selectedPartyIds = useMemo(
    () => selectedIds(filterState, ACTIVITY_LOG_PARTY_FILTER),
    [filterState],
  );
  const selectedByIds = useMemo(
    () => selectedIds(filterState, ACTIVITY_LOG_BY_FILTER),
    [filterState],
  );
  const { after, before } = useMemo(() => getActivityLogDateBounds(filterState), [filterState]);

  const changeDirection = useCallback((newDirection: ActivityLogDirection) => {
    setDirection(newDirection);
    setFilterState((current) => {
      const next = { ...current };
      delete next[ACTIVITY_LOG_PARTY_FILTER];
      return next;
    });
  }, []);

  return {
    direction,
    changeDirection,
    filterState,
    changeFilterState: setFilterState,
    selectedPartyIds,
    selectedByIds,
    after,
    before,
    /** The side of the entries the party filter applies to: the receivers when the reportee gave access. */
    counterpartField: direction === 'from' ? 'to' : 'from',
  } as const;
};
