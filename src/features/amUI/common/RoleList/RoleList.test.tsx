import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RoleList } from './RoleList';
import { DelegationAction } from '../DelegationModal/EditModal';

import type { RoleConnection } from '@/rtk/features/roleApi';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      if (key === 'role.no_roles') return 'no roles';
      if (key === 'role.activeRolesLabel') return 'active roles';
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
        name: providerCode === 'sys-altinn2' ? 'Altinn 2' : 'Altinn 3',
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
      data: [createConnection('1', 'sys-altinn2'), createConnection('2', 'sys-altinn3')],
      isLoading: false,
    });
  });

  it('shows revoke control when provider is sys-altinn2 and feature toggle enabled', () => {
    render(
      <RoleList
        onSelect={vi.fn()}
        onActionError={vi.fn()}
        availableActions={[DelegationAction.REVOKE]}
      />,
    );

    expect(screen.getByText('Role 1')).toBeInTheDocument();
    expect(screen.getByText('Role 2')).toBeInTheDocument();
    expect(screen.getByTestId('revoke-1')).toBeInTheDocument();
    expect(screen.queryByTestId('revoke-2')).not.toBeInTheDocument();
  });

  it('hides revoke control when feature toggle is disabled', () => {
    revokeRolesEnabledMock.mockReturnValue(false);

    render(
      <RoleList
        onSelect={vi.fn()}
        onActionError={vi.fn()}
        availableActions={[DelegationAction.REVOKE]}
      />,
    );

    expect(screen.queryByTestId('revoke-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('revoke-2')).not.toBeInTheDocument();
  });
});
