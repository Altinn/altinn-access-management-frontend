import { describe, expect, test } from 'vitest';

import type { Assignment } from '@/rtk/features/roleApi';

import { filterDigdirAssignments, filterDigdirRole } from './roleUtils';

describe('roleUtils', () => {
  test('filterDigdirAssignments', () => {
    const assignments = [
      {
        role: {
          urn: 'digdir:role1',
        },
      },
      {
        role: {
          urn: 'digdir:role2',
        },
      },
      {
        role: {
          urn: 'role3',
        },
      },
    ] as Assignment[];
    const result = filterDigdirAssignments(assignments);
    expect(result.length).toBe(2);
    expect(result[0].role.urn).toBe('digdir:role1');
    expect(result[1].role.urn).toBe('digdir:role2');
  });
  test('filterDigdirAssignments', () => {
    const assignments = [
      {
        role: {
          urn: 'role1',
        },
      },
      {
        role: {
          urn: 'role2',
        },
      },
      {
        role: {},
      },
    ] as Assignment[];
    const result = filterDigdirAssignments(assignments);
    expect(result.length).toBe(0);
  });

  test('filterDigdirRole', () => {
    const roleUrns = ['digdir:role1', 'role2', 'digdir:role3'];
    const result = filterDigdirRole(roleUrns);
    expect(result.length).toBe(2);
    expect(result[0]).toBe('digdir:role1');
    expect(result[1]).toBe('digdir:role3');
  });

  test('filterDigdirRole', () => {
    const roleUrns = ['role1', 'role2', null] as string[];
    const result = filterDigdirRole(roleUrns);
    expect(result.length).toBe(0);
  });
});
