import { expect, test } from 'playwright/fixture/pomFixture';
import { Language } from 'playwright/pages/LanguageMenu';

import { TestdataApi } from 'playwright/util/TestdataApi';
import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';

// Runs in nynorsk on purpose: exercises the before-login language pinning
// (settings API) and proves the dict-driven selectors work in a non-default
// language. The rest of the suites run in the default bokmål.
test.use({ language: Language.NN });
const vendorOrgNumber = '310547891';
const testUserPid = '14824497789';
const testOrgName = 'Aktverdig Retorisk Ape';
const testUserName = 'Skravlete Blåveis';

test.describe('System Register', async () => {
  let system: string;

  test.beforeEach(async ({ page, login }) => {
    const api = new ApiRequests();
    system = await api.createSystemSystemRegister(vendorOrgNumber);
    await login.LoginToAccessManagement(testUserPid);
    await login.selectMainUnitBySearching(testOrgName);
  });

  test('Create system user and verify landing page', async ({
    systemUserPage,
    accessManagementFrontPage,
  }): Promise<void> => {
    await test.step('Navigate to system user page', async () => {
      await accessManagementFrontPage.systemUserMenuLink.click();
    });

    await test.step('Create system user', async () => {
      // this is assigned as a text in code base, will just add more confusion to import that than hardcoding this here
      await systemUserPage.createSystemUserLink.click();
      await systemUserPage.selectSystem(system);
    });

    await test.step('Verify system user created', async () => {
      await expect(systemUserPage.systemUserCreatedHeading).toBeVisible();
      await expect(systemUserPage.systemUserLink(system)).toBeVisible();
    });
  });

  test.afterEach(async () => {
    if (system) {
      await TestdataApi.removeSystem(vendorOrgNumber, system);
    }
  });
});
