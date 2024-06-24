import { test as baseTest } from '@playwright/test';
import { use } from 'chai';
import { loginWithUser, logoutWithUser } from 'playwright/pages/loginPage';
import { apiDelegation } from 'playwright/pages/profile/apidelegeringPage';
import {
  delegateRightsToUser,
  delegateToUser,
  revokeRights,
  coverebyUserRights,
  delegateRoleToUser,
} from 'playwright/pages/profile/delegationPage';

// Define the fixtures
const test = baseTest.extend<{
  login: loginWithUser;
  delegate: delegateToUser;
  delegateRights: delegateRightsToUser;
  deleteRights: revokeRights;
  logoutUser: logoutWithUser;
  coverebyRights: coverebyUserRights;
  delegateRoles: delegateRoleToUser;
  apiDelegations: apiDelegation;
}>({
  login: async ({ page }, use) => {
    await use(new loginWithUser(page));
  },
  delegate: async ({ page }, use) => {
    await use(new delegateToUser(page));
  },
  delegateRights: async ({ page }, use) => {
    await use(new delegateRightsToUser(page));
  },
  deleteRights: async ({ page }, use) => {
    await use(new revokeRights(page));
  },
  logoutUser: async ({ page }, use) => {
    await use(new logoutWithUser(page));
  },
  coverebyRights: async ({ page }, use) => {
    await use(new coverebyUserRights(page));
  },
  delegateRoles: async ({ page }, use) => {
    await use(new delegateRoleToUser(page));
  },

  apiDelegations: async ({ page }, use) => {
    await use(new apiDelegation(page));
  },
});

export { test };
