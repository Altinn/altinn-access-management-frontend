import { expect, test } from 'playwright/fixture/pomFixture';

import { TestdataApi } from 'playwright/util/TestdataApi';
import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
import { env } from 'playwright/util/helper';
const vendorOrgNumber = '310547891';
const testUserPid = '14824497789';
const testOrgName = 'Aktverdig Retorisk Ape';
const testUserName = 'Skravlete Blåveis';

test.describe('System Register', async () => {
  let system: string;

  test.beforeEach(async ({ page, login }) => {
    const api = new ApiRequests();
    await page.goto(env('BASE_URL'));
    system = await api.createSystemSystemRegister(vendorOrgNumber);
    await login.LoginToAccessManagement(testUserPid);
    await login.chooseReportee(testUserName, testOrgName);
  });

  test('Create system user and verify landing page', async ({
    page,
    systemUserPage,
    accessManagementFrontPage,
  }): Promise<void> => {
    await test.step('Navigate to system user page', async () => {
      await accessManagementFrontPage.systemAccessLink.click();
    });

    await test.step('Create system user', async () => {
      // this is assigned as a text in code base, will just add more confusion to import that than hardcoding this here
      await systemUserPage.CREATE_SYSTEM_USER_LINK.click();
      await systemUserPage.selectSystem(system);
    });

    await test.step('Verify system user created', async () => {
      await expect(systemUserPage.SYSTEMUSER_CREATED_HEADING).toBeVisible();
      await expect(page.getByText(system).first()).toBeVisible();
    });
  });

  test.afterEach(async () => {
    if (system) {
      await TestdataApi.removeSystem(vendorOrgNumber, system);
    }
  });
});
