import { DelegationApiRequest } from 'playwright/api-requests/delegation-tilgangspakke/delegationApiRequest';
import {
  type CleanupResolved,
  getCleanupDataForTest,
} from 'playwright/util/cleanup-delegationutils';

import { getTestPersonForCategory } from './testDelegationdatautil';

async function getDagligLederForCategory(category: string) {
  for (const prefix of ['Dagligleder', 'Dagligerleder']) {
    try {
      return await getTestPersonForCategory(`${prefix}-${category}`);
    } catch {
      /* try next prefix */
    }
  }
  throw new Error(`No daglig leder found for category "${category}" in test-person.csv`);
}

export class DelegationApiUtil {
  static async addOrgToDelegate(fromCategory: string, toCategory: string) {
    const api = new DelegationApiRequest();

    const fromPerson = await getTestPersonForCategory(fromCategory);
    const toPerson = await getTestPersonForCategory(toCategory);
    const authPerson = await getDagligLederForCategory(fromCategory);

    await api.addOrgForDelegation(fromPerson, toPerson, authPerson);
  }

  static async delegateAccessPackage(fromCategory: string, toCategory: string, packages: string[]) {
    const api = new DelegationApiRequest();

    const fromPerson = await getTestPersonForCategory(fromCategory);
    const toPerson = await getTestPersonForCategory(toCategory);
    const authPerson = await getDagligLederForCategory(fromCategory);

    for (const pkg of packages) {
      await api.delegateAccessPkg(fromPerson, toPerson, pkg, authPerson);
    }
  }

  static async cleanupAllDelegations(testTitle?: string) {
    const title = (testTitle ?? '').trim();
    if (!title) return;

    const api = new DelegationApiRequest();
    const items: CleanupResolved[] = await getCleanupDataForTest(title);

    if (!items.length) {
      console.warn(`[cleanupAllDelegations] No cleanup pairs for title="${title}"`);
      return;
    }

    for (const { fromOrg, toOrg, authPerson } of items) {
      await api.cleanupDelegations(fromOrg, toOrg, authPerson);
    }
  }
}
