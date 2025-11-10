import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import { RoleList } from './RoleList';
import { DelegationAction } from '../DelegationModal/EditModal';

import type { RoleConnection } from '@/rtk/features/roleApi';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      if (key === 'role.no_roles') return 'no roles';
      if (key === 'role.activeRolesLabel') return 'active roles';
      if (key === 'role.other_provider_title') return 'Other providers';
      if (key === 'role.provider_status') {
        return options?.provider ? `provided by ${options.provider}` : key;
      }
      return key;
    },
  }),
}));

vi.mock('lottie-react', () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock('@/rtk/features/roleApi', () => ({
  useGetRolesForUserQuery: vi.fn(),
}));

import { useGetRolesForUserQuery } from '@/rtk/features/roleApi';

const useGetRolesForUserQueryMock = vi.mocked(useGetRolesForUserQuery);

vi.mock('../PartyRepresentationContext/PartyRepresentationContext', () => ({
  usePartyRepresentation: () => ({
    fromParty: { partyUuid: 'from-party' },
    toParty: { partyUuid: 'to-party' },
    actingParty: { partyUuid: 'acting-party' },
    isLoading: false,
  }),
}));

vi.mock('@/resources/utils/featureFlagUtils', async () => {
  const actual = await vi.importActual<typeof import('@/resources/utils/featureFlagUtils')>(
    '@/resources/utils/featureFlagUtils',
  );
  return {
    ...actual,
    revokeRolesEnabled: vi.fn(),
  };
});

import { revokeRolesEnabled } from '@/resources/utils/featureFlagUtils';

const revokeRolesEnabledMock = vi.mocked(revokeRolesEnabled);

vi.mock('@/resources/hooks/useFetchRecipientInfo', () => ({
  useFetchRecipientInfo: () => ({
    userID: 'user-id',
    partyID: 'party-id',
  }),
}));

vi.mock('@/resources/utils', async () => {
  const actual = await vi.importActual<typeof import('@/resources/utils')>('@/resources/utils');
  return {
    ...actual,
    getRedirectToServicesAvailableForUserUrl: vi.fn().mockReturnValue('/old-solution-url'),
  };
});

vi.mock('@/resources/utils/pathUtils', async () => {
  const actual = await vi.importActual<typeof import('@/resources/utils/pathUtils')>(
    '@/resources/utils/pathUtils',
  );
  return {
    ...actual,
    getHostUrl: vi.fn().mockReturnValue('https://altinn.example/'),
  };
});

vi.mock('./RevokeRoleButton', () => ({
  RevokeRoleButton: ({ accessRole }: { accessRole: { id: string; name: string } }) => (
    <button data-testid={`revoke-${accessRole.id}`}>Revoke {accessRole.name}</button>
  ),
}));

const createConnection = (id: string, providerCode: string): RoleConnection =>
  ({
    role: {
      id,
      name: `Role ${id}`,
      code: `CODE-${id}`,
      description: `Description for role ${id}`,
      provider: {
        id: `provider-${id}`,
        name:
          providerCode === 'sys-ccr'
            ? 'Enhetsregisteret'
            : providerCode === 'sys-altinn2'
              ? 'Altinn 2'
              : 'Altinn 3',
        code: providerCode,
      },
    },
    permissions: [
      {
        from: {
          id: 'from-party',
          name: 'From Org',
        },
        to: {
          id: 'to-party',
          name: 'To Person',
          type: 'party',
          variant: 'person',
          keyValues: [],
        },
        via: null,
        role: {
          id,
          code: `CODE-${id}`,
          children: null,
        },
        viaRole: null,
      },
    ],
  }) as RoleConnection;

describe('RoleList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    revokeRolesEnabledMock.mockReturnValue(true);
    useGetRolesForUserQueryMock.mockReturnValue({
      data: [
        createConnection('1', 'sys-ccr'),
        createConnection('2', 'sys-altinn2'),
        createConnection('3', 'sys-altinn3'),
      ],
      isLoading: false,
    });
  });

  it('shows revoke control when provider is sys-altinn2 and feature toggle enabled', () => {
    render(
      <MemoryRouter>
        <RoleList
          onSelect={vi.fn()}
          onActionError={vi.fn()}
          availableActions={[DelegationAction.REVOKE]}
        />
      </MemoryRouter>,
    );

    expect(
      screen
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent?.trim() ?? ''),
    ).toEqual(['Enhetsregisteret', 'Altinn 2', 'Altinn 3']);

    expect(
      screen.getByRole('link', { name: 'role.roles_description_link_text' }).getAttribute('href'),
    ).toBe('/old-solution-url');

    expect(screen.getByRole('button', { name: 'Role 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Role 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Role 3' })).toBeInTheDocument();

    expect(screen.queryByTestId('revoke-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('revoke-2')).toBeInTheDocument();
    expect(screen.queryByTestId('revoke-3')).not.toBeInTheDocument();
  });

  it('hides revoke control when feature toggle is disabled', () => {
    revokeRolesEnabledMock.mockReturnValue(false);

    render(
      <MemoryRouter>
        <RoleList
          onSelect={vi.fn()}
          onActionError={vi.fn()}
          availableActions={[DelegationAction.REVOKE]}
        />
      </MemoryRouter>,
    );

    expect(screen.queryByTestId('revoke-2')).not.toBeInTheDocument();
  });
});
