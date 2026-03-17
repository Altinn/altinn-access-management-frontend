import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ConnectionUserType } from '@/rtk/features/connectionApi';

import { UserSearch } from './UserSearch';
import type { UserSearchNode } from './types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../PartyRepresentationContext/PartyRepresentationContext', () => ({
  usePartyRepresentation: () => ({
    fromParty: undefined,
  }),
}));

vi.mock('../DelegationModal/EditModal', () => ({
  DelegationAction: {
    DELEGATE: 'DELEGATE',
    REVOKE: 'REVOKE',
    REQUEST: 'REQUEST',
  },
}));

vi.mock('@/features/amUI/users/NewUserModal/NewUserModal', () => ({
  NewUserButton: () => null,
}));

vi.mock('./UserSearchResults', () => ({
  UserSearchResults: ({
    users,
    availableAction,
  }: {
    users: UserSearchNode[];
    availableAction: string;
  }) => (
    <div data-testid={availableAction === 'DELEGATE' ? 'indirect-results' : 'direct-results'}>
      {users.length}
    </div>
  ),
}));

const createUser = (id: string, name: string): UserSearchNode => ({
  id,
  name,
  type: ConnectionUserType.Person,
  variant: 'person',
  children: null,
  roles: [],
});

describe('UserSearch', () => {
  it('shows the no users message when indirect connections are shown by default and direct users are empty', () => {
    render(
      <UserSearch
        includeSelfAsChild={false}
        showIndirectConnectionsByDefault
        users={[]}
        indirectUsers={[createUser('indirect-1', 'Indirect User')]}
        canDelegate={true}
        AddUserButton={() => null}
        noUsersText='No users with access'
      />,
    );

    const directHeading = screen.getByText('advanced_user_search.direct_connections');
    const emptyMessage = screen.getByText('No users with access');

    expect(directHeading).toBeInTheDocument();
    expect(emptyMessage).toBeInTheDocument();
    expect(directHeading.compareDocumentPosition(emptyMessage)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(screen.queryByTestId('direct-results')).not.toBeInTheDocument();
    expect(screen.getByText('advanced_user_search.indirect_connections')).toBeInTheDocument();
    expect(screen.getByTestId('indirect-results')).toHaveTextContent('1');
  });

  it('shows the direct header during search when only the indirect list has matches', async () => {
    const user = userEvent.setup();

    render(
      <UserSearch
        includeSelfAsChild={false}
        showIndirectConnectionsByDefault
        users={[createUser('direct-1', 'Direct User')]}
        indirectUsers={[createUser('indirect-1', 'Indirect Match')]}
        canDelegate={true}
        AddUserButton={() => null}
      />,
    );

    await user.type(screen.getByRole('searchbox', { name: 'common.search' }), 'Match');

    expect(screen.getByText('advanced_user_search.direct_connections')).toBeInTheDocument();
    expect(screen.getByText('advanced_user_search.indirect_connections')).toBeInTheDocument();
    expect(screen.getByTestId('direct-results')).toHaveTextContent('0');
    expect(screen.getByTestId('indirect-results')).toHaveTextContent('1');
  });
});
