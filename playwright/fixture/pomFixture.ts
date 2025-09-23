import { test as baseTest } from '@playwright/test';
import { ConsentPage, Language } from 'playwright/pages/consent/ConsentPage';
import { LoginPage, logoutWithUser } from 'playwright/pages/LoginPage';
import { DelegationPage } from 'playwright/pages/profile/accessPkgDelegationPage';
import { apiDelegation } from 'playwright/pages/profile/apidelegeringPage';
import {
  delegateRightsToUser,
  delegateToUser,
  revokeRights,
  coverebyUserRights,
  delegateRoleToUser,
  instantiateResource,
} from 'playwright/pages/profile/delegationPage';
import { runAccessibilityTests } from 'playwright/uuTests/accessibilityHelpers/delegeringHelper';
import * as util from 'playwright/helpers/util';

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
  runAccessibilityTest: runAccessibilityTests;
  delegation: DelegationPage;
  consentPage: ConsentPage;
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

  runAccessibilityTest: async ({ page }, use) => {
    await use(new runAccessibilityTests(page));
  },
  delegation: async ({ page }, use) => {
    await use(new DelegationPage(page));
  },
  consentPage: async ({ page }, use) => {
    await use(new ConsentPage(page, Language.NB));
  },
});

export { test };
