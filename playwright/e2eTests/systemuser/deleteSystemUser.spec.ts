import { expect, test } from '@playwright/test';

import { ApiRequests } from 'playwright/api-requests/ApiRequests';
import { TestdataApi } from 'playwright/util/TestdataApi';
import { loginWithUser } from 'playwright/pages/loginPage';

import { SystemUserPage } from '../../pages/systemuser/SystemUserPage';

test.describe.configure({ timeout: 30000 }); // Set timeout for all tests in this file

test.describe('System user deletion', () => {
  let systemId: string;
  let api: ApiRequests;

  test.beforeEach(async ({ page }) => {
    api = new ApiRequests();
    const login = new loginWithUser(page);
    await login.loginWithUser('14824497789');
    await login.chooseReportee('AKTVERDIG RETORISK APE');

    //Create a system in your "system register" before each test
    systemId = await api.createSystemSystemRegister();

    //Create a System user to be deleted later
    const systemUserPage = new SystemUserPage(page);

    // Navigate to system user page
    await page.goto(`${process.env.SYSTEMUSER_URL}`);

    // this is assigned as a text in code base, will just add more confusion to import that than hardcoding this here
    await systemUserPage.CREATE_SYSTEM_USER_LINK.click();
    await systemUserPage.selectSystem(systemId);
    await expect(systemUserPage.SYSTEMUSER_CREATED_HEADING).toBeVisible();
    await expect(page.getByText(systemId).first()).toBeVisible();
  });

  test('Delete created system user', async ({ page }) => {
    const systemUserPage = new SystemUserPage(page);

    // Delete system user
    await page.getByText(systemId).first().click();
    await systemUserPage.DELETE_SYSTEMUSER_BUTTON.click();
    await systemUserPage.FINAL_DELETE_SYSTEMUSER_BUTTON.click();

    // Confirm we are back on overview page
    await expect(systemUserPage.MAIN_HEADER).toBeVisible();
  });

  test.afterEach(async () => {
    if (systemId) {
      // Remove system
      await TestdataApi.removeSystem(systemId);
    }
  });
});
