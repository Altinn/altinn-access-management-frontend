// pomFixtures.ts
import { test as baseTest, expect } from '@playwright/test';
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

const defaultLang = Language.NB;

type Fixtures = {
  // NEW: make language an overridable option
  language: Language;

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
};

const test = baseTest.extend<Fixtures>({
  // NEW: language fixture (default NB, overridable via test.use or project/use)
  language: [defaultLang, { option: true }],

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

  // UPDATED: inject language into ConsentPage constructor
  consentPage: async ({ page, language }, use) => {
    await use(new ConsentPage(page, language));
  },
});

export { test, expect };
