import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AddServiceUserButton } from './AddServiceUserModal';

const addRightHolder = vi.fn();
const delegateRights = vi.fn();
const onUserAdded = vi.fn();

let rightsMeta: unknown;
let delegationCheck: unknown;
let organization: unknown;
let resource: unknown;

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

vi.mock('../common/PartyRepresentationContext/PartyRepresentationContext', () => ({
  usePartyRepresentation: () => ({
    actingParty: { partyUuid: 'org' },
    fromParty: { partyUuid: 'org' },
  }),
}));

vi.mock('@/rtk/features/connectionApi', () => ({
  useAddRightHolderMutation: () => [addRightHolder],
}));

vi.mock('@/rtk/features/lookupApi', () => ({
  useGetOrganizationQuery: () => organization,
}));

// Read by ResourceAlert, which names the reportee in the access-list variant of its message.
vi.mock('@/rtk/features/userInfoApi', () => ({
  useGetReporteeQuery: () => ({
    data: { name: 'Diskret Nær Tiger AS', organizationNumber: '310202398' },
  }),
  PartyType: { Person: 'Person', Organization: 'Organisasjon' },
}));

// Declared by useDelegableRights but skipped without an instanceUrn; a skipped hook still runs,
// and an unmocked RTK hook throws without a store.
vi.mock('@/rtk/features/instanceApi', () => ({
  useInstanceDelegationCheckQuery: () => ({ data: undefined, isLoading: false, isError: false }),
}));

vi.mock('@/rtk/features/singleRights/singleRightsApi', () => ({
  useGetResourceRightsMetaQuery: () => rightsMeta,
  useDelegationCheckQuery: () => delegationCheck,
  useDelegateRightsMutation: () => [delegateRights],
}));

const dialog = () => document.querySelector('dialog');

const openModal = async () => {
  render(
    <AddServiceUserButton
      resource={resource as never}
      onUserAdded={onUserAdded}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'new_user_modal.trigger_button' }));
};

const fillPerson = async () => {
  await userEvent.type(screen.getByLabelText('new_user_modal.person_identifier'), '20838198385');
  await userEvent.type(screen.getByLabelText('common.last_name'), 'Medaljong');
};

const expandActions = () =>
  userEvent.click(screen.getByRole('button', { name: /delegation_modal\.actions\./ }));

const submit = () => userEvent.click(screen.getByRole('button', { name: 'common.give_poa' }));

beforeEach(() => {
  vi.clearAllMocks();
  addRightHolder.mockReturnValue({ unwrap: () => Promise.resolve('new-user-uuid') });
  delegateRights.mockReturnValue({ unwrap: () => Promise.resolve({}) });
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
  organization = { data: undefined, isFetching: false, isError: false };
  resource = {
    identifier: 'res-1',
    title: 'Skattemelding',
    resourceOwnerName: 'Skatteetaten',
    delegable: true,
  };
});

