import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as userInfoApi from '@/rtk/features/userInfoApi';

import { ActivityLogPage } from './ActivityLogPage';

vi.mock('@/rtk/features/userInfoApi', async () => {
  const actual = await vi.importActual('@/rtk/features/userInfoApi');
  return {
    ...actual,
    useGetReporteeQuery: vi.fn(),
    useGetIsAdminQuery: vi.fn(),
    useGetIsMaskinportenAdminQuery: vi.fn(),
  };
});

// The page layout pulls in the global header, sidebar and footer; the access rules live in the page itself.
vi.mock('../common/PageLayoutWrapper', () => ({
  PageLayoutWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// The tab content has its own tests; here it only matters which tab gets it.
vi.mock('./ActivityLogTab', () => ({
  ActivityLogTab: ({ area }: { area: string }) => <div data-testid={`activity-log-${area}`} />,
}));

const reportee = {
  partyUuid: 'reportee-uuid',
  name: 'Fysioterapeutene AS',
  type: 'Organization',
  organizationNumber: '123456789',
};

const setPermissions = ({
  isAdmin,
  isMaskinportenAdmin,
  isLoading = false,
}: {
  isAdmin?: boolean;
  isMaskinportenAdmin?: boolean;
  isLoading?: boolean;
}) => {
  vi.mocked(userInfoApi.useGetReporteeQuery).mockReturnValue({
    data: reportee,
    isLoading: false,
  } as unknown as ReturnType<typeof userInfoApi.useGetReporteeQuery>);
  vi.mocked(userInfoApi.useGetIsAdminQuery).mockReturnValue({
    data: isAdmin,
    isLoading,
  } as unknown as ReturnType<typeof userInfoApi.useGetIsAdminQuery>);
  vi.mocked(userInfoApi.useGetIsMaskinportenAdminQuery).mockReturnValue({
    data: isMaskinportenAdmin,
    isLoading,
  } as unknown as ReturnType<typeof userInfoApi.useGetIsMaskinportenAdminQuery>);
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <ActivityLogPage />
    </MemoryRouter>,
  );

describe('ActivityLogPage', () => {
  beforeEach(() => {
    window.featureFlags = { enableActivityLog: true } as Window['featureFlags'];
  });

  it('shows a no-access message when the user is neither access manager nor Maskinporten admin', () => {
    setPermissions({ isAdmin: false, isMaskinportenAdmin: false });
    renderPage();

    expect(screen.getByRole('alert')).toHaveTextContent('activity_log_page.no_access');
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('shows a no-access message when the feature flag is off', () => {
    window.featureFlags = { enableActivityLog: false } as Window['featureFlags'];
    setPermissions({ isAdmin: true, isMaskinportenAdmin: true });
    renderPage();

    expect(screen.getByRole('alert')).toHaveTextContent('activity_log_page.no_access');
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('does not show the no-access message while permissions are loading', () => {
    setPermissions({ isLoading: true });
    renderPage();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('shows the connections and request tabs, but not the Maskinporten tab, for an access manager', () => {
    setPermissions({ isAdmin: true, isMaskinportenAdmin: false });
    renderPage();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'activity_log_page.heading',
    );
    expect(
      screen.getByRole('tab', { name: 'activity_log_page.tab_connections' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'activity_log_page.tab_request' })).toBeInTheDocument();
    expect(
      screen.queryByRole('tab', { name: 'activity_log_page.tab_maskinporten' }),
    ).not.toBeInTheDocument();
  });

  it('shows only the Maskinporten tab for a Maskinporten admin who is not an access manager', () => {
    setPermissions({ isAdmin: false, isMaskinportenAdmin: true });
    renderPage();

    expect(screen.getAllByRole('tab')).toHaveLength(1);
    expect(
      screen.getByRole('tab', { name: 'activity_log_page.tab_maskinporten' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('activity-log-maskinporten')).toBeInTheDocument();
  });

  it('shows a placeholder instead of the log in the connections and request tabs', () => {
    setPermissions({ isAdmin: true, isMaskinportenAdmin: false });
    renderPage();

    expect(screen.queryByTestId('activity-log-connections')).not.toBeInTheDocument();
    expect(screen.queryByTestId('activity-log-request')).not.toBeInTheDocument();
    expect(screen.getAllByText('activity_log_page.empty')).toHaveLength(2);
  });

  it('shows every area for a user who is both access manager and Maskinporten admin', () => {
    setPermissions({ isAdmin: true, isMaskinportenAdmin: true });
    renderPage();

    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });
});
