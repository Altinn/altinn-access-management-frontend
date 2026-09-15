import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

import type { Request } from './types';
import { filterRequests, useFilteredRequests } from './useFilteredRequests';

const alice: Request = {
  id: 'r1',
  type: 'accessrequest',
  createdDate: '2025-04-01T00:00:00Z',
  displayPartyName: 'Alice Andersen',
  displayPartyType: 'person',
  numberOfRequests: 2,
};

const lorem: Request = {
  id: 'r2',
  type: 'accessrequest',
  createdDate: '2025-04-02T00:00:00Z',
  displayPartyName: 'Lorem AS',
  displayPartyType: 'company',
  organizationIdentifier: '912345678',
  numberOfRequests: 1,
};

const fiken: Request = {
  id: 'r3',
  type: 'systemuser',
  createdDate: '2025-04-03T00:00:00Z',
  displayPartyName: 'Fiken',
  displayPartyType: 'system',
  description: 'request_page.request_systemuser',
};

const requests = [alice, lorem, fiken];

describe('filterRequests', () => {
  it('returns all requests when the search string is empty or whitespace', () => {
    expect(filterRequests(requests, '')).toEqual(requests);
    expect(filterRequests(requests, '   ')).toEqual(requests);
  });

  it('returns an empty list when requests are undefined', () => {
    expect(filterRequests(undefined, 'alice')).toEqual([]);
    expect(filterRequests(undefined, '')).toEqual([]);
  });

  it('matches on party name case-insensitively', () => {
    expect(filterRequests(requests, 'ALICE')).toEqual([alice]);
    expect(filterRequests(requests, 'lorem')).toEqual([lorem]);
  });

  it('matches on partial name', () => {
    expect(filterRequests(requests, 'ander')).toEqual([alice]);
  });

  it('matches on organisation number with and without whitespace', () => {
    expect(filterRequests(requests, '912345678')).toEqual([lorem]);
    expect(filterRequests(requests, '912 345 678')).toEqual([lorem]);
    expect(filterRequests(requests, '345')).toEqual([lorem]);
  });

  it('does not match organisation number on requests without one', () => {
    expect(filterRequests(requests, '000')).toEqual([]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterRequests(requests, 'nomatch')).toEqual([]);
  });
});

describe('useFilteredRequests', () => {
  it('filters and memoises on inputs', () => {
    const { result, rerender } = renderHook(
      ({ search }: { search: string }) => useFilteredRequests(requests, search),
      { initialProps: { search: '' } },
    );
    expect(result.current).toEqual(requests);

    const first = result.current;
    rerender({ search: '' });
    expect(result.current).toBe(first);

    rerender({ search: 'fiken' });
    expect(result.current).toEqual([fiken]);
  });
});
