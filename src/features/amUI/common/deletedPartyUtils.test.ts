import { describe, it, expect } from 'vitest';

import type { Connection } from '@/rtk/features/connectionApi';

import { filterDeletedConnections, filterDeletedParties } from './deletedPartyUtils';

const connection = (
  id: string,
  isDeleted: boolean,
  connections: Connection[] = [],
  children: Connection['party']['children'] = null,
): Connection => ({
  party: {
    id,
    name: id,
    type: 'Organisasjon',
    children,
    isDeleted,
    roles: [],
  },
  roles: [],
  connections,
});

describe('filterDeletedConnections', () => {
  it('removes deleted parties and keeps the rest', () => {
    const result = filterDeletedConnections([
      connection('active', false),
      connection('deleted', true),
    ]);

    expect(result.map((c) => c.party.id)).toEqual(['active']);
  });

  it('removes deleted nested connections', () => {
    const result = filterDeletedConnections([
      connection('active', false, [connection('deleted-child', true), connection('child', false)]),
    ]);

    expect(result[0].connections.map((c) => c.party.id)).toEqual(['child']);
  });

  it('removes deleted party children', () => {
    const result = filterDeletedConnections([
      connection(
        'active',
        false,
        [],
        [
          { id: 'deleted-subunit', name: 'deleted-subunit', children: null, isDeleted: true },
          { id: 'subunit', name: 'subunit', children: null },
        ],
      ),
    ]);

    expect(result[0].party.children?.map((c) => c.id)).toEqual(['subunit']);
  });

  it('keeps a deleted party that still has non-deleted parties below it', () => {
    const result = filterDeletedConnections([
      connection('deleted-main-unit', true, [connection('active-subunit', false)]),
      connection('deleted-with-deleted-subunit', true, [connection('deleted-subunit', true)]),
    ]);

    expect(result.map((c) => c.party.id)).toEqual(['deleted-main-unit']);
    expect(result[0].connections.map((c) => c.party.id)).toEqual(['active-subunit']);
  });

  it('does not mutate the given connections', () => {
    const connections = [connection('active', false, [connection('deleted-child', true)])];

    filterDeletedConnections(connections);

    expect(connections[0].connections).toHaveLength(1);
  });
});

describe('filterDeletedParties', () => {
  it('removes items whose party is deleted', () => {
    const clients = [
      { client: { id: 'active', isDeleted: false } },
      { client: { id: 'deleted', isDeleted: true } },
      { client: { id: 'unknown' } },
    ];

    const result = filterDeletedParties(clients, (client) => client.client);

    expect(result.map((c) => c.client.id)).toEqual(['active', 'unknown']);
  });

  it('returns an empty list when there are no items', () => {
    expect(filterDeletedParties(undefined, (client: { client?: null }) => client.client)).toEqual(
      [],
    );
  });
});
