import { test as baseTest } from '@playwright/test';

import { LoginPage, logoutWithUser } from '../pages/LoginPage';
import { DelegationPage } from '../pages/profile/accessPkgDelegationPage';
import { apiDelegation } from '../pages/profile/apidelegeringPage';
import {
  delegateRightsToUser,
  delegateToUser,
  revokeRights,
  coverebyUserRights,
  delegateRoleToUser,
  instantiateResource,
} from '../pages/profile/delegationPage';

// Define the fixtures
const test = baseTest.extend<{
  login: LoginPage;
  delegate: delegateToUser;
  delegateRights: delegateRightsToUser;
  deleteRights: revokeRights;
  logoutUser: logoutWithUser;
  coverebyRights: coverebyUserRights;
  delegateRoles: delegateRoleToUser;
  apiDelegations: apiDelegation;
  instantiateResources: instantiateResource;
  delegation: DelegationPage;
}>({
  login: async ({ page }, use) => {
    await use(new LoginPage(page));
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
  instantiateResources: async ({ page }, use) => {
    await use(new instantiateResource(page));
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

  delegation: async ({ page }, use) => {
    await use(new DelegationPage(page));
  },
});

export { test };
