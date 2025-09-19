import { request } from '@playwright/test';
import { DelegationApiRequest } from 'playwright/api-requests/delegation-tilgangspakke/delegationApiRequest';

export class DelegationApiUtil {
  /**
   * Delete all delegations for the test user
   */
  public static async cleanupDelegations() {
    const apiContext = await request.newContext();

    try {
      const api = new DelegationApiRequest();
      await api.deleteAllDelegations();
    } finally {
      await apiContext.dispose();
    }
  }
}
