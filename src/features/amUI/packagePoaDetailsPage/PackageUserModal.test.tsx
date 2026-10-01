import { createRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DelegationAction } from '../common/DelegationModal/EditModal';
import type { UserActionTarget } from '../common/UserSearch/types';

import { PackageUserModal, type PackageUserModalHandle } from './PackageUserModal';

const onDelegate = vi.fn();
const onRevoke = vi.fn();

vi.mock('lottie-react', () => ({ default: () => null }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));

vi.mock(
  '../common/PartyRepresentationContext/PartyRepresentationContext',
  async (importOriginal) => ({
    ...(await importOriginal<object>()),
    usePartyRepresentation: () => ({
      fromParty: { partyUuid: 'from', name: 'Diskret Nær Tiger AS', partyTypeName: 'Organisasjon' },
    }),
  }),
);

const user: UserActionTarget = { id: 'user-1', name: 'Medaljong Ola', type: 'Person' };

const accessPackage = {
  id: 'pkg-1',
  urn: 'urn:altinn:accesspackage:regnskapsforer',
  name: 'Regnskapsfører',
  resources: [],
  isAssignable: true,
  permissions: [] as unknown[],
};

const error = { httpStatus: '500', timestamp: '2026-10-01T10:00:00Z', details: { traceId: 'abc' } };

const renderModal = (permissions: unknown[] = []) => {
  const ref = createRef<PackageUserModalHandle>();
  render(
    <PackageUserModal
      ref={ref}
      accessPackage={{ ...accessPackage, permissions } as never}
      availableActions={[DelegationAction.DELEGATE, DelegationAction.REVOKE]}
      isActionLoading={false}
      onDelegate={onDelegate}
      onRevoke={onRevoke}
    />,
  );
  return ref;
};

const dialog = () => document.querySelector('dialog');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PackageUserModal', () => {
  it('opens on the user and shows the error when an action from the list fails', () => {
    const ref = renderModal();
    expect(dialog()?.open).toBe(false);

    act(() => ref.current?.showError(user, error));

    expect(dialog()?.open).toBe(true);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Medaljong Ola');
    expect(screen.getByText('delegation_modal.general_error.delegate_heading')).toBeInTheDocument();
    expect(screen.getByText(/common.trace_id/)).toBeInTheDocument();
  });

  it('shows the revoke heading when the user still has the package', () => {
    const ref = renderModal([{ to: { id: user.id } }]);

    act(() => ref.current?.showError(user, error));

    expect(screen.getByText('delegation_modal.general_error.revoke_heading')).toBeInTheDocument();
  });

  it('clears the error when the action is retried', async () => {
    const ref = renderModal();
    act(() => ref.current?.showError(user, error));

    await userEvent.click(screen.getByRole('button', { name: 'common.give_poa' }));

    expect(onDelegate).toHaveBeenCalledWith(user);
    expect(
      screen.queryByText('delegation_modal.general_error.delegate_heading'),
    ).not.toBeInTheDocument();
  });

  it('keeps the dialog on the user it already shows', () => {
    const ref = renderModal();
    act(() => ref.current?.open(user));

    act(() => ref.current?.showError({ ...user, id: 'other', name: 'Annen Kari' }, error));

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Medaljong Ola');
    expect(screen.getByText('delegation_modal.general_error.delegate_heading')).toBeInTheDocument();
  });
});
