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
  useGetActivityLogFilterOptionsQuery: vi.fn(),
  useGetActivityLogFilterFieldsQuery: vi.fn(),
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
const reporteeUuid = 'cd35779b-b174-4ecc-bbef-ece13611be7f';

vi.mock('@/resources/Cookie/CookieMethods', () => ({
  getCookie: (name: string) => (name === 'AltinnPartyUuid' ? reporteeUuid : ''),
}));

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

/** What the pickers offer before the user searches, by field. */
const defaultOptions = {
  to: [{ id: 'lise-larsen-as', name: 'Lise Larsen AS' }],
  from: [{ id: 'skatteetaten', name: 'Skatteetaten' }],
  by: [{ id: 'helle-hovedadmin', name: 'Helle Hovedadmin' }],
  resource: [{ id: 'altinn:lonn:read', name: 'altinn:lonn:read' }],
  source: [],
  activitytype: [{ id: 'type-scope-created', name: 'Scope delegert' }],
};

const renderTab = () =>
  render(
    <ActivityLogTab
      area='maskinporten'
      reporteeName='Fysioterapeutene AS'
    />,
  );

const addFilter = async (label: string) => {
  await userEvent.click(screen.getByRole('button', { name: /activity_log_page.add_/ }));
  await userEvent.click(screen.getByText(label));
  // The toolbar opens an added filter on the next animation frame, which jsdom does not run.
  const filterButton = await screen.findByRole('button', { name: label });
  if (filterButton.getAttribute('aria-expanded') !== 'true') {
    await userEvent.click(filterButton);
  }
};