describe('AddServiceUserModal', () => {
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

  it('adds the person and delegates the chosen actions in one submit', async () => {
    await openModal();
    await fillPerson();
    await submit();

    expect(addRightHolder).toHaveBeenCalledWith({
      personInput: { personIdentifier: '20838198385', lastName: 'Medaljong' },
    });
    // The uuid that comes back is what the single rights API delegates to.
    expect(delegateRights).toHaveBeenCalledWith({
      partyUuid: 'org',
      fromUuid: 'org',
      toUuid: 'new-user-uuid',
      resourceId: 'res-1',
      actionKeys: ['read', 'write'],
    });
    expect(dialog()?.open).toBe(false);
    // Reported so the page can confirm it once the list it belongs to has reloaded.
    expect(onUserAdded).toHaveBeenCalledWith({ name: 'Medaljong', type: 'person' });
  });

  it('delegates only the actions left checked', async () => {
    await openModal();
    await fillPerson();
    await expandActions();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Skriv' }));
    await submit();

    expect(delegateRights).toHaveBeenCalledWith(expect.objectContaining({ actionKeys: ['read'] }));
  });

  it('adds an organisation by the party uuid its lookup returns', async () => {
    organization = {
      data: { orgNumber: '310202398', name: 'Diskret Nær Tiger AS', partyUuid: 'org-uuid' },
      isFetching: false,
      isError: false,
    };
    await openModal();
    await userEvent.click(screen.getByRole('tab', { name: 'new_user_modal.organization' }));
    await userEvent.type(screen.getByLabelText('common.org_number'), '310202398');
    await submit();

    expect(addRightHolder).toHaveBeenCalledWith({ partyUuidToBeAdded: 'org-uuid' });
    expect(delegateRights).toHaveBeenCalledWith(
      expect.objectContaining({ toUuid: 'new-user-uuid', actionKeys: ['read', 'write'] }),
    );
    expect(onUserAdded).toHaveBeenCalledWith({ name: 'Diskret Nær Tiger AS', type: 'org' });
  });

  const foundOrg = {
    data: { orgNumber: '310202398', name: 'Diskret Nær Tiger AS', partyUuid: 'org-uuid' },
    isFetching: false,
    isError: false,
  };

  const fillOrgNumber = async (value: string) => {
    await userEvent.click(screen.getByRole('tab', { name: 'new_user_modal.organization' }));
    await userEvent.type(screen.getByLabelText('common.org_number'), value);
  };

  // The shared lookup strips spaces, so a number typed in groups still reaches the 9 digit query.
  it('ignores spaces typed into the org number', async () => {
    organization = foundOrg;
    await openModal();
    await fillOrgNumber('310 202 398');

    expect(screen.getByLabelText('common.org_number')).toHaveValue('310202398');
    expect(screen.getByRole('button', { name: 'common.give_poa' })).toBeEnabled();
  });

  // isFetching, not isLoading: a second lookup leaves the first organisation in data while it runs.
  it('will not submit an organisation while its lookup is still running', async () => {
    organization = { ...foundOrg, isFetching: true };
    await openModal();
    await fillOrgNumber('310202398');

    expect(screen.queryByText('Diskret Nær Tiger AS')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.give_poa' })).toBeDisabled();
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

  it('does not delegate when adding the right holder fails', async () => {
    // RTK Query rejects with its own error shape rather than an Error, which is what the
    // flows have to handle, so that is what these reproduce.
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    addRightHolder.mockReturnValue({ unwrap: () => Promise.reject({ status: '400' }) });
    await openModal();
    await fillPerson();
    await submit();

    expect(delegateRights).not.toHaveBeenCalled();
    expect(await screen.findByText('new_user_modal.not_found_error_person')).toBeInTheDocument();
    expect(dialog()?.open).toBe(true);
  });

  // A picker with nothing pickable in it, over a button that can never be pressed, says nothing
  // about why. These three hand over to ResourceAlert instead, as the other resource modals do.
  it('explains itself instead of offering an empty picker when no action is delegable', async () => {
    delegationCheck = {
      data: [
        { right: { key: 'read', name: 'Les' }, result: false, reasonCodes: ['MissingRoleAccess'] },
        {
          right: { key: 'write', name: 'Skriv' },
          result: false,
          reasonCodes: ['MissingRoleAccess'],
        },
        {
          right: { key: 'sign', name: 'Signer' },
          result: false,
          reasonCodes: ['MissingRoleAccess'],
        },
      ],
      isLoading: false,
      isError: false,
    };
    await openModal();
    await fillPerson();

    expect(screen.getByText('delegation_modal.service_error.missing_rights')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delegation_modal\.actions\./ })).toBeNull();
    expect(screen.getByRole('button', { name: 'common.give_poa' })).toBeDisabled();
  });

  it('explains itself when the service cannot be given away at all', async () => {
    resource = { ...(resource as object), delegable: false };
    await openModal();
    await fillPerson();

    expect(screen.getByText(/service_error\.undelegable_service/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.give_poa' })).toBeDisabled();
  });

  it('explains itself when the actions cannot be loaded', async () => {
    rightsMeta = { data: undefined, isLoading: false, isError: true, error: { status: 500 } };
    await openModal();
    await fillPerson();

    expect(
      screen.getAllByText('delegation_modal.service_error.technical_error_heading').length,
    ).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'common.give_poa' })).toBeDisabled();
  });

  it('keeps the dialog open when the delegation itself fails', async () => {
    // RTK Query rejects with its own error shape rather than an Error, which is what the
    // flows have to handle, so that is what these reproduce.
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    delegateRights.mockReturnValue({ unwrap: () => Promise.reject('500') });
    await openModal();
    await fillPerson();
    await submit();

    expect(addRightHolder).toHaveBeenCalled();
    expect(dialog()?.open).toBe(true);
    expect(onUserAdded).not.toHaveBeenCalled();
  });
});
