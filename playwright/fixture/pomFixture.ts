import { test as baseTest } from '@playwright/test';
import { use } from 'chai';
import { loginWithUser, logoutWithUser } from 'playwright/pages/loginPage';
import {
  delegateRightsToUser,
  delegateToUser,
  revokeRights,
  coverebyUserRights,
} from 'playwright/pages/profile/delegationPage';

// Define the fixtures
const test = baseTest.extend<{
  login: loginWithUser;
  delegate: delegateToUser;
  delegateRights: delegateRightsToUser;
  deleteRights: revokeRights;
  logoutUser: logoutWithUser;
  coverebyRights: coverebyUserRights;
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
});

export { test };
