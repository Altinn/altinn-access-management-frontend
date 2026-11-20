import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  ACTIVITY_LOG_BY_FILTER,
  ACTIVITY_LOG_DATE_FILTER,
  ACTIVITY_LOG_PARTY_FILTER,
  getActivityLogDateBounds,
  useActivityLogQueryState,
} from './useActivityLogQueryState';

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

describe('useActivityLogQueryState', () => {
  it('starts with access given by the reportee and no filter', () => {
    const { result } = renderHook(() => useActivityLogQueryState());

    expect(result.current.direction).toBe('from');
    expect(result.current.counterpartField).toBe('to');
    expect(result.current.filterState).toEqual({});
    expect(result.current.selectedPartyIds).toEqual([]);
    expect(result.current.selectedByIds).toEqual([]);
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

    expect(result.current.selectedByIds).toEqual(['helle']);
    expect(result.current.after).toBe(localInstant('2025-01-01T00:00:00'));
    expect(result.current.before).toBe(localInstant('2025-01-31T23:59:59.999'));
  });

  it('exposes the selected parties and the side of the entries they apply to', () => {
    const { result } = renderHook(() => useActivityLogQueryState());

    act(() => result.current.changeFilterState({ [ACTIVITY_LOG_PARTY_FILTER]: ['lise', 'fysio'] }));
    expect(result.current.selectedPartyIds).toEqual(['lise', 'fysio']);
    expect(result.current.counterpartField).toBe('to');

    act(() => result.current.changeDirection('to'));
    expect(result.current.counterpartField).toBe('from');
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
    expect(result.current.selectedPartyIds).toEqual([]);
    expect(result.current.selectedByIds).toEqual(['helle']);
    expect(result.current.after).toBe(localInstant('2025-01-01T00:00:00'));
  });
});
