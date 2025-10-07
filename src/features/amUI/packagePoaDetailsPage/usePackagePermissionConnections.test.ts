import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

import { usePackagePermissionConnections } from './usePackagePermissionConnections';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';

// Minimal AccessPackage shape for the tests (augment if underlying type changes)
const basePkg: Partial<AccessPackage> = {
  id: 'pkg-1',
  urn: 'urn:altinn:accesspackage:test',
  name: 'Test Package',
  isAssignable: true,
  description: 'Test',
  resources: [],
};

const org = (id: string, name: string) => ({
  id,
  name,
  type: 'Organisasjon',
  variant: 'AS',
  parent: null,
  children: null,
  keyValues: null,
});
const person = (id: string, name: string) => ({
  id,
  name,
  type: 'Person',
  variant: 'Person',
  parent: null,
  children: null,
  keyValues: null,
});
const role = (id: string, code: string) => ({ id, code, children: null });

/**
 * Helper to run the hook with given permissions.
 */
const run = (permissions: any[]) => {
  const pkg = { ...basePkg, permissions } as AccessPackage;
  const { result } = renderHook(() => usePackagePermissionConnections(pkg));
  return result.current;
};

describe('usePackagePermissionConnections', () => {
  it('returns empty array when no permissions', () => {
    const res = run([]);
    expect(res).toEqual([]);
  });

  it("does NOT mark party with only 'rettighetshaver' role as inherited", () => {
    const target = org('org1', 'Org 1');
    const permissions = [
      {
        from: org('src', 'Src'),
        to: target,
        via: null,
        role: role('r1', 'rettighetshaver'),
        viaRole: null,
      },
    ];
    const res = run(permissions);
    expect(res).toHaveLength(1);
    expect(res[0].party.id).toBe('org1');
    expect(res[0].party.isInherited).toBe(false); // excluded role should not set inherited
    expect(res[0].roles.map((r) => r.code)).toEqual(['rettighetshaver']);
  });

  it('marks party as inherited when it has a non-excluded direct role', () => {
    const target = org('org2', 'Org 2');
    const permissions = [
      {
        from: org('src', 'Src'),
        to: target,
        via: null,
        role: role('r2', 'styreleder'),
        viaRole: null,
      },
    ];
    const res = run(permissions);
    expect(res[0].party.isInherited).toBe(true);
  });

  it('marks child party as inherited when it has a non-excluded viaRole', () => {
    const parent = org('parent1', 'Parent');
    const child = person('person1', 'Person 1');
    const permissions = [
      {
        from: org('src', 'Src'),
        to: child,
        via: parent,
        role: role('ret1', 'rettighetshaver'),
        viaRole: role('vr1', 'daglig-leder'),
      },
    ];
    const res = run(permissions);
    // parent root connection
    const parentConn = res.find((c) => c.party.id === 'parent1');
    expect(parentConn).toBeTruthy();
    // child connection under parent
    const childConn = parentConn!.connections.find((c) => c.party.id === 'person1');
    expect(childConn).toBeTruthy();
    expect(childConn!.party.isInherited).toBe(true); // because of viaRole daglig-leder
    expect(parentConn!.party.isInherited).toBe(false); // parent received no non-excluded role itself
  });

  it('does not duplicate roles and still respects exclusion', () => {
    const target = org('org3', 'Org 3');
    const permissions = [
      {
        from: org('src', 'Src'),
        to: target,
        via: null,
        role: role('r1', 'rettighetshaver'),
        viaRole: null,
      },
      {
        from: org('src', 'Src'),
        to: target,
        via: null,
        role: role('r1', 'rettighetshaver'),
        viaRole: null,
      }, // duplicate
    ];
    const res = run(permissions);
    expect(res[0].roles).toHaveLength(1);
    expect(res[0].party.isInherited).toBe(false);
  });

  it('mixed roles: excluded + non-excluded => inherited = true', () => {
    const target = org('org4', 'Org 4');
    const permissions = [
      {
        from: org('src', 'Src'),
        to: target,
        via: null,
        role: role('r1', 'rettighetshaver'),
        viaRole: null,
      },
      {
        from: org('src', 'Src'),
        to: target,
        via: null,
        role: role('r2', 'daglig-leder'),
        viaRole: null,
      },
    ];
    const res = run(permissions);
    expect(res[0].party.isInherited).toBe(true);
    expect(res[0].roles.map((r) => r.code).sort()).toEqual(
      ['daglig-leder', 'rettighetshaver'].sort(),
    );
  });

  it('non-excluded role only via inheritance path (viaRole) sets inherited true', () => {
    const parent = org('org5', 'Parent 5');
    const child = person('person5', 'Person 5');
    const permissions = [
      {
        from: org('src', 'Src'),
        to: child,
        via: parent,
        role: role('r1', 'rettighetshaver'),
        viaRole: role('v1', 'styreleder'),
      },
    ];
    const res = run(permissions);
    const parentConn = res.find((c) => c.party.id === 'org5');
    const childConn = parentConn!.connections.find((c) => c.party.id === 'person5');
    expect(childConn!.party.isInherited).toBe(true);
    expect(parentConn!.party.isInherited).toBe(false);
  });
});