describe('ActivityLogTab', () => {
  beforeEach(() => {
    fetchNextPage.mockReset();
    mockHookResult(activityLogApi.useGetActivityLogFilterOptionsQuery, {
      data: defaultOptions,
      isLoading: false,
    });
    mockHookResult(activityLogApi.useGetActivityLogFilterValuesQuery, {
      currentData: { data: [{ id: 'lise-larsen-as', name: 'Lise Larsen AS' }], links: {} },
    });
    mockHookResult(activityLogApi.useGetActivityLogFilterFieldsQuery, { data: sampleFilterFields });
  });

  it('queries the area for access given by the reportee, with a parameter per reported field', () => {
    setActivityLog({ pages: [sampleActivityLogEntries.slice(0, 2)] });
    renderTab();

    const search = {
      area: 'maskinporten',
      party: reporteeUuid,
      direction: 'from',
      to: [],
      by: [],
      resource: [],
      source: [],
      typeId: [],
      after: undefined,
      before: undefined,
    };
    expect(activityLogApi.useGetActivityLogInfiniteQuery).toHaveBeenCalledWith({
      ...search,
      pageSize: ACTIVITY_LOG_PAGE_SIZE,
    });
    expect(activityLogApi.useGetActivityLogFilterOptionsQuery).toHaveBeenCalledWith(
      {
        ...search,
        orderBy: 'When',
        pageSize: ACTIVITY_LOG_FILTER_PAGE_SIZE,
        fields: ['to', 'by', 'resource', 'source', 'activitytype'],
      },
      { skip: false },
    );
    expect(activityLogApi.useGetActivityLogFilterValuesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ term: '' }),
      { skip: true },
    );
  });

  it('offers a picker per field the area reports, besides the period', async () => {
    setActivityLog({ pages: [] });
    renderTab();

    await userEvent.click(screen.getByRole('button', { name: 'activity_log_page.add_filter' }));

    expect(screen.getByText('activity_log_page.filter_party_to')).toBeInTheDocument();
    expect(screen.getByText('activity_log_page.filter_field.by')).toBeInTheDocument();
    expect(screen.getByText('activity_log_page.filter_field.resource')).toBeInTheDocument();
    expect(screen.getByText('activity_log_page.filter_field.source')).toBeInTheDocument();
    expect(screen.getByText('activity_log_page.filter_field.activitytype')).toBeInTheDocument();
    expect(screen.getByText('activity_log_page.filter_date')).toBeInTheDocument();
    expect(screen.queryByText('activity_log_page.filter_party_from')).not.toBeInTheDocument();
  });

  it('offers only the filters whose field the area reports', async () => {
    mockHookResult(activityLogApi.useGetActivityLogFilterFieldsQuery, { data: ['to'] });
    setActivityLog({ pages: [] });
    renderTab();

    expect(activityLogApi.useGetActivityLogFilterOptionsQuery).toHaveBeenCalledWith(
      expect.objectContaining({ fields: ['to'] }),
      { skip: false },
    );
    const entriesArgs = (activityLogApi.useGetActivityLogInfiniteQuery as Mock).mock.lastCall;
    expect(entriesArgs?.[0]).toHaveProperty('to', []);
    expect(entriesArgs?.[0]).not.toHaveProperty('by');

    await userEvent.click(screen.getByRole('button', { name: 'activity_log_page.add_filter' }));
    expect(screen.getByText('activity_log_page.filter_party_to')).toBeInTheDocument();
    expect(screen.getByText('activity_log_page.filter_date')).toBeInTheDocument();
    expect(screen.queryByText('activity_log_page.filter_field.by')).not.toBeInTheDocument();
  });

  it('narrows the query by the parameter of the field a value is chosen in', async () => {
    setActivityLog({ pages: [] });
    renderTab();

    await addFilter('activity_log_page.filter_field.activitytype');
    await userEvent.click(screen.getByText('Scope delegert'));

    expect(activityLogApi.useGetActivityLogInfiniteQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ typeId: ['type-scope-created'], resource: [] }),
    );
    expect(activityLogApi.useGetActivityLogFilterOptionsQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ typeId: ['type-scope-created'] }),
      { skip: false },
    );
  });

  it('looks the values up on the server with what the user types in a picker', async () => {
    setActivityLog({ pages: [] });
    renderTab();

    await addFilter('activity_log_page.filter_party_to');
    await userEvent.type(screen.getByRole('combobox'), 'lise');

    await waitFor(() =>
      expect(activityLogApi.useGetActivityLogFilterValuesQuery).toHaveBeenLastCalledWith(
        expect.objectContaining({ field: 'to', term: 'lise' }),
        { skip: false },
      ),
    );
    // The entries and the other pickers keep the full search, without the term.
    const lastEntriesArgs = (activityLogApi.useGetActivityLogInfiniteQuery as Mock).mock.lastCall;
    expect(lastEntriesArgs?.[0]).not.toHaveProperty('term');
    const lastOptionsArgs = (activityLogApi.useGetActivityLogFilterOptionsQuery as Mock).mock
      .lastCall;
    expect(lastOptionsArgs?.[0]).not.toHaveProperty('term');
  });

  it('renders every entry fetched so far and loads the next page on request', async () => {
    setActivityLog({
      pages: [sampleActivityLogEntries.slice(0, 2), sampleActivityLogEntries.slice(2, 3)],
      hasNextPage: true,
    });
    renderTab();

    expect(screen.getAllByText(/events\.assignment\.created\.from/)).toHaveLength(2);
    expect(screen.getAllByText(/events\.assignment\.deleted\.from/)).toHaveLength(1);

    await userEvent.click(screen.getByRole('button', { name: 'activity_log_page.load_more' }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('queries the givers when the direction is switched to access received', async () => {
    setActivityLog({ pages: [] });
    renderTab();

    await userEvent.click(screen.getByRole('radio', { name: 'activity_log_page.direction_to' }));

    expect(activityLogApi.useGetActivityLogInfiniteQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ direction: 'to', from: [] }),
    );
    expect(activityLogApi.useGetActivityLogFilterOptionsQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({
        direction: 'to',
        from: [],
        fields: ['from', 'by', 'resource', 'source', 'activitytype'],
      }),
      { skip: false },
    );
  });

  it('queries the period once dates are chosen and the date picker is left', async () => {
    setActivityLog({ pages: [] });
    renderTab();

    await addFilter('activity_log_page.filter_date');
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

    const bounds = {
      after: new Date('2025-01-01T00:00:00').toISOString(),
      before: new Date('2025-01-31T23:59:59.999').toISOString(),
    };
    expect(activityLogApi.useGetActivityLogInfiniteQuery).toHaveBeenLastCalledWith(
      expect.objectContaining(bounds),
    );
    expect(activityLogApi.useGetActivityLogFilterOptionsQuery).toHaveBeenLastCalledWith(
      expect.objectContaining(bounds),
      { skip: false },
    );
  });

  it('shows the skeleton rather than the previous entries while a new query fetching', () => {
    setActivityLog({
      pages: [sampleActivityLogEntries.slice(0, 2)],
      isFetching: true,
      hasNextPage: true,
    });
    renderTab();

    expect(screen.queryByText(/events\.assignment/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'activity_log_page.load_more' }),
    ).not.toBeInTheDocument();
  });

  it('shows an alert when the log cannot be loaded', () => {
    setActivityLog({ isError: true });
    renderTab();

    expect(screen.getByRole('alert')).toHaveTextContent('activity_log_page.load_error');
  });
});
