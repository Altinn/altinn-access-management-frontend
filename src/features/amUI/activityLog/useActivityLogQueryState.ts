import { useCallback, useMemo, useState } from 'react';
import type { FilterState } from '@altinn/altinn-components';

import { parseActivityLogPickerDate } from './activityLogUtils';
import type { ActivityLogDirection, ActivityLogFilterValueDto } from './types';

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

const endOfDay = (date: Date): Date => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

/**
 * The `after` and `before` bounds for the chosen period: the whole first and last day in the
 * user's time zone. The dates count only while the date filter's marker is set.
 */
export const getActivityLogDateBounds = (filterState: FilterState): ActivityLogDateBounds => {
  if (filterState[ACTIVITY_LOG_DATE_FILTER]?.[0] !== DATE_FILTER_RANGE) {
    return {};
  }
  const from = parseActivityLogPickerDate(filterState.fromDate?.[0]?.toString());
  const to = parseActivityLogPickerDate(filterState.toDate?.[0]?.toString());
  return {
    after: from?.toISOString(),
    before: to ? endOfDay(to).toISOString() : undefined,
  };
};

/**
 * Removing the date filter deletes only its marker, and `SelectDateFilter` would pick the dates
 * left behind up again the next time it opens. Drop them together with the marker.
 */
export const withoutStaleDates = (filterState: FilterState): FilterState => {
  if (filterState[ACTIVITY_LOG_DATE_FILTER] || (!filterState.fromDate && !filterState.toDate)) {
    return filterState;
  }
  const next = { ...filterState };
  delete next.fromDate;
  delete next.toDate;
  return next;
};

/**
 * The options to offer in a filter picker: the values the lookup returned, plus any selected value
 * the lookup no longer returns.
 */
export const useActivityLogFilterOptions = (
  fetched: ActivityLogFilterValueDto[] | undefined,
  selectedIds: string[],
): ActivityLogFilterValueDto[] => {
  // A cache of the names seen so far, not render state: nothing re-renders when it grows, and it
  // only ever gains entries from `fetched`, which the memo already depends on.
  const [seen] = useState(() => new Map<string, ActivityLogFilterValueDto>());

  return useMemo(() => {
    const values = fetched ?? [];
    values.forEach((value) => seen.set(value.id, value));
    const missing = selectedIds
      .filter((id) => !values.some((value) => value.id === id))
      .map((id) => seen.get(id))
      .filter((value): value is ActivityLogFilterValueDto => value !== undefined);
    return missing.length > 0 ? [...values, ...missing] : values;
  }, [fetched, selectedIds, seen]);
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

  const changeFilterState = useCallback(
    (newFilterState: FilterState) => setFilterState(withoutStaleDates(newFilterState)),
    [],
  );

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
    changeFilterState,
    selectedPartyIds,
    selectedByIds,
    after,
    before,
    /** The side of the entries the party filter applies to: the receivers when the reportee gave access. */
    counterpartField: direction === 'from' ? 'to' : 'from',
  } as const;
};
