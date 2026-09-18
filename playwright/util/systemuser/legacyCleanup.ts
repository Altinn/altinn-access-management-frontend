import { systemUserOwners } from 'playwright/e2eTests/altinn3/systemuser/testdata';
import type { StoredSystemUser, SystemUserKind } from './SystemUserCleanup';

// Explicit owners: cleanup must never sweep arbitrary organisations.
export const cleanupOwners = {
  legacyCreation: { orgNo: '310547891', pid: '14824497789' },
  legacyDeletion: { orgNo: '310736007', pid: '13832749995' },
  ownOrg: { orgNo: '314240545', pid: '02858098613' },
  revisor: { orgNo: '314251768', pid: '07875898560' },
  regnskapsfoerer: { orgNo: '312433834', pid: '25872549881' },
  forretningsfoerer: { orgNo: '312158019', pid: '12826697375' },
  eskaler: { orgNo: '313084167', pid: '29849098304' },
  ...systemUserOwners,
} as const;
export type CleanupOwner = keyof typeof cleanupOwners;
export interface CleanupPlan {
  environment: 'at23' | 'tt02';
  owner: CleanupOwner;
  kind: SystemUserKind;
  users: StoredSystemUser[];
}

/** Shared prebuilt systems and unrecognised/manual data are deliberately ineligible. */
export function isOldTestUser(user: StoredSystemUser, now = Date.now()): boolean {
  const legacyUi = /^(310547891|310736007)_E2E\d{7}$/;
  const testSystem =
    /^(310547891|310736007|312591332)_Playwright-e2e-(creation|deletion|requests|changes|own-org|revisor|regnskapsfoerer|forretningsfoerer|eskaler|jordbruk|motorvognavgift|pensjon)-\d{13}(?:-[a-f0-9]{8})?$/;
  const created = Date.parse(user.created);
  return (
    typeof user.id === 'string' &&
    user.id.length > 0 &&
    (legacyUi.test(user.systemId) || testSystem.test(user.systemId)) &&
    Number.isFinite(created) &&
    created < now - 24 * 60 * 60 * 1000
  );
}

export function validatePlan(value: unknown): asserts value is CleanupPlan {
  const plan = value as CleanupPlan;
  if (
    !plan ||
    !['at23', 'tt02'].includes(plan.environment) ||
    !Object.hasOwn(cleanupOwners, plan.owner) ||
    !['standard', 'agent'].includes(plan.kind) ||
    !Array.isArray(plan.users) ||
    plan.users.some((user) => !user || !isOldTestUser(user)) ||
    new Set(plan.users.map((user) => user.id)).size !== plan.users.length
  ) {
    throw new Error('Invalid cleanup plan; no users deleted.');
  }
}

/** Revalidate against the server: editing a plan cannot redirect a deletion to another user. */
export function matchingPlannedUsers(plan: CleanupPlan, current: StoredSystemUser[]) {
  validatePlan(plan);
  return plan.users.flatMap((planned) => {
    const actual = current.find((user) => user.id === planned.id);
    if (!actual) return []; // Already removed: applying a plan again is harmless.
    if (
      actual.systemId !== planned.systemId ||
      actual.created !== planned.created ||
      !isOldTestUser(actual)
    ) {
      throw new Error(`System user ${planned.id} no longer matches the cleanup plan.`);
    }
    return [actual];
  });
}
