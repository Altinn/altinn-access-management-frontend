import React from 'react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { screen, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import { PartyRepresentationProvider, usePartyRepresentation } from './PartyRepresentationContext';
import * as lookupApi from '@/rtk/features/lookupApi';
import * as userInfoApi from '@/rtk/features/userInfoApi';
import * as accessPackageApi from '@/rtk/features/accessPackageApi';
import * as connectionApi from '@/rtk/features/connectionApi';
import { useConnectedParty } from './useConnectedParty';
import type { Party } from '@/rtk/features/lookupApi';
import { useGetRightHoldersQuery, type Connection } from '@/rtk/features/connectionApi';
import useReporteeParty from './useReporteeParty';

// Mock the API modules
vi.mock('@/rtk/features/lookupApi', async () => {
  const actual = await vi.importActual('@/rtk/features/lookupApi');
  return {
    ...actual,
    useGetPartyFromLoggedInUserQuery: vi.fn(),
  };
});

vi.mock('@/rtk/features/userInfoApi', async () => {
  const actual = await vi.importActual('@/rtk/features/userInfoApi');
  return {
    ...actual,
    useGetIsHovedadminQuery: vi.fn(),
  };
});

vi.mock('./useReporteeParty', () => {
  const mockUseReporteeParty = vi.fn();
  return {
    useReporteeParty: mockUseReporteeParty,
    default: mockUseReporteeParty,
  };
});

vi.mock('./useConnectedParty', () => {
  const mockUseConnectedParty = vi.fn();
  return {
    useConnectedParty: mockUseConnectedParty,
    default: mockUseConnectedParty,
  };
});

vi.mock('@/rtk/features/connectionApi', async () => {
  const actual = await vi.importActual('@/rtk/features/connectionApi');
  return {
    ...actual,
    useGetRightHoldersQuery: vi.fn(),
  };
});

vi.mock('@/resources/Cookie/CookieMethods', () => ({
  getCookie: vi.fn((name: string) => {
    if (name === 'AltinnPartyUuid') return 'acting-party-uuid';
    if (name === 'AltinnPartyId') return '12345';
    return null;
  }),
}));

vi.mock('@/resources/utils/featureFlagUtils', () => ({
  availableForUserTypeCheck: vi.fn(() => true),
}));

// Test component that uses the context
const TestConsumer = () => {
  const context = usePartyRepresentation();
  return (
    <div>
      <div data-testid='from-party'>{context.fromParty?.name || 'none'}</div>
      <div data-testid='to-party'>{context.toParty?.name || 'none'}</div>
      <div data-testid='acting-party'>{context.actingParty?.name || 'none'}</div>
      <div data-testid='self-party'>{context.selfParty?.name || 'none'}</div>
      <div data-testid='is-loading'>{context.isLoading ? 'true' : 'false'}</div>
      <div data-testid='is-error'>{context.isError ? 'true' : 'false'}</div>
    </div>
  );
};

// Mock data
const mockCurrentUser: Party = {
  partyUuid: 'current-user-uuid',
  partyId: 123,
  name: 'Current User',
  partyTypeName: 1, // Person
  isDeleted: false,
};

const mockReporteeParty: Party = {
  partyUuid: 'reportee-party-uuid',
  partyId: 456,
  name: 'Reportee Organization',
  partyTypeName: 2, // Organization
  orgNumber: '987654321',
  isDeleted: false,
};

const mockConnectedParty: Party = {
  partyUuid: 'connected-party-uuid',
  partyId: 789,
  name: 'Connected Party',
  partyTypeName: 2, // Organization
  orgNumber: '123456789',
  isDeleted: false,
};

const mockConnection: Connection = {
  party: {
    id: 'connected-party-uuid',
    name: 'Connected Party',
    type: 'Organization',
    children: null,
    keyValues: { OrganizationIdentifier: '123456789' },
    roles: [],
  },
  roles: [],
  connections: [],
};

