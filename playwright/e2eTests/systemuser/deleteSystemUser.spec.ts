import { expect, test } from 'playwright/fixture/pomFixture';
import { ApiRequests } from 'playwright/api-requests/ApiRequests';
import { TestdataApi } from 'playwright/util/TestdataApi';

test.describe('System user deletion', () => {
  let systemId: string;
  let api: ApiRequests;

  test.beforeEach(async ({ page, login, systemUserPage, accessManagementFrontPage }) => {
    const orgNumber = '310547891';
    api = new ApiRequests(orgNumber);
    await login.LoginWithUserFromFrontpage('14824497789');
    await login.chooseReportee('Skravlete Blåveis', 'Aktverdig Retorisk Ape');

    //Create a system in your "system register" before each test
    systemId = await api.createSystemSystemRegister();

    // Navigate to system user page via menu link
    await accessManagementFrontPage.systemAccessLink.click();

    // this is assigned as a text in code base, will just add more confusion to import that than hardcoding this here
    await systemUserPage.CREATE_SYSTEM_USER_LINK.click();
    await systemUserPage.selectSystem(systemId);
    await expect(systemUserPage.SYSTEMUSER_CREATED_HEADING).toBeVisible();
    await expect(page.getByText(systemId).first()).toBeVisible();
  });

  test('Delete created system user', async ({ page, systemUserPage }) => {
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
