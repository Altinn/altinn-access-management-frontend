import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { getCookie } from '@/resources/Cookie/CookieMethods';

import {
  ACTIVITY_LOG_PAGE_SIZE,
  ACTIVITY_LOG_PARTY_FILTER,
  useActivityLogQueryState,
} from './useActivityLogQueryState';

describe('useActivityLogQueryState', () => {
  it('starts with access given by the reportee, no filter and the first page', () => {
    const { result } = renderHook(() => useActivityLogQueryState());

    expect(result.current.queryParams).toEqual({
      party: getCookie('AltinnPartyUuid'),
      direction: 'from',
      to: [],
      pageNo: 0,
      pageSize: ACTIVITY_LOG_PAGE_SIZE,
    });
  });

  it('maps the party filter to the counterpart side of the query', () => {
    const { result } = renderHook(() => useActivityLogQueryState());

    act(() => result.current.changeFilterState({ [ACTIVITY_LOG_PARTY_FILTER]: ['lise', 'fysio'] }));
    expect(result.current.selectedPartyIds).toEqual(['lise', 'fysio']);
    expect(result.current.queryParams.to).toEqual(['lise', 'fysio']);
    expect(result.current.queryParams.from).toBeUndefined();

    act(() => result.current.changeDirection('to'));
    act(() => result.current.changeFilterState({ [ACTIVITY_LOG_PARTY_FILTER]: ['skatt'] }));
    expect(result.current.queryParams.from).toEqual(['skatt']);
    expect(result.current.queryParams.to).toBeUndefined();
  });

  it('starts over from the first page and clears the filter when the direction changes', () => {
    const { result } = renderHook(() => useActivityLogQueryState());

    act(() => result.current.changeFilterState({ [ACTIVITY_LOG_PARTY_FILTER]: ['lise'] }));
    act(() => result.current.loadMore());
    act(() => result.current.loadMore());
    expect(result.current.queryParams.pageNo).toBe(2);

    act(() => result.current.changeDirection('to'));

    expect(result.current.direction).toBe('to');
    expect(result.current.filterState).toEqual({});
    expect(result.current.queryParams.pageNo).toBe(0);
  });

  it('starts over from the first page when the filter changes', () => {
    const { result } = renderHook(() => useActivityLogQueryState());

    act(() => result.current.loadMore());
    act(() => result.current.changeFilterState({ [ACTIVITY_LOG_PARTY_FILTER]: [] }));

    expect(result.current.queryParams.pageNo).toBe(0);
  });
});
