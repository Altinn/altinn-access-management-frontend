// pomFixtures.ts
import { test as baseTest, expect } from '@playwright/test';
import { ConsentPage, Language } from 'playwright/pages/consent/ConsentPage';
import { DICTIONARIES, type Dict } from 'playwright/pages/LanguageMenu';
import { LoginPage, logoutWithUser } from 'playwright/pages/LoginPage';
import { AccessManagementFrontPage } from 'playwright/pages/AccessManagementFrontPage';
import { SidebarNav } from 'playwright/pages/SidebarNav';
import { SystemUserPage } from 'playwright/pages/systemuser/SystemUserPage';
import { SystemUserConfirmPage } from 'playwright/pages/systemuser/SystemUserConfirmPage';
import { DelegationPage } from 'playwright/pages/profile/accessPackageDelegationPage';
import { AktorvalgHeader } from 'playwright/pages/AktorvalgHeader';
import { ClientDelegationPage } from 'playwright/pages/systemuser/ClientDelegation';
import { runAccessibilityTests } from 'playwright/uuTests/accessibilityHelpers/delegeringHelper';
import { KlientAdministrasjonPage } from 'playwright/pages/tilgangsstyring/KlientAdministrasjonPage';

const defaultLang = Language.NB;

type Fixtures = {
  slowNetwork: void;
  language: Language;
  // Frontend localization dictionary for the current language — page objects
  // read text selectors from this so they match whatever language the app was
  // switched to.
  dict: Dict;

  login: LoginPage;
  accessManagementFrontPage: AccessManagementFrontPage;
  sidebarNav: SidebarNav;
  systemUserPage: SystemUserPage;
  systemUserConfirmPage: SystemUserConfirmPage;
  logoutUser: logoutWithUser;
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

  // Derived from `language`: the localization dictionary page objects read from.
  dict: async ({ language }, use) => {
    await use(DICTIONARIES[language]);
  },

  login: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  accessManagementFrontPage: async ({ page, dict }, use) => {
    await use(new AccessManagementFrontPage(page, dict));
  },
  sidebarNav: async ({ page, dict }, use) => {
    await use(new SidebarNav(page, dict));
  },
  systemUserPage: async ({ page }, use) => {
    await use(new SystemUserPage(page));
  },
  systemUserConfirmPage: async ({ page }, use) => {
    await use(new SystemUserConfirmPage(page));
  },
  logoutUser: async ({ page }, use) => {
    await use(new logoutWithUser(page));
  },
  runAccessibilityTest: async ({ page }, use) => {
    await use(new runAccessibilityTests(page));
  },
  delegation: async ({ page, dict }, use) => {
    await use(new DelegationPage(page, dict));
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
