import { describe, expect, it } from 'vitest';

import { mapPermissionsToUserSearchNodes } from './permissionMapper';

const org = (id: string, name: string) => ({
  id,
  name,
  type: 'Organisasjon',
  variant: 'AS',
  organizationIdentifier: '123456789',
  partyId: `pid-${id}`,
  dateOfBirth: '1990-01-01',
  parent: null,
  children: null,
});

const person = (id: string, name: string) => ({
  id,
  name,
  type: 'Person',
  variant: 'Person',
  organizationIdentifier: '123456789',
  partyId: `pid-${id}`,
  dateOfBirth: '1990-01-01',
  parent: null,
  children: null,
});

const role = (id: string, code: string) => ({ id, code, children: null });

const run = (permissions: any[], partyContext?: { fromPartyUuid?: string; toPartyUuid?: string }) =>
  mapPermissionsToUserSearchNodes(permissions, {
    fromPartyUuid: partyContext?.fromPartyUuid ?? '123',
    toPartyUuid: partyContext?.toPartyUuid ?? '456',
  });

describe('mapPermissionsToUserSearchNodes', () => {
  it('returns empty array when no permissions', () => {
    const res = run([]);
    expect(res).toEqual([]);
  });

  it("does NOT mark party with only 'rettighetshaver' role as inherited", () => {
    const target = org('456', 'Org 1');
    const permissions = [
      {
        from: org('123', '123'),
        to: target,
        via: null,
        role: role('r1', 'rettighetshaver'),
        viaRole: null,
      },
    ];

    const res = run(permissions);

    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('456');
    expect(res[0].isInherited).toBe(false);
    expect(res[0].roles.map((r) => r.code)).toEqual(['rettighetshaver']);
  });

  it('does NOT mark party as inherited when only the selected from-party differs', () => {
    const target = org('456', 'Org 1');
    const permissions = [
      {
        from: org('123', '123'),
        to: target,
        via: null,
        role: role('r1b', 'rettighetshaver'),
        viaRole: null,
      },
    ];

    const res = run(permissions, { fromPartyUuid: 'diff' });

    expect(res[0].isInherited).toBe(false);
  });

  it('does NOT mark party as inherited when only the selected to-party differs', () => {
    const target = org('456', 'Org 1');
    const permissions = [
      {
        from: org('123', '123'),
        to: target,
        via: null,
        role: role('r1c', 'rettighetshaver'),
        viaRole: null,
      },
    ];

    const res = run(permissions, { toPartyUuid: 'diff' });

    expect(res[0].isInherited).toBe(false);
  });

  it('marks party as inherited when it has a non-excluded direct role', () => {
    const target = org('org2', 'Org 2');
    const permissions = [
      {
        from: org('123', '123'),
        to: target,
        via: null,
        role: role('r2', 'styreleder'),
        viaRole: null,
      },
    ];

    const res = run(permissions);

    expect(res[0].isInherited).toBe(true);
  });

  it('marks permission as inherited when both selected parties differ', () => {
    const target = org('456', 'Org 2B');
    const permissions = [
      {
        from: org('123', '123'),
        to: target,
        via: null,
        role: role('r2b', 'rettighetshaver'),
        viaRole: null,
      },
    ];

    const res = run(permissions, { fromPartyUuid: 'other', toPartyUuid: 'else' });

    expect(res[0].isInherited).toBe(true);
  });

  it('marks child party as inherited when it has a non-excluded viaRole', () => {
    const parent = org('parent1', 'Parent');
    const child = person('person1', 'Person 1');
    const permissions = [
      {
        from: org('123', '123'),
        to: child,
        via: parent,
        role: role('ret1', 'rettighetshaver'),
        viaRole: role('vr1', 'daglig-leder'),
      },
    ];

    const res = run(permissions);
    const parentConn = res.find((c) => c.id === 'parent1');
    const childConn = parentConn?.children?.find((c) => c.id === 'person1');

    expect(parentConn).toBeTruthy();
    expect(childConn).toBeTruthy();
    expect(childConn?.isInherited).toBe(true);
    expect(parentConn?.isInherited).toBe(false);
  });

  it('does not duplicate roles and still respects exclusion', () => {
    const target = org('org3', 'Org 3');
    const permissions = [
      {
        from: org('123', '123'),
        to: target,
        via: null,
        role: role('r1', 'rettighetshaver'),
        viaRole: null,
      },
      {
        from: org('123', '123'),
        to: target,
        via: null,
        role: role('r1', 'rettighetshaver'),
        viaRole: null,
      },
    ];

    const res = run(permissions);

    expect(res[0].roles).toHaveLength(1);
    expect(res[0].isInherited).toBe(false);
  });

  it('mixed roles: excluded + non-excluded => inherited = true', () => {
    const target = org('org4', 'Org 4');
    const permissions = [
      {
        from: org('123', '123'),
        to: target,
        via: null,
        role: role('r1', 'rettighetshaver'),
        viaRole: null,
      },
      {
        from: org('123', '123'),
        to: target,
        via: null,
        role: role('r2', 'daglig-leder'),
        viaRole: null,
      },
    ];

    const res = run(permissions);

    expect(res[0].isInherited).toBe(true);
    expect(res[0].roles.map((r) => r.code).sort()).toEqual(
      ['daglig-leder', 'rettighetshaver'].sort(),
    );
  });

  it('non-excluded role only via inheritance path (viaRole) sets inherited true', () => {
    const parent = org('org5', 'Parent 5');
    const child = person('person5', 'Person 5');
    const permissions = [
      {
        from: org('123', '123'),
        to: child,
        via: parent,
        role: role('r1', 'rettighetshaver'),
        viaRole: role('v1', 'styreleder'),
      },
    ];

    const res = run(permissions);
    const parentConn = res.find((c) => c.id === 'org5');
    const childConn = parentConn?.children?.find((c) => c.id === 'person5');

    expect(childConn?.isInherited).toBe(true);
    expect(parentConn?.isInherited).toBe(false);
  });
});
