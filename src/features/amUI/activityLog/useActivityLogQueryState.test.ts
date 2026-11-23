import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ACTIVITY_LOG_PARTY_FILTER, useActivityLogQueryState } from './useActivityLogQueryState';

describe('useActivityLogQueryState', () => {
  it('starts with access given by the reportee and no filter', () => {
    const { result } = renderHook(() => useActivityLogQueryState());

    expect(result.current.direction).toBe('from');
    expect(result.current.counterpartField).toBe('to');
    expect(result.current.filterState).toEqual({});
    expect(result.current.selectedPartyIds).toEqual([]);
  });

  it('exposes the selected parties and the side of the entries they apply to', () => {
    const { result } = renderHook(() => useActivityLogQueryState());

    act(() => result.current.changeFilterState({ [ACTIVITY_LOG_PARTY_FILTER]: ['lise', 'fysio'] }));
    expect(result.current.selectedPartyIds).toEqual(['lise', 'fysio']);
    expect(result.current.counterpartField).toBe('to');

    act(() => result.current.changeDirection('to'));
    expect(result.current.counterpartField).toBe('from');
  });

  it('clears the filter when the direction changes', () => {
    const { result } = renderHook(() => useActivityLogQueryState());

    act(() => result.current.changeFilterState({ [ACTIVITY_LOG_PARTY_FILTER]: ['lise'] }));
    act(() => result.current.changeDirection('to'));

    expect(result.current.direction).toBe('to');
    expect(result.current.filterState).toEqual({});
    expect(result.current.selectedPartyIds).toEqual([]);
  });
});
