import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UserSearchProps } from '../common/UserSearch/UserSearch';

import { ServiceUsersSection } from './ServiceUsersSection';

const revokeTrigger = vi.fn();
const canRedelegateResource = vi.fn();
const openSnackbar = vi.fn();

let delegations: unknown;
let rightHolders: unknown;

// The list itself is covered by UserSearch's own tests; capture its props instead so the assertions
// stay on what this section decides: which users it hands over, and what each action does.
let userSearchProps: UserSearchProps;

// Pulled in transitively by the DelegationAction import chain (EditModal -> ResourceInfo ->
// LoadingAnimation). lottie-web needs a canvas, which jsdom does not implement.
vi.mock('lottie-react', () => ({ default: () => null }));

vi.mock('../common/UserSearch/UserSearch', () => ({
  default: (props: UserSearchProps) => {
    userSearchProps = props;
    return <div data-testid='user-search'>{props.AddUserButton}</div>;
  },
}));

vi.mock('./ServiceUserModal', () => ({
  ServiceUserModal: ({
    user,
    availableActions,
  }: {
    user: { name: string };
    availableActions: string[];
  }) => <div data-testid='service-user-modal'>{`${user.name}:${availableActions.join(',')}`}</div>,
}));

vi.mock('./AddServiceUserModal', () => ({
  AddServiceUserButton: ({ resourceId }: { resourceId: string }) => (
    <button type='button'>{`add user for ${resourceId}`}</button>
  ),
}));

vi.mock('../common/PartyRepresentationContext/PartyRepresentationContext', () => ({
  usePartyRepresentation: () => ({
    actingParty: { partyUuid: 'org' },
    fromParty: { partyUuid: 'org', name: 'Diskret Nær Tiger AS' },
  }),
}));

vi.mock('@/rtk/features/singleRights/singleRightsApi', () => ({
  useGetSingleRightsForRightholderQuery: () => delegations,
  useRevokeResourceMutation: () => [revokeTrigger, { isLoading: false }],
}));

vi.mock('@/rtk/features/connectionApi', () => ({
  useGetRightHoldersQuery: () => rightHolders,
  ConnectionUserType: { Person: 'Person', Organization: 'Organisasjon' },
}));

vi.mock('../common/RevokeConfirmation', () => ({
  // Runs the revoke straight away when redelegation is possible, mirroring useRevokeConfirmation.
  useRevokeConfirmation: () => ({
    confirmRevoke: async (_key: string, check: () => Promise<boolean>, revoke: () => void) => {
      if (await check()) revoke();
    },
    revokeConfirmationDialog: null,
  }),
  useCanRedelegateResource: () => ({ canRedelegateResource }),
}));

vi.mock('@altinn/altinn-components', async () => {
  const actual = await vi.importActual('@altinn/altinn-components');
  return { ...actual, useSnackbar: () => ({ openSnackbar }) };
});

const entity = (id: string, name: string) => ({ id, name, type: 'Person' });

const RESOURCE = { identifier: 'res-1', title: 'Skattemelding' } as never;

beforeEach(() => {
  vi.clearAllMocks();
  revokeTrigger.mockReturnValue({ unwrap: () => Promise.resolve() });
  canRedelegateResource.mockResolvedValue(true);
  delegations = {
    data: [
      {
        resource: { identifier: 'res-1' },
        permissions: [{ to: entity('ola', 'Ola Nordmann'), from: entity('org', 'Tiger AS') }],
      },
      {
        resource: { identifier: 'res-2' },
        permissions: [{ to: entity('kari', 'Kari Nordmann'), from: entity('org', 'Tiger AS') }],
      },
    ],
    isLoading: false,
    isFetching: false,
    isError: false,
  };
  rightHolders = {
    data: [{ party: { id: 'per', name: 'Per Person', type: 'Person' }, roles: [] }],
    isLoading: false,
    isFetching: false,
    isError: false,
  };
});

const renderSection = () =>
  render(
    <ServiceUsersSection
      resource={RESOURCE}
      isLoading={false}
    />,
  );

describe('ServiceUsersSection', () => {
  it('lists only the users holding a permission on this service', () => {
    renderSection();

    expect(userSearchProps.users?.map((user) => user.id)).toEqual(['ola']);
  });

  it('offers every right holder of the reportee as a delegation target', () => {
    renderSection();

    expect(userSearchProps.indirectUsers?.map((user) => user.id)).toEqual(['per']);
  });

  it('shows no users when the service has not been delegated to anyone', () => {
    delegations = { ...(delegations as object), data: [] };
    renderSection();

    expect(userSearchProps.users).toEqual([]);
  });

  it('opens the dialog to pick actions instead of delegating on the spot', async () => {
    renderSection();

    userSearchProps.onDelegate?.({ id: 'per', name: 'Per Person', type: 'Person' });

    expect(await screen.findByTestId('service-user-modal')).toHaveTextContent(
      'Per Person:DELEGATE',
    );
    expect(revokeTrigger).not.toHaveBeenCalled();
  });

  it('offers revoking as well when opening a user that already holds the service', async () => {
    renderSection();

    userSearchProps.onSelect?.({ id: 'ola', name: 'Ola Nordmann', type: 'Person' });

    expect(await screen.findByTestId('service-user-modal')).toHaveTextContent(
      'Ola Nordmann:DELEGATE,REVOKE',
    );
  });

  it('revokes the whole service from the user of the row that was acted on', async () => {
    renderSection();

    userSearchProps.onRevoke?.({ id: 'ola', name: 'Ola Nordmann', type: 'Person' });

    await vi.waitFor(() =>
      expect(revokeTrigger).toHaveBeenCalledWith({
        party: 'org',
        from: 'org',
        to: 'ola',
        resourceId: 'res-1',
      }),
    );
  });

  it('keeps the access when the revoke confirmation is not given', async () => {
    canRedelegateResource.mockResolvedValue(false);
    renderSection();

    userSearchProps.onRevoke?.({ id: 'ola', name: 'Ola Nordmann', type: 'Person' });

    await vi.waitFor(() => expect(canRedelegateResource).toHaveBeenCalledWith('res-1', 'ola'));
    expect(revokeTrigger).not.toHaveBeenCalled();
  });

  it('reports a failed revoke instead of leaving the row looking removed', async () => {
    revokeTrigger.mockReturnValue({ unwrap: () => Promise.reject(new Error('boom')) });
    renderSection();

    userSearchProps.onRevoke?.({ id: 'ola', name: 'Ola Nordmann', type: 'Person' });

    await vi.waitFor(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ color: 'danger' })),
    );
  });

  it('surfaces a technical error when the permissions cannot be loaded', async () => {
    delegations = {
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: { status: 500 },
    };
    renderSection();

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('offers adding a user for this service, which picks the actions in its own dialog', () => {
    renderSection();

    expect(screen.getByRole('button', { name: 'add user for res-1' })).toBeInTheDocument();
  });
});
