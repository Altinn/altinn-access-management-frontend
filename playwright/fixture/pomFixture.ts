// pomFixtures.ts
import { test as baseTest, expect } from '@playwright/test';
import { ConsentPage, Language } from 'playwright/pages/consent/ConsentPage';
import { LoginPage, logoutWithUser } from 'playwright/pages/LoginPage';
import { AccessManagementFrontPage } from 'playwright/pages/AccessManagementFrontPage';
import { SidebarNav } from 'playwright/pages/SidebarNav';
import { SystemUserPage } from 'playwright/pages/systemuser/SystemUserPage';
import { SystemUserConfirmPage } from 'playwright/pages/systemuser/SystemUserConfirmPage';
import { DelegationPage } from 'playwright/pages/profile/accessPkgDelegationPage';
import { apiDelegation } from 'playwright/pages/profile/apidelegeringPage';
import { AktorvalgHeader } from 'playwright/pages/AktorvalgHeader';
import { ClientDelegationPage } from 'playwright/pages/systemuser/ClientDelegation';
import {
  delegateRightsToUser,
  delegateToUser,
  revokeRights,
  coverebyUserRights,
  delegateRoleToUser,
  instantiateResource,
} from 'playwright/pages/profile/delegationPage';
import { runAccessibilityTests } from 'playwright/uuTests/accessibilityHelpers/delegeringHelper';
import { KlientAdministrasjonPage } from 'playwright/pages/tilgangsstyring/KlientAdministrasjonPage';

const defaultLang = Language.NB;

type Fixtures = {
  slowNetwork: void;
  language: Language;

  login: LoginPage;
  accessManagementFrontPage: AccessManagementFrontPage;
  sidebarNav: SidebarNav;
  systemUserPage: SystemUserPage;
  systemUserConfirmPage: SystemUserConfirmPage;
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
  aktorvalgHeader: AktorvalgHeader;
  clientDelegationPage: ClientDelegationPage;
  klientAdministrasjonPage: KlientAdministrasjonPage;
};

const test = baseTest.extend<Fixtures>({
  // Simulate slow CI runner network: SLOW_NETWORK=1 yarn run env:TT02 <path>
  slowNetwork: [
    async ({ page }, use) => {
      if (process.env.SLOW_NETWORK) {
        const client = await page.context().newCDPSession(page);
        await client.send('Network.emulateNetworkConditions', {
          offline: false,
          downloadThroughput: (4 * 1024 * 1024) / 8,
          uploadThroughput: (2 * 1024 * 1024) / 8,
          latency: 50,
        });
      }
      await use();
    },
    { auto: true },
  ],

  // NEW: language fixture (default NB, overridable via test.use or project/use)
  language: [defaultLang, { option: true }],

  login: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  accessManagementFrontPage: async ({ page }, use) => {
    await use(new AccessManagementFrontPage(page));
  },
  sidebarNav: async ({ page }, use) => {
    await use(new SidebarNav(page));
  },
  systemUserPage: async ({ page }, use) => {
    await use(new SystemUserPage(page));
  },
  systemUserConfirmPage: async ({ page }, use) => {
    await use(new SystemUserConfirmPage(page));
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

  aktorvalgHeader: async ({ page }, use) => {
    await use(new AktorvalgHeader(page));
  },

  clientDelegationPage: async ({ page }, use) => {
    await use(new ClientDelegationPage(page));
  },

  klientAdministrasjonPage: async ({ page }, use) => {
    await use(new KlientAdministrasjonPage(page));
  },
});

export { test, expect };
