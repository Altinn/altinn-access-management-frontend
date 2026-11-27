import { useCallback, useMemo, useState } from 'react';
import type { FilterState } from '@altinn/altinn-components';

import type { ActivityLogListParam } from '@/rtk/features/activityLogApi';

import { parseActivityLogPickerDate } from './activityLogUtils';
import type { ActivityLogDirection, ActivityLogFilterValueDto } from './types';

/** Filter key for the counterpart: the receivers when the reportee gave access, else the givers. */
export const ACTIVITY_LOG_PARTY_FILTER = 'party';
/**
 * Filter key for the period. `SelectDateFilter` marks it with `fromAndToDate` and keeps the chosen
 * dates (YYYY-MM-DD) under `fromDate` and `toDate` in the same filter state.
 */
export const ACTIVITY_LOG_DATE_FILTER = 'date';

const DATE_FILTER_RANGE = 'fromAndToDate';

/**
 * The query parameter each lookup field (`GET {area}/filter/fields`, lower-cased) narrows. A field
 * the API reports that is not listed here gets no filter on the tab.
 */
export const ACTIVITY_LOG_FIELD_PARAMS: Record<string, ActivityLogListParam> = {
  from: 'from',
  to: 'to',
  via: 'via',
  by: 'by',
  role: 'role',
  package: 'package',
  resource: 'resource',
  source: 'source',
  activitytype: 'typeId',
};

/** One picker on the tab: its filter key, the field whose values it offers and the parameter it narrows. */
export interface ActivityLogValueFilter {
  name: string;
  field: string;
  param: ActivityLogListParam;
}

/** The side of the entries the party filter applies to: the receivers when the reportee gave access. */
export const getActivityLogCounterpartField = (direction: ActivityLogDirection): 'to' | 'from' =>
  direction === 'from' ? 'to' : 'from';

/**
 * The value filters to offer for the fields the area reports, in the area's order. `to` and `from`
 * fold into the party filter, which offers the counterparts of the direction; the other side is
 * always the reportee and gets no filter.
 */
export const getActivityLogValueFilters = (
  filterFields: string[],
  direction: ActivityLogDirection,
): ActivityLogValueFilter[] => {
  const counterpartField = getActivityLogCounterpartField(direction);
  return filterFields.flatMap((field) => {
    const param = ACTIVITY_LOG_FIELD_PARAMS[field];
    if (!param) {
      return [];
    }
    if (field === 'to' || field === 'from') {
      return field === counterpartField ? [{ name: ACTIVITY_LOG_PARTY_FILTER, field, param }] : [];
    }
    return [{ name: field, field, param }];
  });
};

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

/** The ids chosen in one value filter. */
export const getSelectedIds = (filterState: FilterState, name: string): string[] =>
  (filterState[name] ?? []).map(String);

/**
 * The options to offer in each filter picker, keyed like the input: the values the lookup
 * returned, plus any selected value the lookup no longer returns.
 */
export const useActivityLogFilterOptions = (
  valuesByName: Record<string, ActivityLogFilterValueDto[] | undefined>,
  selectedIdsByName: Record<string, string[]>,
): Record<string, ActivityLogFilterValueDto[]> => {
  // A cache of the names seen so far per picker, not render state: nothing re-renders when it
  // grows, and it only ever gains entries from `valuesByName`, which the memo already depends on.
  const [seen] = useState(() => new Map<string, Map<string, ActivityLogFilterValueDto>>());

  return useMemo(
    () =>
      Object.fromEntries(
        Object.entries(valuesByName).map(([name, fetched]) => {
          const values = fetched ?? [];
          const seenForName = seen.get(name) ?? new Map<string, ActivityLogFilterValueDto>();
          seen.set(name, seenForName);
          values.forEach((value) => seenForName.set(value.id, value));
          const missing = (selectedIdsByName[name] ?? [])
            .filter((id) => !values.some((value) => value.id === id))
            .map((id) => seenForName.get(id))
            .filter((value): value is ActivityLogFilterValueDto => value !== undefined);
          return [name, missing.length > 0 ? [...values, ...missing] : values];
        }),
      ),
    [valuesByName, selectedIdsByName, seen],
  );
};

/**
 * Holds what the user has chosen for one area of the activity log: the direction and the filter
 * state (the value filters and the period). Changing the direction clears the party filter, since
 * the parties to choose from differ; the other filters apply to both directions.
 */
export const useActivityLogQueryState = () => {
  const [direction, setDirection] = useState<ActivityLogDirection>('from');
  const [filterState, setFilterState] = useState<FilterState>({});

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
    after,
    before,
    counterpartField: getActivityLogCounterpartField(direction),
  } as const;
};
