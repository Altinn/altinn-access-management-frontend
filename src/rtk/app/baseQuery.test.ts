import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BaseQueryApi } from '@reduxjs/toolkit/query';

import { createBaseQuery } from './baseQuery';

// jsdom can't navigate, so redirects are observed as a hash change instead
vi.mock('@/resources/utils/pathUtils', () => ({ getLoginUrl: () => '#login' }));

const api = { signal: new AbortController().signal } as BaseQueryApi;
const baseQuery = createBaseQuery('http://localhost/api/');
const isRefreshCall = (url: string) => url.includes('authentication/refresh');

const mockFetch = (apiStatus: number, refreshStatus: number) =>
  vi.fn(async (input: RequestInfo | URL) => {
    const url = input instanceof Request ? input.url : input.toString();
    return new Response(JSON.stringify({}), {
      status: isRefreshCall(url) ? refreshStatus : apiStatus,
      headers: { 'content-type': 'application/json' },
    });
  });

describe('createBaseQuery', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('passes successful responses through without checking the token', async () => {
    const fetchMock = mockFetch(200, 200);
    vi.stubGlobal('fetch', fetchMock);

    const result = await baseQuery('things', api, {});

    expect(result.error).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(window.location.hash).toBe('');
  });

  it('returns the 401 error as usual when the token is still valid', async () => {
    const fetchMock = mockFetch(401, 200);
    vi.stubGlobal('fetch', fetchMock);

    const result = await baseQuery('things', api, {});

    expect(result.error?.status).toBe(401);
    expect(fetchMock.mock.calls.filter(([input]) => isRefreshCall(input.toString()))).toHaveLength(
      1,
    );
    expect(window.location.hash).toBe('');
  });

  it('redirects to login when the token can not be refreshed', async () => {
    vi.stubGlobal('fetch', mockFetch(401, 401));

    await baseQuery('things', api, {});

    expect(window.location.hash).toBe('#login');
  });

  it('only refreshes the token once for concurrent 401 responses', async () => {
    const fetchMock = mockFetch(401, 200);
    vi.stubGlobal('fetch', fetchMock);

    await Promise.all([baseQuery('a', api, {}), baseQuery('b', api, {}), baseQuery('c', api, {})]);

    expect(fetchMock.mock.calls.filter(([input]) => isRefreshCall(input.toString()))).toHaveLength(
      1,
    );
  });
});
