import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';

import type { User } from '@/rtk/features/userInfoApi';
import { PartyType } from '@/rtk/features/userInfoApi';

import { useFilteredUsers } from './useFilteredUsers';

const mockUsers: User[] = [
  {
    partyUuid: '1',
    name: 'Alice',
    inheritingUsers: [],
    partyType: PartyType.Person,
    registryRoles: [],
  },
  {
    partyUuid: '2',
    name: 'Bob',
    inheritingUsers: [],
    partyType: PartyType.Person,
    registryRoles: [],
  },
  {
    partyUuid: '2.5',
    name: 'Ipsum AS',
    organizationNumber: '456',
    inheritingUsers: [
      {
        partyUuid: '1',
        name: 'InheritBob',
        inheritingUsers: [],
        partyType: PartyType.Person,
        registryRoles: [],
      },
    ],
    partyType: PartyType.Organization,
    registryRoles: [],
  },
  {
    partyUuid: '3',
    name: 'Lorem AS',
    organizationNumber: '789',
    inheritingUsers: [
      {
        partyUuid: '1',
        name: 'InheritAlice',
        inheritingUsers: [],
        partyType: PartyType.Person,
        registryRoles: [],
      },
    ],
    partyType: PartyType.Organization,
    registryRoles: [],
  },
];

describe('useFilteredUsers', () => {
  it('should return filtered users based on search string', () => {
    const { result } = renderHook(() =>
      useFilteredUsers({ users: mockUsers, searchString: 'Alice' }),
    );

    expect(result.current.users).toHaveLength(2);
    expect(result.current.users[0].name).toBe('Alice');
    expect(result.current.users[1].name).toBe('Lorem AS');
  });

  it('should return all users when search string is empty', () => {
    const { result } = renderHook(() => useFilteredUsers({ users: mockUsers, searchString: '' }));

    expect(result.current.users).toHaveLength(4);
  });

  it('should handle organization number search correctly', () => {
    const { result } = renderHook(() =>
      useFilteredUsers({ users: mockUsers, searchString: '789' }),
    );

    expect(result.current.users).toHaveLength(1);
    expect(result.current.users[0].name).toBe('Lorem AS');
  });

  it('should return hasNextPage: false when list contains less than 10 users', () => {
    const { result } = renderHook(() => useFilteredUsers({ users: mockUsers, searchString: '' }));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('should return hasNextPage: true when list contains more than 10 users', () => {
    const users = [...mockUsers, ...mockUsers, ...mockUsers];
    const { result } = renderHook(() =>
      useFilteredUsers({
        users,
        searchString: '',
      }),
    );
    expect(result.current.hasNextPage).toBe(true);
  });

  it('should return all more users if goNextPage is called', () => {
    const users = [...mockUsers, ...mockUsers, ...mockUsers];
    const { result } = renderHook(() =>
      useFilteredUsers({
        users,
        searchString: '',
      }),
    );
    expect(result.current.hasNextPage).toBe(true);
    result.current.goNextPage();
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.users).toHaveLength(12);
  });

  it('should return no users when search string does not match any user', () => {
    const { result } = renderHook(() =>
      useFilteredUsers({ users: mockUsers, searchString: 'NonExistent' }),
    );
    expect(result.current.users).toHaveLength(0);
  });

  it('should handle inheriting users correctly', () => {
    const { result } = renderHook(() =>
      useFilteredUsers({ users: mockUsers, searchString: 'InheritAlice' }),
    );

    expect(result.current.users).toHaveLength(1);
    expect(result.current.users[0].matchInInheritingUsers).toBe(true);
    expect(result.current.users[0].inheritingUsers).toHaveLength(1);
    expect(result.current.users[0].inheritingUsers[0].name).toBe('InheritAlice');
  });
});
