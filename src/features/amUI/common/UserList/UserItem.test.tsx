import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PartyType } from '@/dataObjects/dtos/Party';

import type { UserSearchNode } from '../UserSearch/types';

import { UserItem } from './UserItem';

const roleMetadata = [
  {
    id: 'estate-administrator-id',
    name: 'Konkursbo administrator',
    code: 'innbygger-konkursbo-administrator',
    provider: { code: 'sys-altinn3' },
  },
  { id: 'agent-id', name: 'Agent', code: 'agent', provider: { code: 'sys-altinn3' } },
  { id: 'ceo-id', name: 'Daglig leder', code: 'daglig-leder', provider: { code: 'sys-ccr' } },
];

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'no_nb' } }),
}));

vi.mock('@/rtk/features/roleApi', () => ({
  useGetAllRolesQuery: () => ({ data: roleMetadata, isLoading: false, isError: false }),
}));

const userWithRoles = (roles: UserSearchNode['roles']): UserSearchNode => ({
  id: 'administrator-uuid',
  name: 'METTE MEDHJELPER',
  type: PartyType.Person,
  isDeleted: false,
  children: null,
  roles,
});

const renderItem = (roles: UserSearchNode['roles']) =>
  render(
    <MemoryRouter>
      <UserItem user={userWithRoles(roles)} />
    </MemoryRouter>,
  );

describe('UserItem, role badges', () => {
  beforeEach(() => {
    window.featureFlags = { enableBankruptcyEstateAdministration: true } as Window['featureFlags'];
  });

  it('shows the bankruptcy estate administrator role', () => {
    renderItem([{ id: 'estate-administrator-id', code: 'innbygger-konkursbo-administrator' }]);

    expect(screen.getByText('Konkursbo administrator')).toBeInTheDocument();
  });

  it('shows roles from the Central Coordinating Register but no other Altinn 3 role', () => {
    renderItem([
      { id: 'agent-id', code: 'agent' },
      { id: 'ceo-id', code: 'daglig-leder' },
    ]);

    expect(screen.getByText('Daglig leder')).toBeInTheDocument();
    expect(screen.queryByText('Agent')).toBeNull();
    expect(screen.queryByText('Konkursbo administrator')).toBeNull();
  });

  it('hides the bankruptcy estate administrator role while the feature is turned off', () => {
    window.featureFlags = { enableBankruptcyEstateAdministration: false } as Window['featureFlags'];

    renderItem([{ id: 'estate-administrator-id', code: 'innbygger-konkursbo-administrator' }]);

    expect(screen.queryByText('Konkursbo administrator')).toBeNull();
  });
});
