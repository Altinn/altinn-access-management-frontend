import { describe, expect, it } from 'vitest';
import {
  isOldTestUser,
  matchingPlannedUsers,
  validatePlan,
  type CleanupPlan,
} from './legacyCleanup';
const user = {
  id: 'old-test-user',
  systemId: '310547891_E2E1234567',
  created: '2025-01-01T00:00:00Z',
};
const plan: CleanupPlan = {
  environment: 'at23',
  owner: 'legacyCreation',
  kind: 'standard',
  users: [user],
};
describe('legacy cleanup boundaries', () => {
  it('recognises old test data, but excludes shared systems, manual data and recent users', () => {
    expect(isOldTestUser(user)).toBe(true);
    for (const systemId of [
      '310547891_E2E-Playwright-Authentication',
      '310547891_ManualSystem',
      '999999999_E2E1234567',
    ])
      expect(isOldTestUser({ ...user, systemId })).toBe(false);
    expect(isOldTestUser({ ...user, created: new Date().toISOString() })).toBe(false);
    expect(isOldTestUser({ ...user, created: 'invalid' })).toBe(false);
  });
  it('recognises new unique test names left by interrupted runs', () => {
    expect(
      isOldTestUser({
        ...user,
        systemId: '310547891_Playwright-e2e-creation-1750000000000-abcdef12',
      }),
    ).toBe(true);
  });
  it.each([
    { environment: 'prod' },
    { owner: 'arbitrary' },
    { owner: 'toString' },
    { kind: 'other' },
    { users: [user, user] },
  ])('rejects invalid plan %j', (overrides) => {
    expect(() => validatePlan({ ...plan, ...overrides })).toThrow();
  });
  it('deletes only planned users and tolerates already deleted users', () => {
    expect(matchingPlannedUsers(plan, [user, { ...user, id: 'unplanned' }])).toEqual([user]);
    expect(matchingPlannedUsers(plan, [])).toEqual([]);
  });
  it.each([{ systemId: '310547891_ManualSystem' }, { created: '2025-02-01T00:00:00Z' }])(
    'rechecks identity against server state %j',
    (overrides) => {
      expect(() => matchingPlannedUsers(plan, [{ ...user, ...overrides }])).toThrow();
    },
  );
});
