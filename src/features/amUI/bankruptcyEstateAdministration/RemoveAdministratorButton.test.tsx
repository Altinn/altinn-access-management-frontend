import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PartyType, type PartyEntity } from '@/dataObjects/dtos/Party';

import { RemoveAdministratorButton } from './RemoveAdministratorButton';

const removeAdministrator = vi.fn();
const handleSelectAccount = vi.fn();
const requestFocusOnDataChange = vi.fn();

const person = (id: string, name: string): PartyEntity => ({
  id,
  name,
  type: PartyType.Person,
  isDeleted: false,
});

const trustee = person('trustee-uuid', 'BJARNE BOSTYRER');
const administrator = person('administrator-uuid', 'METTE MEDHJELPER');
let selfParty: PartyEntity;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { name?: string; trustee?: string }) =>
      options?.name ? `${key} ${options.name} ${options.trustee}` : key,
  }),
}));

vi.mock('@/rtk/features/bankruptcyEstateApi', () => ({
  useRemoveAdministratorMutation: () => [removeAdministrator],
  useGetAdministratorsQuery: () => ({ data: [] }),
}));

vi.mock('../common/PartyRepresentationContext/PartyRepresentationContext', () => ({
  usePartyRepresentation: () => ({ actingParty: trustee, selfParty }),
}));

vi.mock('../common/RestoreFocus', () => ({
  useRestoreFocusOnDataChange: () => requestFocusOnDataChange,
}));

vi.mock('../common/PageLayoutWrapper/useHeader', () => ({
  handleSelectAccount: (accountUuid: string) => {
    handleSelectAccount(accountUuid);
  },
}));

const succeed = () =>
  removeAdministrator.mockReturnValue({ unwrap: vi.fn().mockResolvedValue(undefined) });

const fail = () =>
  removeAdministrator.mockReturnValue({ unwrap: vi.fn().mockRejectedValue({ status: 500 }) });

const openAndConfirm = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'common.delete_poa' }));
  await userEvent.click(screen.getByRole('button', { name: 'common.yes_delete' }));
};

beforeEach(() => {
  vi.clearAllMocks();
  selfParty = trustee;
});

describe('RemoveAdministratorButton', () => {
  it('says who loses access to whose bankruptcy estates', async () => {
    render(<RemoveAdministratorButton administrator={administrator} />);

    await userEvent.click(screen.getByRole('button', { name: 'common.delete_poa' }));

    expect(screen.getByText('common.confirm_delete_heading')).toBeInTheDocument();
    expect(
      screen.getByText(
        'bankruptcy_estate_administration_page.remove_administrator_body Mette Medhjelper Bjarne Bostyrer',
      ),
    ).toBeInTheDocument();
    expect(removeAdministrator).not.toHaveBeenCalled();
  });

  it('removes the administrator when the removal is confirmed', async () => {
    succeed();
    render(<RemoveAdministratorButton administrator={administrator} />);

    await openAndConfirm();

    expect(removeAdministrator).toHaveBeenCalledWith({ user: 'administrator-uuid' });
    expect(handleSelectAccount).not.toHaveBeenCalled();
    expect(requestFocusOnDataChange).toHaveBeenCalledWith(
      'administrator-uuid',
      'bankruptcy_estate_administrator_search',
    );
  });

  it('continues as themself when the administrator removes themself', async () => {
    succeed();
    selfParty = administrator;
    render(<RemoveAdministratorButton administrator={administrator} />);

    await openAndConfirm();

    expect(handleSelectAccount).toHaveBeenCalledWith('administrator-uuid');
    expect(requestFocusOnDataChange).not.toHaveBeenCalled();
  });

  it('shows an error and stays when the removal fails', async () => {
    fail();
    selfParty = administrator;
    render(<RemoveAdministratorButton administrator={administrator} />);

    await openAndConfirm();

    expect(screen.getByText('common.general_error_paragraph')).toBeInTheDocument();
    expect(handleSelectAccount).not.toHaveBeenCalled();
    expect(requestFocusOnDataChange).not.toHaveBeenCalled();
  });

  it('asks for focus on the neighbouring row when one is given', async () => {
    succeed();
    render(
      <RemoveAdministratorButton
        administrator={administrator}
        focusIdAfterRemoval='neighbour-uuid'
      />,
    );

    await openAndConfirm();

    expect(requestFocusOnDataChange).toHaveBeenCalledWith(
      'neighbour-uuid',
      'bankruptcy_estate_administrator_search',
    );
  });
});
