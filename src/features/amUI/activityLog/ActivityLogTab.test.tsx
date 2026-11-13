import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import * as activityLogApi from '@/rtk/features/activityLogApi';

import { ACTIVITY_LOG_PAGE_SIZE, ActivityLogTab } from './ActivityLogTab';
import { sampleActivityLogEntries } from './activityLogSampleData';

vi.mock('@/rtk/features/activityLogApi', () => ({
  useGetActivityLogInfiniteQuery: vi.fn(),
  useGetActivityLogFilterValuesQuery: vi.fn(),
  useGetActivityTypesQuery: vi.fn(),
}));

// No i18n instance is initialised in tests; `t` returns the key, and every sentence template exists.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { exists: () => true, language: 'no_nb', resolvedLanguage: 'no_nb' },
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <>{i18nKey}</>,
}));

const fetchNextPage = vi.fn();

/** The query hooks are mocked with only the fields the tab reads. */
const mockHookResult = (hook: unknown, result: object) => (hook as Mock).mockReturnValue(result);

const setActivityLog = ({
  pages = [],
  isFetching = false,
  isError = false,
  hasNextPage = false,
}: {
  pages?: (typeof sampleActivityLogEntries)[];
  isFetching?: boolean;
  isError?: boolean;
  hasNextPage?: boolean;
}) => {
  const data = { pages: pages.map((entries) => ({ data: entries, links: {} })), pageParams: [] };
  mockHookResult(activityLogApi.useGetActivityLogInfiniteQuery, {
    data,
    currentData: isFetching ? undefined : data,
    isFetching,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage: false,
  });
};

describe('ActivityLogTab', () => {
  beforeEach(() => {
    fetchNextPage.mockReset();
    mockHookResult(activityLogApi.useGetActivityLogFilterValuesQuery, {
      data: { data: [{ id: 'lise-larsen-as', name: 'Lise Larsen AS' }], links: {} },
    });
    mockHookResult(activityLogApi.useGetActivityTypesQuery, { data: [] });
  });

  it('queries the area for access given by the reportee, with the party filter on the receivers', () => {
    setActivityLog({ pages: [sampleActivityLogEntries.slice(0, 2)] });
    render(
      <ActivityLogTab
        area='maskinporten'
        reporteeName='Fysioterapeutene AS'
      />,
    );

    expect(activityLogApi.useGetActivityLogInfiniteQuery).toHaveBeenCalledWith({
      area: 'maskinporten',
      direction: 'from',
      to: [],
      pageSize: ACTIVITY_LOG_PAGE_SIZE,
    });
    expect(activityLogApi.useGetActivityLogFilterValuesQuery).toHaveBeenCalledWith({
      area: 'maskinporten',
      direction: 'from',
      field: 'to',
    });
  });

  it('renders every entry fetched so far and loads the next page on request', async () => {
    setActivityLog({
      pages: [sampleActivityLogEntries.slice(0, 2), sampleActivityLogEntries.slice(2, 3)],
      hasNextPage: true,
    });
    render(
      <ActivityLogTab
        area='maskinporten'
        reporteeName='Fysioterapeutene AS'
      />,
    );

    expect(screen.getAllByText(/events\.assignment\.created\.from/)).toHaveLength(2);
    expect(screen.getAllByText(/events\.assignment\.deleted\.from/)).toHaveLength(1);

    await userEvent.click(screen.getByRole('button', { name: 'activity_log_page.load_more' }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('queries the givers when the direction is switched to access received', async () => {
    setActivityLog({ pages: [] });
    render(
      <ActivityLogTab
        area='maskinporten'
        reporteeName='Fysioterapeutene AS'
      />,
    );

    await userEvent.click(screen.getByRole('radio', { name: 'activity_log_page.direction_to' }));

    expect(activityLogApi.useGetActivityLogInfiniteQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ direction: 'to', from: [] }),
    );
    expect(activityLogApi.useGetActivityLogFilterValuesQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ direction: 'to', field: 'from' }),
    );
  });

  it('shows the skeleton rather than the previous entries while a new query fetching', () => {
    setActivityLog({
      pages: [sampleActivityLogEntries.slice(0, 2)],
      isFetching: true,
      hasNextPage: true,
    });
    render(
      <ActivityLogTab
        area='maskinporten'
        reporteeName='Fysioterapeutene AS'
      />,
    );

    expect(screen.queryByText(/events\.assignment/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'activity_log_page.load_more' }),
    ).not.toBeInTheDocument();
  });

  it('shows an alert when the log cannot be loaded', () => {
    setActivityLog({ isError: true });
    render(
      <ActivityLogTab
        area='maskinporten'
        reporteeName='Fysioterapeutene AS'
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('activity_log_page.load_error');
  });
});
