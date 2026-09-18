/* eslint-disable no-console */
import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { env, loadEnv } from 'playwright/util/helper';
import { SystemUserCleanup, type SystemUserKind } from './SystemUserCleanup';
import {
  cleanupOwners,
  isOldTestUser,
  matchingPlannedUsers,
  validatePlan,
  type CleanupOwner,
  type CleanupPlan,
} from './legacyCleanup';

async function main() {
  const { values } = parseArgs({
    options: {
      env: { type: 'string' },
      owner: { type: 'string' },
      kind: { type: 'string', default: 'standard' },
      plan: { type: 'string' },
      apply: { type: 'string' },
    },
  });
  if (Boolean(values.plan) === Boolean(values.apply)) {
    throw new Error(
      'Use --env at23|tt02 --owner <owner> --plan <file>, or --apply <reviewed-plan.json>.',
    );
  }
  let plan: CleanupPlan;
  if (values.apply) {
    if (values.env || values.owner)
      throw new Error('--apply uses the environment and owner in the plan.');
    const parsed: unknown = JSON.parse(readFileSync(values.apply, 'utf8'));
    validatePlan(parsed);
    plan = parsed;
  } else {
    plan = {
      environment: values.env as CleanupPlan['environment'],
      owner: values.owner as CleanupOwner,
      kind: values.kind as SystemUserKind,
      users: [],
    };
    validatePlan(plan);
  }
  loadEnv(plan.environment);
  // Check the loaded target too: local .env files can override the requested environment.
  if (
    env('ENV_NAME').toLowerCase() !== plan.environment ||
    new URL(env('API_BASE_URL')).hostname !==
      `platform.${plan.environment}.altinn.${plan.environment === 'tt02' ? 'no' : 'cloud'}`
  ) {
    throw new Error('Loaded environment does not match the cleanup plan.');
  }
  const cleanup = new SystemUserCleanup();
  const owner = cleanupOwners[plan.owner];
  const users = await cleanup.list(owner, plan.kind);
  if (values.plan) {
    plan.users = users.filter((user) => isOldTestUser(user));
    writeFileSync(values.plan, JSON.stringify(plan, null, 2), { flag: 'wx' });
    console.log(
      `${plan.users.length} candidates written to ${values.plan}; ${users.length - plan.users.length} users excluded. Nothing deleted.`,
    );
    return;
  }
  const selected = matchingPlannedUsers(plan, users);
  const errors: unknown[] = [];
  for (const user of selected) {
    try {
      await cleanup.remove(owner, plan.kind, user.id);
      console.log(`Deleted ${user.id}`);
    } catch (error) {
      errors.push(error);
      console.error(error);
    }
  }
  if (errors.length)
    throw new AggregateError(
      errors,
      'Some system users could not be deleted; reapply the plan to retry.',
    );
  console.log(`Deleted ${selected.length} system users from ${plan.owner} in ${plan.environment}.`);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
