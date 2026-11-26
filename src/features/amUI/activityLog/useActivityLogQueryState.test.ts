import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  ACTIVITY_LOG_DATE_FILTER,
  ACTIVITY_LOG_PARTY_FILTER,
  getActivityLogDateBounds,
  getActivityLogValueFilters,
  getSelectedIds,
  useActivityLogFilterOptions,
  useActivityLogQueryState,
  withoutStaleDates,
} from './useActivityLogQueryState';

const ACTIVITY_LOG_BY_FILTER = 'by';

const localInstant = (localDateTime: string) => new Date(localDateTime).toISOString();

describe('getActivityLogDateBounds', () => {
  it('bounds the period by the whole first and last day in local time', () => {
    expect(
      getActivityLogDateBounds({
        [ACTIVITY_LOG_DATE_FILTER]: ['fromAndToDate'],
        fromDate: ['2025-01-01'],
        toDate: ['2025-01-31'],
      }),
    ).toEqual({
      after: localInstant('2025-01-01T00:00:00'),
      before: localInstant('2025-01-31T23:59:59.999'),
    });
  });

  it('leaves an end open when only one date is chosen', () => {
    expect(
      getActivityLogDateBounds({
        [ACTIVITY_LOG_DATE_FILTER]: ['fromAndToDate'],
        fromDate: ['2025-01-01'],
      }),
    ).toEqual({ after: localInstant('2025-01-01T00:00:00'), before: undefined });
  });

  it('ignores dates left behind once the date filter is removed', () => {
    expect(getActivityLogDateBounds({ fromDate: ['2025-01-01'], toDate: ['2025-01-31'] })).toEqual(
      {},
    );
  });

  it('ignores dates that cannot be parsed', () => {
    expect(
      getActivityLogDateBounds({
        [ACTIVITY_LOG_DATE_FILTER]: ['fromAndToDate'],
        fromDate: ['nope'],
      }),
    ).toEqual({ after: undefined, before: undefined });
  });
});

describe('withoutStaleDates', () => {
  it('drops the dates once the date filter is gone', () => {
    expect(
      withoutStaleDates({ fromDate: ['2025-01-01'], toDate: ['2025-01-31'], by: ['helle'] }),
    ).toEqual({ by: ['helle'] });
  });

  it('keeps the dates while the date filter is set, and leaves other state alone', () => {
    const withDates = {
      [ACTIVITY_LOG_DATE_FILTER]: ['fromAndToDate'],
      fromDate: ['2025-01-01'],
    };
    expect(withoutStaleDates(withDates)).toBe(withDates);
    const noDates = { by: ['helle'] };
    expect(withoutStaleDates(noDates)).toBe(noDates);
  });
});

describe('getActivityLogValueFilters', () => {
  it('folds to and from into the party filter for the counterpart of the direction', () => {
    expect(getActivityLogValueFilters(['from', 'to', 'by'], 'from')).toEqual([
      { name: ACTIVITY_LOG_PARTY_FILTER, field: 'to', param: 'to' },
      { name: 'by', field: 'by', param: 'by' },
    ]);
    expect(getActivityLogValueFilters(['from', 'to', 'by'], 'to')).toEqual([
      { name: ACTIVITY_LOG_PARTY_FILTER, field: 'from', param: 'from' },
      { name: 'by', field: 'by', param: 'by' },
    ]);
  });

  it('maps every other field to its own filter and query parameter, skipping unknown ones', () => {
    expect(
      getActivityLogValueFilters(['resource', 'source', 'activitytype', 'somethingnew'], 'from'),
    ).toEqual([
      { name: 'resource', field: 'resource', param: 'resource' },
      { name: 'source', field: 'source', param: 'source' },
      { name: 'activitytype', field: 'activitytype', param: 'typeId' },
    ]);
  });
});

