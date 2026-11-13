import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PartyType, type PartyEntity } from '@/dataObjects/dtos/Party';

import { UserRoles } from './UserRoles';

const person = (id: string, name: string): PartyEntity => ({
  id,
  name,
  type: PartyType.Person,
  isDeleted: false,
});

const trustee = person('trustee-uuid', 'BJARNE BOSTYRER');
const administrator = person('administrator-uuid', 'METTE MEDHJELPER');

const rolePermission = (code: string) => ({
  role: { id: `${code}-id`, name: code, code, provider: { code: 'sys-altinn3' } },
  permissions: [],
});

const mocks = vi.hoisted<{ parties: object; permissions: object[] }>(() => ({
  parties: {},
  permissions: [],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'no_nb' } }),
}));

vi.mock('@/rtk/features/roleApi', () => ({
  useGetRolePermissionsQuery: () => ({ data: mocks.permissions }),
  useGetAllRolesQuery: () => ({ data: [], isLoading: false, isError: false }),
}));

vi.mock('@/resources/utils/screensizeUtils', () => ({
  useIsMobileOrSmaller: () => false,
}));

vi.mock('../PartyRepresentationContext/PartyRepresentationContext', () => ({
  usePartyRepresentation: () => mocks.parties,
}));

vi.mock('../DelegationModal/RoleInfoModal', () => ({
  RoleInfoModal: () => null,
}));

vi.mock('./ClientAccessInfoModal', () => ({
  ClientAccessInfoModal: () => null,
}));

vi.mock('./BankruptcyEstateAdministratorInfoModal', () => ({
  BankruptcyEstateAdministratorInfoModal: ({
    open,
    trustee,
    isTrusteeSelectedActor,
  }: {
    open: boolean;
    trustee?: PartyEntity;
    isTrusteeSelectedActor: boolean;
  }) =>
    open ? <div>{`info_modal ${trustee?.name} direct_link=${isTrusteeSelectedActor}`}</div> : null,
}));

const chipName = 'user_roles.is_bankruptcy_estate_administrator';

const setUp = (parties: Record<string, PartyEntity>, roleCodes: string[]) => {
  mocks.parties = parties;
  mocks.permissions = roleCodes.map(rolePermission);
  render(<UserRoles />);
};

describe('UserRoles, bankruptcy estate administrator', () => {
  beforeEach(() => {
    mocks.parties = {};
    mocks.permissions = [];
    window.featureFlags = { enableBankruptcyEstateAdministration: true } as Window['featureFlags'];
  });

  it('shows the chip and opens the dialog with a direct link when the trustee is the selected actor', async () => {
    setUp(
      { fromParty: trustee, toParty: administrator, actingParty: trustee, selfParty: trustee },
      ['innbygger-konkursbo-administrator'],
    );

    expect(screen.queryByText(/info_modal/)).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: chipName }));

    expect(screen.getByText('info_modal BJARNE BOSTYRER direct_link=true')).toBeInTheDocument();
  });

  it('tells the dialog to switch actor when the administrator looks at their own access', async () => {
    setUp(
      {
        fromParty: trustee,
        toParty: administrator,
        actingParty: administrator,
        selfParty: administrator,
      },
      ['innbygger-konkursbo-administrator'],
    );

    await userEvent.click(screen.getByRole('button', { name: chipName }));

    expect(screen.getByText('info_modal BJARNE BOSTYRER direct_link=false')).toBeInTheDocument();
  });

  it('does not show the chip for the role a person has towards themselves', () => {
    setUp({ fromParty: trustee, toParty: trustee, actingParty: trustee, selfParty: trustee }, [
      'innbygger-konkursbo-administrator',
    ]);

    expect(screen.queryByRole('button', { name: chipName })).toBeNull();
  });

  it('does not show the chip without the role', () => {
    setUp(
      { fromParty: trustee, toParty: administrator, actingParty: trustee, selfParty: trustee },
      ['agent'],
    );

    expect(screen.queryByRole('button', { name: chipName })).toBeNull();
    expect(
      screen.getByRole('button', { name: 'user_roles.has_client_access' }),
    ).toBeInTheDocument();
  });

  it('does not show the chip while the feature is turned off', () => {
    window.featureFlags = { enableBankruptcyEstateAdministration: false } as Window['featureFlags'];

    setUp(
      { fromParty: trustee, toParty: administrator, actingParty: trustee, selfParty: trustee },
      ['innbygger-konkursbo-administrator'],
    );

    expect(screen.queryByRole('button', { name: chipName })).toBeNull();
  });
});
