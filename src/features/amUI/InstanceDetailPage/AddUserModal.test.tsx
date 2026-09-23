import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AddUserButton } from './AddUserModal';

const delegateInstanceRights = vi.fn();

let rightsMeta: unknown;
let delegationCheck: unknown;

vi.mock('lottie-react', () => ({ default: () => null }));

// Labels are the translation keys, per the convention in the other component tests. Interpolation
// values are appended so assertions can still tell "2 of 3 actions" from "all actions".
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
}));

vi.mock('../common/PartyRepresentationContext/PartyRepresentationContext', () => ({
  usePartyRepresentation: () => ({
    actingParty: { partyUuid: 'org' },
    fromParty: { partyUuid: 'org' },
  }),
}));

vi.mock('@/rtk/features/connectionApi', () => ({
  connectionApi: { util: { invalidateTags: (tags: string[]) => ({ type: 'invalidate', tags }) } },
}));

vi.mock('@/rtk/features/instanceApi', () => ({
  useDelegateInstanceRightsMutation: () => [delegateInstanceRights, { isLoading: false }],
  useInstanceDelegationCheckQuery: () => delegationCheck,
  // The add-user flow passes no from/to party, so this query is always skipped.
  useGetInstanceRightsQuery: () => ({ data: undefined, isLoading: false, isFetching: false }),
}));

vi.mock('@/rtk/features/singleRights/singleRightsApi', () => ({
  useGetResourceRightsMetaQuery: () => rightsMeta,
}));

const dialog = () => document.querySelector('dialog');

const openModal = async () => {
  render(
    <AddUserButton
      resourceId='res-1'
      instanceUrn='urn:altinn:instance:i-1'
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'new_user_modal.trigger_button' }));
};

const fillPerson = async () => {
  await userEvent.type(screen.getByLabelText('new_user_modal.person_identifier'), '20838198385');
  await userEvent.type(screen.getByLabelText('common.last_name'), 'Medaljong');
};

const expandActions = () =>
  userEvent.click(screen.getByRole('button', { name: /delegation_modal\./ }));

const submit = () => userEvent.click(screen.getByRole('button', { name: 'common.give_poa' }));

beforeEach(() => {
  vi.clearAllMocks();
  delegateInstanceRights.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  rightsMeta = {
    data: [
      { key: 'read', name: 'Les' },
      { key: 'write', name: 'Skriv' },
      { key: 'sign', name: 'Signer' },
    ],
    isLoading: false,
    isError: false,
  };
  delegationCheck = {
    data: [
      { right: { key: 'read', name: 'Les' }, result: true, reasonCodes: [] },
      { right: { key: 'write', name: 'Skriv' }, result: true, reasonCodes: [] },
      { right: { key: 'sign', name: 'Signer' }, result: false, reasonCodes: ['MissingRoleAccess'] },
    ],
    isLoading: false,
    isError: false,
  };
});

describe('AddUserModal', () => {
  it('pre-checks the actions the reportee may pass on, and flags the ones it may not', async () => {
    await openModal();

    expect(
      screen.getByRole('button', {
        name: 'delegation_modal.actions.partial_access {"count":2,"total":3}',
      }),
    ).toBeInTheDocument();

    await expandActions();
    expect(screen.getByText('delegation_modal.actions.cannot_give_header')).toBeInTheDocument();
    expect(screen.getByText('Signer')).toBeInTheDocument();
  });

  it('delegates the chosen actions to the person given', async () => {
    await openModal();
    await fillPerson();
    await submit();

    expect(delegateInstanceRights).toHaveBeenCalledWith({
      party: 'org',
      resource: 'res-1',
      instance: 'urn:altinn:instance:i-1',
      input: {
        to: { personIdentifier: '20838198385', lastName: 'Medaljong' },
        directRightKeys: ['read', 'write'],
      },
    });
    expect(dialog()?.open).toBe(false);
  });

  it('delegates only the actions left checked', async () => {
    await openModal();
    await fillPerson();
    await expandActions();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Skriv' }));
    await submit();

    expect(delegateInstanceRights).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({ directRightKeys: ['read'] }),
      }),
    );
  });

  it('cannot submit before an identity is given', async () => {
    await openModal();

    expect(screen.getByRole('button', { name: 'common.give_poa' })).toBeDisabled();
  });

  it('cannot submit with every action unchecked', async () => {
    await openModal();
    await fillPerson();
    await expandActions();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Les' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Skriv' }));

    expect(screen.getByRole('button', { name: 'common.give_poa' })).toBeDisabled();
  });

  // Regression: the rights error was read from a key useInstanceDelegationRightsData no longer
  // returned, so a failing rights meta left the chip list empty and the submit button live.
  it('blocks submit and reports the error when the actions cannot be loaded', async () => {
    rightsMeta = { data: undefined, isLoading: false, isError: true, error: { status: 500 } };
    await openModal();
    await fillPerson();

    expect(screen.getByText('common.general_error_paragraph')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.give_poa' })).toBeDisabled();
    expect(delegateInstanceRights).not.toHaveBeenCalled();
  });

  it('blocks submit when the resource has no actions to give', async () => {
    rightsMeta = { data: [], isLoading: false, isError: false };
    await openModal();
    await fillPerson();

    expect(screen.getByText('common.general_error_paragraph')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.give_poa' })).toBeDisabled();
  });

  it('keeps the dialog open and reports the failure when the delegation fails', async () => {
    delegateInstanceRights.mockReturnValue({
      unwrap: () => Promise.reject({ status: '400', data: '' }),
    });
    await openModal();
    await fillPerson();
    await submit();

    expect(await screen.findByText('new_user_modal.not_found_error_person')).toBeInTheDocument();
    expect(dialog()?.open).toBe(true);
  });
});
