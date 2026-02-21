import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import type { ExtendedUser } from '@/rtk/features/userInfoApi';

import { useFilteredUsers } from './useFilteredUsers';
import { Connection } from '@/rtk/features/connectionApi';

const mockConnections: Connection[] = [
  {
    party: {
      id: '123',
      name: 'Alice',
      type: 'Person',
      variant: 'Person',
      children: null,
      partyId: '00000000',
      dateOfBirth: '1981-03-20',
      roles: [],
    },
    roles: [
      {
        id: '123',
        code: 'styreleder',
      },
    ],
    connections: [],
    sortKey: 'Alice',
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
          partyId: '51256682',
          dateOfBirth: '01-02-03',
        },
      ],
      partyId: '00000000',
      organizationIdentifier: '123456789',
      roles: [],
    },
    roles: [
      { id: '123', code: 'rettighetshaver' },
      {
        id: '456',
        code: 'regnskapsforer',
      },
    ],
    connections: [],
    sortKey: 'Lorem AS',
  },
  {
    party: {
      id: '3d8b34c3-df0d-4dcc-be12-e788ce414744',
      name: 'DIGITALISERINGSDIREKTORATET',
      type: 'Organisasjon',
      variant: 'ORGL',
      children: null,
      partyId: '50088610',
      organizationIdentifier: '991825827',
      roles: [],
    },
    roles: [{ id: '42cae370-2dc1-4fdc-9c67-c2f4b0f0f829', code: 'rettighetshaver' }],
    connections: [],
    sortKey: 'DIGITALISERINGSDIREKTORATET',
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
          partyId: '51467911',
          organizationIdentifier: '311567330',
        },
      ],
      partyId: '51325818',
      organizationIdentifier: '310167010',
      roles: [],
    },
    roles: [{ id: '42cae370-2dc1-4fdc-9c67-c2f4b0f0f829', code: 'rettighetshaver' }],
    connections: [],
    sortKey: 'ORANSJE ALLSLAGS HAMSTER KF',
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
          partyId: '51480388',
          organizationIdentifier: '311657348',
        },
      ],
      partyId: '51480407',
      organizationIdentifier: '314081544',
      roles: [],
    },
    roles: [{ id: '42cae370-2dc1-4fdc-9c67-c2f4b0f0f829', code: 'rettighetshaver' }],
    connections: [],
    sortKey: 'TYKKHUDET IDIOTSIKKER STRUTS LTD',
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
    expect((result.current.users[0] as ExtendedUser).matchInChildren).toBe(true);
    expect(result.current.users[0].children).toHaveLength(1);
    expect(result.current.users[0]?.name).toBe('Lorem AS');
    expect(result?.current?.users?.[0]?.children?.[0]?.name).toBe('InheritAlice');
  });

  it('sorts by sort key before type ordering when listing users', () => {
    const { result } = renderHook(() =>
      useFilteredUsers({ connections: mockConnections, searchString: '' }),
    );

    expect(result.current.users.map((user) => user.name)).toEqual([
      'Alice',
      'DIGITALISERINGSDIREKTORATET',
      'Lorem AS',
      'ORANSJE ALLSLAGS HAMSTER KF',
      'TYKKHUDET IDIOTSIKKER STRUTS LTD',
    ]);
  });

  it('prioritizes new users and sorts newest first', () => {
    const now = Date.now();
    const connections: Connection[] = [
      {
        party: {
          id: 'old-org',
          name: 'Old Org',
          type: 'Organisasjon',
          variant: 'AS',
          children: null,
          partyId: '1',
          organizationIdentifier: '100000001',
          roles: [],
        },
        roles: [],
        connections: [],
        sortKey: 'Old Org',
      },
      {
        party: {
          id: 'newer-person',
          name: 'Newer Person',
          type: 'Person',
          variant: 'Person',
          children: null,
          partyId: '2',
          dateOfBirth: '1980-01-01',
          addedAt: new Date(now - 2 * 60 * 1000).toISOString(),
          roles: [],
        },
        roles: [],
        connections: [],
        sortKey: 'Newer Person',
      },
      {
        party: {
          id: 'older-new-org',
          name: 'Older New Org',
          type: 'Organisasjon',
          variant: 'AS',
          children: null,
          partyId: '3',
          organizationIdentifier: '100000003',
          addedAt: new Date(now - 4 * 60 * 1000).toISOString(),
          roles: [],
        },
        roles: [],
        connections: [],
        sortKey: 'Older New Org',
      },
    ];

    const { result } = renderHook(() => useFilteredUsers({ connections, searchString: '' }));

    expect(result.current.users.map((user) => user.name)).toEqual([
      'Newer Person',
      'Older New Org',
      'Old Org',
    ]);
  });

  it('should keep all children when parent matches search string', () => {
    const { result } = renderHook(() =>
      useFilteredUsers({ connections: mockConnections, searchString: 'Lorem' }),
    );

    expect(result.current.users).toHaveLength(1);
    const parent = result.current.users[0] as ExtendedUser;
    expect(parent.name).toBe('Lorem AS');
    expect(parent.children).toBeTruthy();
    expect(parent.children?.length).toBe(1);
    expect(parent.matchInChildren).toBeFalsy();
  });

  it('prunes indirect root users that also exist in the direct graph', () => {
    const indirectConnections: Connection[] = [
      {
        party: {
          id: '123', // Alice exists in direct graph
          name: 'Alice',
          type: 'Person',
          variant: 'Person',
          children: null,
          partyId: '00000000',
          roles: [],
        },
        roles: [],
        connections: [],
      },
      {
        party: {
          id: 'ind-unique',
          name: 'Indirect Unique',
          type: 'Organisasjon',
          variant: 'AS',
          children: null,
          partyId: '11111111',
          roles: [],
        },
        roles: [],
        connections: [],
      },
    ];

    const { result } = renderHook(() =>
      useFilteredUsers({ connections: mockConnections, indirectConnections, searchString: '' }),
    );

    // Alice should be removed from indirect users because she exists directly
    expect(result.current.indirectUsers?.some((u) => u.id === '123')).toBe(false);
    // The unique one should remain
    expect(result.current.indirectUsers?.some((u) => u.id === 'ind-unique')).toBe(true);
  });

  it('paginates indirect users and supports goNextIndirectPage', () => {
    const makeIndirect = (n: number): Connection[] =>
      Array.from({ length: n }).map((_, i) => ({
        party: {
          id: `ind-${i + 1}`,
          name: `Indirect ${String(i + 1).padStart(2, '0')}`,
          type: 'Organisasjon',
          variant: 'AS',
          children: null,
          partyId: `${i + 1}`,
          roles: [],
        },
        roles: [],
        connections: [],
      }));

    const indirectConnections = makeIndirect(12);

    const { result } = renderHook(() =>
      useFilteredUsers({ connections: mockConnections, indirectConnections, searchString: '' }),
    );

    // Page size is 10
    expect(result.current.indirectUsers).toHaveLength(10);
    expect(result.current.hasNextIndirectPage).toBe(true);

    act(() => result.current.goNextIndirectPage());
    expect(result.current.indirectUsers).toHaveLength(12);
    expect(result.current.hasNextIndirectPage).toBe(false);
  });
});
