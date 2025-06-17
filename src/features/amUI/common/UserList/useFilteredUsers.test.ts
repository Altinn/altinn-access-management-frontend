import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import type { Connection } from '@/rtk/features/userInfoApi';

import { useFilteredUsers } from './useFilteredUsers';

const mockConnections: Connection[] = [
  {
    party: {
      id: '123',
      name: 'Alice',
      type: 'Person',
      variant: 'Person',
      children: null,
      keyValues: { PartyId: '00000000', DateOfBirth: '1981-03-20' },
    },
    roles: [
      {
        id: '123',
        code: 'styreleder',
      },
    ],
    connections: [],
  },
  {
    party: {
      id: '789',
      name: 'Lorem AS',
      type: 'Organisasjon',
      variant: 'AS',
      children: [
        {
          id: '0e56dc9e-bfb8-4914-809f-1720932c0088',
          name: 'InheritAlice',
          type: 'Person',
          children: null,
          keyValues: { PartyId: '51256682', DateOfBirth: '01-02-03' },
        },
      ],
      keyValues: { PartyId: '00000000', OrganizationIdentifier: '123456789' },
    },
    roles: [
      { id: '123', code: 'rettighetshaver' },
      {
        id: '456',
        code: 'regnskapsforer',
      },
    ],
    connections: [],
  },
  {
    party: {
      id: '3d8b34c3-df0d-4dcc-be12-e788ce414744',
      name: 'DIGITALISERINGSDIREKTORATET',
      type: 'Organisasjon',
      variant: 'ORGL',
      children: null,
      keyValues: { PartyId: '50088610', OrganizationIdentifier: '991825827' },
    },
    roles: [{ id: '42cae370-2dc1-4fdc-9c67-c2f4b0f0f829', code: 'rettighetshaver' }],
    connections: [],
  },
  {
    party: {
      id: '3f8e7d85-0dc5-4ab8-a5d0-8fcfa3926d01',
      name: 'ORANSJE ALLSLAGS HAMSTER KF',
      type: 'Organisasjon',
      variant: 'KF',
      children: [
        {
          id: 'd0f3c7b4-fe95-4ace-896e-538f13f941ca',
          name: 'ORANSJE ALLSLAGS HAMSTER KF',
          type: 'Organisasjon',
          variant: 'BEDR',
          children: null,
          keyValues: { PartyId: '51467911', OrganizationIdentifier: '311567330' },
        },
      ],
      keyValues: { PartyId: '51325818', OrganizationIdentifier: '310167010' },
    },
    roles: [{ id: '42cae370-2dc1-4fdc-9c67-c2f4b0f0f829', code: 'rettighetshaver' }],
    connections: [],
  },
  {
    party: {
      id: '4fc5c70f-69a2-4fa6-a794-90b0a82d5d9f',
      name: 'TYKKHUDET IDIOTSIKKER STRUTS LTD',
      type: 'Organisasjon',
      variant: 'NUF',
      children: [
        {
          id: 'ab8b2d5f-0aa4-4ff9-9be2-4bd542ae9b05',
          name: 'TYKKHUDET IDIOTSIKKER STRUTS LTD',
          type: 'Organisasjon',
          variant: 'BEDR',
          children: null,
          keyValues: { PartyId: '51480388', OrganizationIdentifier: '311657348' },
        },
      ],
      keyValues: { PartyId: '51480407', OrganizationIdentifier: '314081544' },
    },
    roles: [{ id: '42cae370-2dc1-4fdc-9c67-c2f4b0f0f829', code: 'rettighetshaver' }],
    connections: [],
  },
];

describe('useFilteredUsers', () => {
  it('should return filtered users based on search string', () => {
    const { result } = renderHook(() =>
      useFilteredUsers({ connections: mockConnections, searchString: 'Alice' }),
    );

    expect(result.current.users).toHaveLength(2);
    expect(result.current.users[0].name).toBe('Alice');
    expect(result.current.users[1].name).toBe('Lorem AS');
  });

  it('should return all users when search string is empty', () => {
    const { result } = renderHook(() =>
      useFilteredUsers({ connections: mockConnections, searchString: '' }),
    );

    expect(result.current.users).toHaveLength(5);
  });

  it('should handle organization number search correctly', () => {
    const { result } = renderHook(() =>
      useFilteredUsers({ connections: mockConnections, searchString: '789' }),
    );

    expect(result.current.users).toHaveLength(1);
    expect(result.current.users[0].name).toBe('Lorem AS');
  });

  it('should return hasNextPage: false when list contains less than 10 users', () => {
    const { result } = renderHook(() =>
      useFilteredUsers({ connections: mockConnections, searchString: '' }),
    );
    expect(result.current.hasNextPage).toBe(false);
  });

  it('should return hasNextPage: true when list contains more than 10 users', () => {
    const connections = [...mockConnections, ...mockConnections, ...mockConnections];
    const { result } = renderHook(() =>
      useFilteredUsers({
        connections,
        searchString: '',
      }),
    );
    expect(result.current.hasNextPage).toBe(true);
  });

  it('should return more users if goNextPage is called', async () => {
    const connections = [
      ...mockConnections,
      ...mockConnections,
      ...mockConnections,
    ] as Connection[];
    const { result } = renderHook(() =>
      useFilteredUsers({
        connections,
        searchString: '',
      }),
    );
    expect(result.current.hasNextPage).toBe(true);
    act(() => result.current.goNextPage());
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.users).toHaveLength(15);
  });

  it('should return no users when search string does not match any user', () => {
    const { result } = renderHook(() =>
      useFilteredUsers({ connections: mockConnections, searchString: 'NonExistent' }),
    );
    expect(result.current.users).toHaveLength(0);
  });

  it('should handle inheriting users correctly', () => {
    const { result } = renderHook(() =>
      useFilteredUsers({ connections: mockConnections, searchString: 'InheritAlice' }),
    );

    expect(result.current.users).toHaveLength(1);
    // expect(result.current.users[0].mathinchildren).toBe(true);
    expect(result.current.users[0].children).toHaveLength(1);
    // expect(result?.current?.users[0]?.children[0]?.name).toBe('InheritAlice');
  });
});
