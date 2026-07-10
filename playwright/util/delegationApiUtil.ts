import { request } from '@playwright/test';
import { Token } from '../api-requests/Token';
import { DelegationApiRequest } from 'playwright/api-requests/delegation-tilgangspakke/delegationApiRequest';
import { getTestPersonForCategory } from './testDelegationdatautil';
import { CleanupResolved, getCleanupDataForTest } from 'playwright/util/cleanup-delegationutils';

async function getDagligLederForCategory(category: string) {
  for (const prefix of ['Dagligleder', 'Dagligerleder']) {
    try {
      return await getTestPersonForCategory(`${prefix}-${category}`);
    } catch {}
  }
  throw new Error(`No daglig leder found for category "${category}" in test-person.csv`);
}

export class DelegationApiUtil {
  static async addOrgToDelegate(fromCategory: string, toCategory: string) {
    const apiContext = await request.newContext();
    const token = new Token();
    const api = new DelegationApiRequest(apiContext, token);

    const fromPerson = await getTestPersonForCategory(fromCategory);
    const toPerson = await getTestPersonForCategory(toCategory);
    const authPerson = await getDagligLederForCategory(fromCategory);

    await api.addOrgForDelegation(fromPerson, toPerson, authPerson);
    await apiContext.dispose();
  }

  static async delegateAccessPackage(fromCategory: string, toCategory: string, packages: string[]) {
    const apiContext = await request.newContext();
    const token = new Token();
    const api = new DelegationApiRequest(apiContext, token);

    const fromPerson = await getTestPersonForCategory(fromCategory);
    const toPerson = await getTestPersonForCategory(toCategory);
    const authPerson = await getDagligLederForCategory(fromCategory);

    for (const pkg of packages) {
      await api.delegateAccessPkg(fromPerson, toPerson, pkg, authPerson);
    }
    await apiContext.dispose();
  }

  static async cleanupAllDelegations(testTitle?: string) {
    const title = (testTitle ?? '').trim();
    if (!title) return;

    const apiContext = await request.newContext({ timeout: 10_000 });

    try {
      const tokenClass = new Token();
      const api = new DelegationApiRequest(apiContext, tokenClass);

      const items: CleanupResolved[] = await getCleanupDataForTest(title);

      if (!items.length) {
        console.warn(`[cleanupAllDelegations] No cleanup pairs for title="${title}"`);
        return;
      }

      for (const { fromOrg, toOrg, authPerson } of items) {
        await api.cleanupDelegations(fromOrg, toOrg, authPerson);
      }
    } finally {
      await apiContext.dispose();
    }
  }
}