const createMockStore = () => {
  return configureStore({
    reducer: {
      [lookupApi.lookupApi.reducerPath]: lookupApi.lookupApi.reducer,
      [userInfoApi.userInfoApi.reducerPath]: userInfoApi.userInfoApi.reducer,
      [accessPackageApi.accessPackageApi.reducerPath]: accessPackageApi.accessPackageApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        lookupApi.lookupApi.middleware,
        userInfoApi.userInfoApi.middleware,
        accessPackageApi.accessPackageApi.middleware,
      ),
  });
};

const renderWithProvider = (
  ui: React.ReactElement,
  {
    fromPartyUuid,
    toPartyUuid,
    actingPartyUuid,
  }: { fromPartyUuid?: string; toPartyUuid?: string; actingPartyUuid: string },
) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <PartyRepresentationProvider
        fromPartyUuid={fromPartyUuid}
        toPartyUuid={toPartyUuid}
        actingPartyUuid={actingPartyUuid}
      >
        {ui}
      </PartyRepresentationProvider>
    </Provider>,
  );
};

describe('PartyRepresentationProvider - Acting Party Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set default mocks for useReporteeParty and useConnectedParty
    vi.mocked(useReporteeParty).mockReturnValue({
      party: undefined,
      isLoading: false,
      error: undefined,
    });

    vi.mocked(useConnectedParty).mockReturnValue({
      party: undefined,
      isLoading: false,
      error: undefined,
      isError: false,
    });

    // Set default mock for useGetIsHovedadminQuery
    vi.mocked(userInfoApi.useGetIsHovedadminQuery).mockReturnValue({
      data: false,
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);
  });

  test('should throw error when neither fromPartyUuid nor toPartyUuid is provided', () => {
    const store = createMockStore();
    expect(() =>
      render(
        <Provider store={store}>
          <PartyRepresentationProvider
            actingPartyUuid='some-uuid'
            fromPartyUuid={undefined}
            toPartyUuid={undefined}
          >
            <div>Test</div>
          </PartyRepresentationProvider>
        </Provider>,
      ),
    ).toThrow('PartyRepresentationProvider must be used with at least one party UUID');
  });

  test('should throw error when actingPartyUuid is not provided', () => {
    const store = createMockStore();
    expect(() =>
      render(
        <Provider store={store}>
          <PartyRepresentationProvider
            actingPartyUuid=''
            fromPartyUuid='from-uuid'
            toPartyUuid={undefined}
          >
            <div>Test</div>
          </PartyRepresentationProvider>
        </Provider>,
      ),
    ).toThrow('PartyRepresentationProvider must be used with an acting party UUID');
  });

  test('should throw error when actingPartyUuid does not match fromPartyUuid or toPartyUuid', () => {
    const store = createMockStore();
    expect(() =>
      render(
        <Provider store={store}>
          <PartyRepresentationProvider
            actingPartyUuid='different-uuid'
            fromPartyUuid='from-uuid'
            toPartyUuid='to-uuid'
          >
            <div>Test</div>
          </PartyRepresentationProvider>
        </Provider>,
      ),
    ).toThrow('actingPartyUuid must equal one of the provided party UUIDs');
  });

  test('Case 1: User on their own page and NOT hovedadmin - actingParty should be currentUser', async () => {
    // Mock current user
    vi.mocked(lookupApi.useGetPartyFromLoggedInUserQuery).mockReturnValue({
      data: mockCurrentUser,
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    // Mock NOT hovedadmin
    vi.mocked(userInfoApi.useGetIsHovedadminQuery).mockReturnValue({
      data: false,
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    // Mock useReporteeParty - not needed in this case
    vi.mocked(useReporteeParty).mockReturnValue({
      party: undefined,
      isLoading: false,
      error: undefined,
    });

    // Mock connections
    vi.mocked(useGetRightHoldersQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    renderWithProvider(<TestConsumer />, {
      toPartyUuid: mockCurrentUser.partyUuid,
      actingPartyUuid: mockCurrentUser.partyUuid,
    });

    await waitFor(() => {
      expect(screen.getByTestId('acting-party')).toHaveTextContent('Current User');
      expect(screen.getByTestId('self-party')).toHaveTextContent('Current User');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });
  });

  test('Case 2: User on their own page but IS hovedadmin - actingParty should be currentUser', async () => {
    // Mock current user
    vi.mocked(lookupApi.useGetPartyFromLoggedInUserQuery).mockReturnValue({
      data: mockCurrentUser,
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    // Mock IS hovedadmin
    vi.mocked(userInfoApi.useGetIsHovedadminQuery).mockReturnValue({
      data: true,
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    // Mock useReporteeParty - not needed in this case
    vi.mocked(useReporteeParty).mockReturnValue({
      party: undefined,
      isLoading: false,
      error: undefined,
    });

    // Mock connections
    vi.mocked(useGetRightHoldersQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    renderWithProvider(<TestConsumer />, {
      toPartyUuid: mockCurrentUser.partyUuid,
      actingPartyUuid: mockCurrentUser.partyUuid,
    });

    await waitFor(() => {
      expect(screen.getByTestId('acting-party')).toHaveTextContent('Current User');
      expect(screen.getByTestId('self-party')).toHaveTextContent('Current User');
    });
  });

  test('Case 3: Acting party UUID matches current user - actingParty should be currentUser', async () => {
    // Mock current user
    vi.mocked(lookupApi.useGetPartyFromLoggedInUserQuery).mockReturnValue({
      data: mockCurrentUser,
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    // Mock useReporteeParty - not needed in this case
    vi.mocked(useReporteeParty).mockReturnValue({
      party: undefined,
      isLoading: false,
      error: undefined,
    });

    // Mock useConnectedParty for the "to" party
    vi.mocked(useConnectedParty).mockReturnValue({
      party: mockConnectedParty,
      isLoading: false,
      error: undefined,
      isError: false,
    });

    // Mock connections
    vi.mocked(useGetRightHoldersQuery).mockReturnValue({
      data: [mockConnection],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    renderWithProvider(<TestConsumer />, {
      fromPartyUuid: mockCurrentUser.partyUuid,
      toPartyUuid: 'other-party-uuid',
      actingPartyUuid: mockCurrentUser.partyUuid,
    });

    await waitFor(() => {
      expect(screen.getByTestId('acting-party')).toHaveTextContent('Current User');
      expect(screen.getByTestId('from-party')).toHaveTextContent('Current User');
    });
  });

  test('Case 4: Acting on behalf of another party (reportee) - actingParty should be reportee', async () => {
    // Mock current user (different from acting party)
    vi.mocked(lookupApi.useGetPartyFromLoggedInUserQuery).mockReturnValue({
      data: mockCurrentUser,
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    // Mock useReporteeParty - returns the reportee party
    vi.mocked(useReporteeParty).mockReturnValue({
      party: mockReporteeParty,
      isLoading: false,
      error: undefined,
    });

    // Mock useConnectedParty for the "to" party
    vi.mocked(useConnectedParty).mockReturnValue({
      party: mockConnectedParty,
      isLoading: false,
      error: undefined,
      isError: false,
    });

    // Mock connections - reportee connection
    const reporteeConnection: Connection = {
      party: {
        id: mockReporteeParty.partyUuid,
        name: mockReporteeParty.name,
        type: 'Organization',
        children: null,
        keyValues: { OrganizationIdentifier: '987654321' },
        roles: [],
      },
      roles: [],
      connections: [],
    };

    vi.mocked(useGetRightHoldersQuery).mockReturnValue({
      data: [reporteeConnection],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    renderWithProvider(<TestConsumer />, {
      fromPartyUuid: mockReporteeParty.partyUuid,
      toPartyUuid: 'other-party-uuid',
      actingPartyUuid: mockReporteeParty.partyUuid,
    });

    await waitFor(() => {
      expect(screen.getByTestId('acting-party')).toHaveTextContent('Reportee Organization');
      expect(screen.getByTestId('from-party')).toHaveTextContent('Reportee Organization');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });
  });

  test('Case 5: fromParty equals actingParty when fromPartyUuid matches actingPartyUuid', async () => {
    vi.mocked(lookupApi.useGetPartyFromLoggedInUserQuery).mockReturnValue({
      data: mockCurrentUser,
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    vi.mocked(useReporteeParty).mockReturnValue({
      party: undefined,
      isLoading: false,
      error: undefined,
    });

    vi.mocked(useConnectedParty).mockReturnValue({
      party: mockConnectedParty,
      isLoading: false,
      error: undefined,
      isError: false,
    });

    vi.mocked(connectionApi.useGetRightHoldersQuery).mockReturnValue({
      data: [mockConnection],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    renderWithProvider(<TestConsumer />, {
      fromPartyUuid: mockCurrentUser.partyUuid,
      toPartyUuid: 'other-party-uuid',
      actingPartyUuid: mockCurrentUser.partyUuid,
    });

    await waitFor(() => {
      expect(screen.getByTestId('from-party')).toHaveTextContent('Current User');
      expect(screen.getByTestId('acting-party')).toHaveTextContent('Current User');
    });
  });

  test('Case 6: toParty equals actingParty when toPartyUuid matches actingPartyUuid', async () => {
    vi.mocked(lookupApi.useGetPartyFromLoggedInUserQuery).mockReturnValue({
      data: mockCurrentUser,
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    vi.mocked(useReporteeParty).mockReturnValue({
      party: undefined,
      isLoading: false,
      error: undefined,
    });

    vi.mocked(useConnectedParty).mockReturnValue({
      party: mockConnectedParty,
      isLoading: false,
      error: undefined,
      isError: false,
    });

    vi.mocked(connectionApi.useGetRightHoldersQuery).mockReturnValue({
      data: [mockConnection],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    renderWithProvider(<TestConsumer />, {
      fromPartyUuid: 'other-party-uuid',
      toPartyUuid: mockCurrentUser.partyUuid,
      actingPartyUuid: mockCurrentUser.partyUuid,
    });

    await waitFor(() => {
      expect(screen.getByTestId('to-party')).toHaveTextContent('Current User');
      expect(screen.getByTestId('acting-party')).toHaveTextContent('Current User');
    });
  });

  test('should show loading state while data is being fetched', async () => {
    vi.mocked(lookupApi.useGetPartyFromLoggedInUserQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
      isError: false,
    } as any);

    vi.mocked(useReporteeParty).mockReturnValue({
      party: undefined,
      isLoading: true,
      error: undefined,
    });

    vi.mocked(useConnectedParty).mockReturnValue({
      party: undefined,
      isLoading: false,
      error: undefined,
      isError: false,
    });

    vi.mocked(useGetRightHoldersQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
      isError: false,
    } as any);

    renderWithProvider(<TestConsumer />, {
      fromPartyUuid: 'from-uuid',
      toPartyUuid: 'to-uuid',
      actingPartyUuid: 'from-uuid',
    });

    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
  });

  test('usePartyRepresentation hook should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      'usePartyRepresentation must be used within a PartyRepresentationProvider',
    );

    consoleSpy.mockRestore();
  });

  test('should handle invalid connection (empty connections array)', async () => {
    vi.mocked(lookupApi.useGetPartyFromLoggedInUserQuery).mockReturnValue({
      data: mockCurrentUser,
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    vi.mocked(useReporteeParty).mockReturnValue({
      party: mockReporteeParty,
      isLoading: false,
      error: undefined,
    });

    vi.mocked(useConnectedParty).mockReturnValue({
      party: undefined,
      isLoading: false,
      error: undefined,
      isError: false,
    });

    // Return empty connections to simulate invalid connection
    vi.mocked(connectionApi.useGetRightHoldersQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    renderWithProvider(<TestConsumer />, {
      fromPartyUuid: 'invalid-from-uuid',
      toPartyUuid: 'invalid-to-uuid',
      actingPartyUuid: 'invalid-from-uuid',
    });

    await waitFor(
      () => {
        // When there's an invalid connection, the alert is shown
        // fromParty and toParty are undefined (shown as "none")
        // but actingParty is still set (reportee in this case)
        expect(screen.getByTestId('from-party')).toHaveTextContent('none');
        expect(screen.getByTestId('to-party')).toHaveTextContent('none');
        expect(screen.getByTestId('acting-party')).toHaveTextContent('Reportee Organization');
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      },
      { timeout: 2000 },
    );
  });
});
