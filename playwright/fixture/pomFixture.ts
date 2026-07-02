// pomFixtures.ts
import { test as baseTest, expect } from '@playwright/test';
import { ConsentPage, Language } from 'playwright/pages/consent/ConsentPage';
import { LanguageMenu } from 'playwright/pages/LanguageMenu';
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
  // The app language for the run (default NB). Page objects take this and read
  // their text selectors from the matching localization dictionary.
  language: Language;

  login: LoginPage;
  accessManagementFrontPage: AccessManagementFrontPage;
  sidebarNav: SidebarNav;
  languageMenu: LanguageMenu;
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

  login: async ({ page, language }, use) => {
    await use(new LoginPage(page, language));
  },
  accessManagementFrontPage: async ({ page, language }, use) => {
    await use(new AccessManagementFrontPage(page, language));
  },
  sidebarNav: async ({ page, language }, use) => {
    await use(new SidebarNav(page, language));
  },
  languageMenu: async ({ page }, use) => {
    await use(new LanguageMenu(page));
  },
  systemUserPage: async ({ page, language }, use) => {
    await use(new SystemUserPage(page, language));
  },
  systemUserConfirmPage: async ({ page, language }, use) => {
    await use(new SystemUserConfirmPage(page, language));
  },
  logoutUser: async ({ page }, use) => {
    await use(new logoutWithUser(page));
  },
  runAccessibilityTest: async ({ page }, use) => {
    await use(new runAccessibilityTests(page));
  },
  delegation: async ({ page, language }, use) => {
    await use(new DelegationPage(page, language));
  },

  consentPage: async ({ page, language }, use) => {
    await use(new ConsentPage(page, language));
  },

  aktorvalgHeader: async ({ page }, use) => {
    await use(new AktorvalgHeader(page));
  },

  clientDelegationPage: async ({ page, language }, use) => {
    await use(new ClientDelegationPage(page, language));
  },

  klientAdministrasjonPage: async ({ page, language }, use) => {
    await use(new KlientAdministrasjonPage(page, language));
  },
});

export { test, expect };
