import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AddPackageUserButton } from './AddPackageUserModal';

const addRightHolder = vi.fn();
const delegatePackage = vi.fn();
const onUserAdded = vi.fn();

let organization: unknown;
let accessPackage: unknown;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));

// StatusSection reads the context itself, so the real module is kept and only the hook is replaced.
vi.mock(
  '../common/PartyRepresentationContext/PartyRepresentationContext',
  async (importOriginal) => ({
    ...(await importOriginal<object>()),
    usePartyRepresentation: () => ({
      actingParty: {
        partyUuid: 'acting',
        name: 'Diskret Nær Tiger AS',
        partyTypeName: 'Organisasjon',
      },
      fromParty: { partyUuid: 'from', name: 'Diskret Nær Tiger AS', partyTypeName: 'Organisasjon' },
    }),
  }),
);

vi.mock('@/rtk/features/connectionApi', () => ({
  useAddRightHolderMutation: () => [addRightHolder],
}));

vi.mock('@/rtk/features/accessPackageApi', () => ({
  useDelegatePackageMutation: () => [delegatePackage],
}));

vi.mock('@/rtk/features/lookupApi', () => ({
  useGetOrganizationQuery: () => organization,
}));

const dialog = () => document.querySelector('dialog');

const openModal = async () => {
  render(
    <AddPackageUserButton
      accessPackage={accessPackage as never}
      onUserAdded={onUserAdded}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'new_user_modal.trigger_button' }));
};

const fillPerson = async () => {
  await userEvent.type(screen.getByLabelText('new_user_modal.person_identifier'), '20838198385');
  await userEvent.type(screen.getByLabelText('common.last_name'), 'Medaljong');
};

const submit = () => userEvent.click(screen.getByRole('button', { name: 'common.give_poa' }));

beforeEach(() => {
  vi.clearAllMocks();
  addRightHolder.mockReturnValue({ unwrap: () => Promise.resolve('new-user-uuid') });
  delegatePackage.mockReturnValue({ unwrap: () => Promise.resolve() });
  organization = { data: undefined, isFetching: false, isError: false };
  accessPackage = {
    id: 'pkg-1',
    urn: 'urn:altinn:accesspackage:regnskapsforer',
    name: 'Regnskapsfører',
    resources: [],
    isAssignable: true,
  };
});

describe('AddPackageUserModal', () => {
  it('adds the person and delegates the package in one submit', async () => {
    await openModal();
    await fillPerson();
    await submit();

    expect(addRightHolder).toHaveBeenCalledWith({
      personInput: { personIdentifier: '20838198385', lastName: 'Medaljong' },
    });
    // The uuid that comes back is what the package is delegated to.
    expect(delegatePackage).toHaveBeenCalledWith({
      to: 'new-user-uuid',
      packageId: 'pkg-1',
      from: 'from',
      party: 'acting',
    });
    expect(dialog()?.open).toBe(false);
    expect(onUserAdded).toHaveBeenCalledWith({ name: 'Medaljong', type: 'person' });
  });

  it('adds an organisation by the party uuid its lookup returns', async () => {
    organization = {
      data: { orgNumber: '310202398', name: 'Sprudlende Ape AS', partyUuid: 'org-uuid' },
      isFetching: false,
      isError: false,
    };
    await openModal();
    await userEvent.click(screen.getByRole('tab', { name: 'new_user_modal.organization' }));
    await userEvent.type(screen.getByLabelText('common.org_number'), '310202398');
    await submit();

    expect(addRightHolder).toHaveBeenCalledWith({ partyUuidToBeAdded: 'org-uuid' });
    expect(delegatePackage).toHaveBeenCalledWith(expect.objectContaining({ to: 'new-user-uuid' }));
    expect(onUserAdded).toHaveBeenCalledWith({ name: 'Sprudlende Ape AS', type: 'org' });
  });

  it('does not delegate when adding the right holder fails', async () => {
    // RTK Query rejects with its own error shape rather than an Error.
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    addRightHolder.mockReturnValue({ unwrap: () => Promise.reject({ status: '400' }) });
    await openModal();
    await fillPerson();
    await submit();

    expect(delegatePackage).not.toHaveBeenCalled();
    expect(await screen.findByText('new_user_modal.not_found_error_person')).toBeInTheDocument();
    expect(dialog()?.open).toBe(true);
  });

  it('keeps the dialog open with a general error when the delegation fails', async () => {
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    delegatePackage.mockReturnValue({ unwrap: () => Promise.reject({ status: 500 }) });
    await openModal();
    await fillPerson();
    await submit();

    expect(await screen.findByText('common.general_error_paragraph')).toBeInTheDocument();
    expect(screen.queryByText('new_user_modal.not_found_error_person')).not.toBeInTheDocument();
    expect(dialog()?.open).toBe(true);
    expect(onUserAdded).not.toHaveBeenCalled();
  });

  it('explains a delegation the backend refuses by its validation code', async () => {
    delegatePackage.mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      unwrap: () => Promise.reject({ status: 400, data: { errorCode: 'AM.VLD-00002' } }),
    });
    await openModal();
    await fillPerson();
    await submit();

    expect(await screen.findByText('delegation_modal.validation_error.AM.VLD-00002')).toBeVisible();
    expect(dialog()?.open).toBe(true);
  });

  it('asks for confirmation before giving away a powerful package, and does nothing on cancel', async () => {
    accessPackage = {
      ...(accessPackage as object),
      urn: 'urn:altinn:accesspackage:hovedadministrator',
    };
    await openModal();
    await fillPerson();
    await submit();

    expect(addRightHolder).not.toHaveBeenCalled();
    expect(
      screen.getByText('delegation_modal.package_warning.delegate.hovedadministrator'),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'common.cancel' }));
    expect(addRightHolder).not.toHaveBeenCalled();
    expect(delegatePackage).not.toHaveBeenCalled();
  });

  it('adds and delegates once a powerful package is confirmed', async () => {
    accessPackage = {
      ...(accessPackage as object),
      urn: 'urn:altinn:accesspackage:hovedadministrator',
    };
    await openModal();
    await fillPerson();
    await submit();
    await userEvent.click(
      screen.getByRole('button', { name: 'delegation_modal.package_warning.delegate.confirm' }),
    );

    expect(addRightHolder).toHaveBeenCalled();
    expect(delegatePackage).toHaveBeenCalledWith(expect.objectContaining({ to: 'new-user-uuid' }));
    expect(onUserAdded).toHaveBeenCalledWith({ name: 'Medaljong', type: 'person' });
  });
});