describe('useActivityLogFilterOptions', () => {
  const lise = { id: 'lise', name: 'Lise Larsen AS' };
  const fysio = { id: 'fysio', name: 'Fysio Partner AS' };

  it('offers what the lookup returned for each picker', () => {
    const { result } = renderHook(() =>
      useActivityLogFilterOptions({ party: [lise, fysio], by: undefined }, { party: [] }),
    );

    expect(result.current).toEqual({ party: [lise, fysio], by: [] });
  });

  it('keeps a selected value offered after a narrowed lookup stops returning it', () => {
    const { result, rerender } = renderHook(
      ({ fetched, selected }: { fetched: (typeof lise)[]; selected: string[] }) =>
        useActivityLogFilterOptions({ party: fetched }, { party: selected }),
      { initialProps: { fetched: [lise, fysio], selected: ['lise'] } },
    );

    rerender({ fetched: [fysio], selected: ['lise'] });

    expect(result.current).toEqual({ party: [fysio, lise] });
  });

  it('cannot offer a selected value it has never seen, nor one another picker saw', () => {
    const { result } = renderHook(() =>
      useActivityLogFilterOptions({ party: [fysio], by: [lise] }, { party: ['unknown', 'lise'] }),
    );

    expect(result.current).toEqual({ party: [fysio], by: [lise] });
  });
});

describe('useActivityLogQueryState', () => {
  it('starts with access given by the reportee and no filter', () => {
    const { result } = renderHook(() => useActivityLogQueryState());

    expect(result.current.direction).toBe('from');
    expect(result.current.counterpartField).toBe('to');
    expect(result.current.filterState).toEqual({});
    expect(result.current.after).toBeUndefined();
    expect(result.current.before).toBeUndefined();
  });

  it('exposes who performed the change and the period as query values', () => {
    const { result } = renderHook(() => useActivityLogQueryState());

    act(() =>
      result.current.changeFilterState({
        [ACTIVITY_LOG_BY_FILTER]: ['helle'],
        [ACTIVITY_LOG_DATE_FILTER]: ['fromAndToDate'],
        fromDate: ['2025-01-01'],
        toDate: ['2025-01-31'],
      }),
    );

    expect(getSelectedIds(result.current.filterState, ACTIVITY_LOG_BY_FILTER)).toEqual(['helle']);
    expect(result.current.after).toBe(localInstant('2025-01-01T00:00:00'));
    expect(result.current.before).toBe(localInstant('2025-01-31T23:59:59.999'));
  });

  it('exposes the selected parties and the side of the entries they apply to', () => {
    const { result } = renderHook(() => useActivityLogQueryState());

    act(() => result.current.changeFilterState({ [ACTIVITY_LOG_PARTY_FILTER]: ['lise', 'fysio'] }));
    expect(getSelectedIds(result.current.filterState, ACTIVITY_LOG_PARTY_FILTER)).toEqual([
      'lise',
      'fysio',
    ]);
    expect(result.current.counterpartField).toBe('to');

    act(() => result.current.changeDirection('to'));
    expect(result.current.counterpartField).toBe('from');
  });

  it('drops the dates left behind when the date filter is removed', () => {
    const { result } = renderHook(() => useActivityLogQueryState());

    act(() =>
      result.current.changeFilterState({
        [ACTIVITY_LOG_DATE_FILTER]: ['fromAndToDate'],
        fromDate: ['2025-01-01'],
        toDate: ['2025-01-31'],
      }),
    );
    act(() =>
      result.current.changeFilterState({ fromDate: ['2025-01-01'], toDate: ['2025-01-31'] }),
    );

    expect(result.current.filterState).toEqual({});
    expect(result.current.after).toBeUndefined();
    expect(result.current.before).toBeUndefined();
  });

  it('clears only the party filter when the direction changes', () => {
    const { result } = renderHook(() => useActivityLogQueryState());

    act(() =>
      result.current.changeFilterState({
        [ACTIVITY_LOG_PARTY_FILTER]: ['lise'],
        [ACTIVITY_LOG_BY_FILTER]: ['helle'],
        [ACTIVITY_LOG_DATE_FILTER]: ['fromAndToDate'],
        fromDate: ['2025-01-01'],
      }),
    );
    act(() => result.current.changeDirection('to'));

    expect(result.current.direction).toBe('to');
    expect(result.current.filterState).toEqual({
      [ACTIVITY_LOG_BY_FILTER]: ['helle'],
      [ACTIVITY_LOG_DATE_FILTER]: ['fromAndToDate'],
      fromDate: ['2025-01-01'],
    });
    expect(getSelectedIds(result.current.filterState, ACTIVITY_LOG_PARTY_FILTER)).toEqual([]);
    expect(getSelectedIds(result.current.filterState, ACTIVITY_LOG_BY_FILTER)).toEqual(['helle']);
    expect(result.current.after).toBe(localInstant('2025-01-01T00:00:00'));
  });
});
