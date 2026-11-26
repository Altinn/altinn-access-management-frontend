import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import * as activityLogApi from '@/rtk/features/activityLogApi';

import {
  ACTIVITY_LOG_FILTER_PAGE_SIZE,
  ACTIVITY_LOG_PAGE_SIZE,
  ActivityLogTab,
} from './ActivityLogTab';
import { sampleActivityLogEntries, sampleFilterFields } from './activityLogSampleData';

vi.mock('@/rtk/features/activityLogApi', () => ({
  useGetActivityLogInfiniteQuery: vi.fn(),
  useGetActivityLogFilterValuesQuery: vi.fn(),
  useGetActivityLogFilterFieldsQuery: vi.fn(),
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
    (activityLogApi.useGetActivityLogFilterValuesQuery as Mock).mockImplementation(
      ({ field }: { field: string }) => ({
        data: {
          data:
            field === 'by'
              ? [{ id: 'helle-hovedadmin', name: 'Helle Hovedadmin' }]
              : [{ id: 'lise-larsen-as', name: 'Lise Larsen AS' }],
          links: {},
        },
      }),
    );
    mockHookResult(activityLogApi.useGetActivityTypesQuery, { data: [] });
    mockHookResult(activityLogApi.useGetActivityLogFilterFieldsQuery, { data: sampleFilterFields });
  });

  it('queries the area for access given by the reportee, with the party filter on the receivers', () => {
    setActivityLog({ pages: [sampleActivityLogEntries.slice(0, 2)] });
    render(
      <ActivityLogTab
        area='maskinporten'
        reporteeName='Fysioterapeutene AS'
      />,
    );

    const search = {
      area: 'maskinporten',
      direction: 'from',
      to: [],
      by: [],
      after: undefined,
      before: undefined,
    };
    expect(activityLogApi.useGetActivityLogInfiniteQuery).toHaveBeenCalledWith({
      ...search,
      pageSize: ACTIVITY_LOG_PAGE_SIZE,
    });
    const lookup = {
      ...search,
      orderBy: 'When',
      pageSize: ACTIVITY_LOG_FILTER_PAGE_SIZE,
      term: undefined,
    };
    expect(activityLogApi.useGetActivityLogFilterValuesQuery).toHaveBeenCalledWith(
      { ...lookup, field: 'to' },
      { skip: false },
    );
    expect(activityLogApi.useGetActivityLogFilterValuesQuery).toHaveBeenCalledWith(
      { ...lookup, field: 'by' },
      { skip: false },
    );
  });

  it('offers only the filters whose field the area reports, besides the period', async () => {
    mockHookResult(activityLogApi.useGetActivityLogFilterFieldsQuery, { data: ['to'] });
    setActivityLog({ pages: [] });
    render(
      <ActivityLogTab
        area='maskinporten'
        reporteeName='Fysioterapeutene AS'
      />,
    );

    expect(activityLogApi.useGetActivityLogFilterValuesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ field: 'to' }),
      { skip: false },
    );
    expect(activityLogApi.useGetActivityLogFilterValuesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ field: 'by' }),
      { skip: true },
    );

    await userEvent.click(screen.getByRole('button', { name: 'activity_log_page.add_filter' }));
    expect(screen.getByText('activity_log_page.filter_party_to')).toBeInTheDocument();
    expect(screen.getByText('activity_log_page.filter_date')).toBeInTheDocument();
    expect(screen.queryByText('activity_log_page.filter_by')).not.toBeInTheDocument();
  });

  it('looks the receivers up on the server with what the user types in the picker', async () => {
    setActivityLog({ pages: [] });
    render(
      <ActivityLogTab
        area='maskinporten'
        reporteeName='Fysioterapeutene AS'
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'activity_log_page.add_filter' }));
    await userEvent.click(screen.getByText('activity_log_page.filter_party_to'));
    // The toolbar opens an added filter on the next animation frame, which jsdom does not run.
    const partyFilter = await screen.findByRole('button', {
      name: 'activity_log_page.filter_party_to',
    });
    if (partyFilter.getAttribute('aria-expanded') !== 'true') {
      await userEvent.click(partyFilter);
    }
    await userEvent.type(screen.getByRole('combobox'), 'lise');

    await waitFor(() =>
      expect(activityLogApi.useGetActivityLogFilterValuesQuery).toHaveBeenCalledWith(
        expect.objectContaining({ field: 'to', term: 'lise' }),
        { skip: false },
      ),
    );
    // Only the picker being searched gets the term; the entries keep the full search.
    expect(activityLogApi.useGetActivityLogFilterValuesQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ field: 'by', term: undefined }),
      { skip: false },
    );
    const lastEntriesArgs = (activityLogApi.useGetActivityLogInfiniteQuery as Mock).mock.lastCall;
    expect(lastEntriesArgs?.[0]).not.toHaveProperty('term');
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
    expect(activityLogApi.useGetActivityLogFilterValuesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'to', field: 'from' }),
      { skip: false },
    );
    expect(activityLogApi.useGetActivityLogFilterValuesQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ direction: 'to', from: [], field: 'by' }),
      { skip: false },
    );
  });

  it('queries the period once dates are chosen and the date picker is left', async () => {
    setActivityLog({ pages: [] });
    render(
      <ActivityLogTab
        area='maskinporten'
        reporteeName='Fysioterapeutene AS'
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'activity_log_page.add_filter' }));
    await userEvent.click(screen.getByText('activity_log_page.filter_date'));
    const dateFilter = await screen.findByRole('button', { name: 'activity_log_page.filter_date' });
    if (dateFilter.getAttribute('aria-expanded') !== 'true') {
      await userEvent.click(dateFilter);
    }
    await userEvent.click(screen.getByText('activity_log_page.filter_date_pick'));

    // Choosing the dates alone changes nothing; the picker commits them when it is left.
    fireEvent.change(document.querySelector('input[name="fromDate"]') as HTMLInputElement, {
      target: { value: '2025-01-01' },
    });
    fireEvent.change(document.querySelector('input[name="toDate"]') as HTMLInputElement, {
      target: { value: '2025-01-31' },
    });
    expect(activityLogApi.useGetActivityLogInfiniteQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ after: undefined, before: undefined }),
    );

    await userEvent.keyboard('{Escape}');

    expect(activityLogApi.useGetActivityLogInfiniteQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({
        after: new Date('2025-01-01T00:00:00').toISOString(),
        before: new Date('2025-01-31T23:59:59.999').toISOString(),
      }),
    );
    expect(activityLogApi.useGetActivityLogFilterValuesQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ after: new Date('2025-01-01T00:00:00').toISOString() }),
      { skip: false },
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
