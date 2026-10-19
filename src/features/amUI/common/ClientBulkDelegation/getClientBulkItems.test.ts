import { describe, expect, it } from 'vitest';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Client } from '@/rtk/features/clientApi';

import { getClientBulkItems } from './getClientBulkItems';

const pkg = (id: string, isDelegable = true) =>
  ({ id, urn: `urn:${id}`, name: id, isDelegable }) as unknown as AccessPackage;

const resource = (refId: string, delegable = true) => ({
  id: refId,
  refId,
  details: { title: refId, delegable } as never,
});

const role = (code: string) => ({ id: code, code, name: code }) as never;

const client: Client = {
  client: { id: 'client-1', name: 'Dentapro AS' } as never,
  access: [
    {
      role: role('regnskapsforer'),
      packages: [pkg('lonn'), pkg('ikke-delegerbar', false), pkg('sykefravaer')],
      resources: [resource('sykemelding'), resource('stengt', false)],
    },
    {
      role: role('revisor'),
      packages: [pkg('lonn')],
    },
  ],
};

const lookup = (packages: AccessPackage[]) => (id?: string | null) =>
  packages.find((p) => p.id === id);
const getAccessPackageById = lookup(client.access.flatMap((a) => a.packages));

describe('getClientBulkItems', () => {
  it('splits delegable accesses into missing and held, once per access', () => {
    const { missing, held } = getClientBulkItems({
      client,
      accessStateClients: [
        {
          client: client.client,
          access: [{ role: role('regnskapsforer'), packages: [pkg('lonn')] }],
        },
      ],
      resourceAccessClients: [],
      getAccessPackageById,
    });

    expect(held).toEqual([{ kind: 'package', roleCode: 'regnskapsforer', id: 'urn:lonn' }]);
    expect(missing).toEqual([
      { kind: 'package', roleCode: 'regnskapsforer', id: 'urn:sykefravaer' },
      { kind: 'resource', roleCode: 'regnskapsforer', id: 'sykemelding' },
    ]);
  });

  it('revokes under the role the access is held with, not the one it is offered under', () => {
    const { held, missing } = getClientBulkItems({
      client,
      accessStateClients: [
        {
          client: client.client,
          access: [{ role: role('revisor'), packages: [pkg('lonn')] }],
        },
      ],
      resourceAccessClients: [],
      getAccessPackageById,
    });

    expect(held).toEqual([{ kind: 'package', roleCode: 'revisor', id: 'urn:lonn' }]);
    expect(missing).not.toContainEqual(expect.objectContaining({ id: 'urn:lonn' }));
  });

  it('yields one item per role when the same access is held under several roles', () => {
    const { held } = getClientBulkItems({
      client,
      accessStateClients: [
        {
          client: client.client,
          access: [
            { role: role('regnskapsforer'), packages: [pkg('lonn')] },
            { role: role('revisor'), packages: [pkg('lonn')] },
          ],
        },
      ],
      resourceAccessClients: [],
      getAccessPackageById,
    });

    expect(held).toEqual([
      { kind: 'package', roleCode: 'regnskapsforer', id: 'urn:lonn' },
      { kind: 'package', roleCode: 'revisor', id: 'urn:lonn' },
    ]);
  });

  it('ignores access held for another client', () => {
    const { held } = getClientBulkItems({
      client,
      accessStateClients: [
        {
          client: { id: 'client-2' } as never,
          access: [{ role: role('regnskapsforer'), packages: [pkg('lonn')] }],
        },
      ],
      resourceAccessClients: [],
      getAccessPackageById,
    });

    expect(held).toEqual([]);
  });
});
