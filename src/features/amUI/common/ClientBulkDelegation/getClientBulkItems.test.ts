import { describe, expect, it } from 'vitest';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Agent, Client, ClientAccess } from '@/rtk/features/clientApi';

import { getClientBulkItems, indexHeldAccess } from './getClientBulkItems';

const pkg = (id: string, isDelegable = true) =>
  ({ id, urn: `urn:${id}`, name: id, isDelegable }) as unknown as AccessPackage;

const resource = (refId: string, delegable = true) => ({
  id: refId,
  refId,
  details: { title: refId, delegable } as never,
});

const access = (
  roleCode: string,
  packages: AccessPackage[],
  resources: ClientAccess['resources'] = [],
): ClientAccess => ({
  role: { id: roleCode, code: roleCode, name: roleCode } as never,
  packages,
  resources,
});

const offered: ClientAccess[] = [
  access(
    'regnskapsforer',
    [pkg('lonn'), pkg('ikke-delegerbar', false), pkg('sykefravaer')],
    [resource('sykemelding'), resource('stengt', false)],
  ),
  access('revisor', [pkg('lonn')]),
];

const getAccessPackageById = (id?: string | null) =>
  offered.flatMap((a) => a.packages).find((p) => p.id === id);

describe('getClientBulkItems', () => {
  it('splits delegable accesses into missing and held, once per access', () => {
    const { missing, held } = getClientBulkItems({
      offered,
      heldPackages: [access('revisor', [pkg('lonn')])],
      heldResources: [],
      getAccessPackageById,
    });

    expect(held).toEqual([{ kind: 'package', roleCode: 'revisor', id: 'urn:lonn' }]);
    expect(missing).toEqual([
      { kind: 'package', roleCode: 'regnskapsforer', id: 'urn:sykefravaer' },
      { kind: 'resource', roleCode: 'regnskapsforer', id: 'sykemelding' },
    ]);
  });

  it('revokes through every role the access is held under', () => {
    const { held } = getClientBulkItems({
      offered,
      heldPackages: [access('regnskapsforer', [pkg('lonn')]), access('revisor', [pkg('lonn')])],
      heldResources: [access('revisor', [], [resource('sykemelding')])],
      getAccessPackageById,
    });

    expect(held).toEqual([
      { kind: 'package', roleCode: 'regnskapsforer', id: 'urn:lonn' },
      { kind: 'package', roleCode: 'revisor', id: 'urn:lonn' },
      { kind: 'resource', roleCode: 'revisor', id: 'sykemelding' },
    ]);
  });

  it('skips packages the lookup does not know', () => {
    const { missing } = getClientBulkItems({
      offered,
      heldPackages: [],
      heldResources: [],
      getAccessPackageById: () => undefined,
    });

    expect(missing).toEqual([{ kind: 'resource', roleCode: 'regnskapsforer', id: 'sykemelding' }]);
  });
});

describe('indexHeldAccess', () => {
  const entity = (id: string) => ({ id, name: id }) as never;

  it('groups held access by client on the agent page', () => {
    const clients: Client[] = [
      { client: entity('client-1'), access: [access('regnskapsforer', [pkg('lonn')])] },
      { client: entity('client-2'), access: [access('revisor', [pkg('lonn')])] },
    ];

    const byClient = indexHeldAccess(clients, (held) => held.client.id);

    expect(byClient.get('client-1')).toEqual(clients[0].access);
    expect(byClient.get('client-2')).toEqual(clients[1].access);
    expect(byClient.get('client-3')).toBeUndefined();
  });

  it('groups held access by agent on the client page, merging repeated agents', () => {
    const agents = [
      { agent: entity('agent-1'), access: [access('regnskapsforer', [pkg('lonn')])] },
      { agent: entity('agent-1'), access: [access('revisor', [pkg('lonn')])] },
    ] as Agent[];

    const byAgent = indexHeldAccess(agents, (held) => held.agent.id);

    expect(byAgent.get('agent-1')).toEqual([...agents[0].access, ...agents[1].access]);
  });
});
