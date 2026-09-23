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
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
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
}));

// useRecipientForm always runs the org lookup, even for a person-only flow where it is skipped -
// a skipped RTK hook still runs, and an unmocked one throws without a store.
vi.mock('@/rtk/features/lookupApi', () => ({
  useGetOrganizationQuery: () => ({ data: undefined, isFetching: false, isError: false }),
}));

vi.mock('@/rtk/features/singleRights/singleRightsApi', () => ({
  useGetResourceRightsMetaQuery: () => rightsMeta,
  // Declared by useDelegableRights but skipped for an instance; a skipped hook still runs.
  useDelegationCheckQuery: () => ({ data: undefined, isLoading: false, isError: false }),
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
    // Level 4 under the level 3 section heading. This modal used to jump to 5.
    expect(
      screen.getByRole('heading', {
        name: 'delegation_modal.actions.cannot_give_header',
        level: 4,
      }),
    ).toBeInTheDocument();
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

  // The dialog unmounts its content when it closes, which is what replaced the old resetForm().
  it('starts from a clean form when reopened', async () => {
    await openModal();
    await fillPerson();
    await submit();

    await userEvent.click(screen.getByRole('button', { name: 'new_user_modal.trigger_button' }));

    expect(screen.getByLabelText('new_user_modal.person_identifier')).toHaveValue('');
    expect(screen.getByLabelText('common.last_name')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'common.give_poa' })).toBeDisabled();
  });

  it('cannot submit before an identity is given', async () => {
    await openModal();

    expect(screen.getByRole('button', { name: 'common.give_poa' })).toBeDisabled();
  });

  // PersonFields keeps the format error as a translation key and only shows it once the field is
  // left, which is the behaviour the users page has always had.
  it('reports a malformed identifier when the field is left, and keeps submit disabled', async () => {
    await openModal();
    await userEvent.type(screen.getByLabelText('new_user_modal.person_identifier'), '2083819838');
    await userEvent.type(screen.getByLabelText('common.last_name'), 'Medaljong');

    expect(
      screen.getByText('new_user_modal.person_identifier_ssn_format_error'),
    ).toBeInTheDocument();
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

  // Regression: the rights error used to be read from a key its hook no longer returned, so a
  // failing rights meta left the chip list empty and the submit button live.
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

  // A failure with no message of its own leads with the apology and carries the trace id, which is
  // what support asks for. Both arrived when this modal moved onto the shared NewUserAlert.
  it('reports an unrecognised failure with the trace id', async () => {
    delegateInstanceRights.mockReturnValue({
      unwrap: () => Promise.reject({ status: '500', data: { traceId: 'abc-123' } }),
    });
    await openModal();
    await fillPerson();
    await submit();

    expect(await screen.findByText('common.general_error_paragraph')).toBeInTheDocument();
    expect(screen.getByText('common.trace_id {"traceId":"abc-123"}')).toBeInTheDocument();
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
