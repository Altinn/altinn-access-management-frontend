import { expect, test } from 'playwright/fixture/pomFixture';
import { ApiRequests } from 'playwright/api-requests/ApiRequests';
import { TestdataApi } from 'playwright/util/TestdataApi';
import { env } from 'playwright/util/helper';

test.describe('System user deletion', () => {
  let systemId: string;
  let api: ApiRequests;

  test.beforeEach(async ({ page, login, systemUserPage, accessManagementFrontPage }) => {
    await test.step('Setup API client', async () => {
      const orgNumber = '310547891';
      api = new ApiRequests(orgNumber);
    });

    await test.step('Login and navigate to application', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('14824497789');
      await login.chooseReportee('Skravlete Blåveis', 'Aktverdig Retorisk Ape');
    });

    await test.step('Create system in system register', async () => {
      systemId = await api.createSystemSystemRegister();
    });

    await test.step('Navigate to system user page and create system user', async () => {
      await accessManagementFrontPage.systemAccessLink.click();
      // this is assigned as a text in code base, will just add more confusion to import that than hardcoding this here
      await systemUserPage.CREATE_SYSTEM_USER_LINK.click();
      await systemUserPage.selectSystem(systemId);
    });

    await test.step('Verify system user was created successfully', async () => {
      await expect(systemUserPage.SYSTEMUSER_CREATED_HEADING).toBeVisible();
      await expect(page.getByText(systemId).first()).toBeVisible();
    });
  });

  test('Delete created system user', async ({ page, systemUserPage }) => {
    await test.step('Select system user to delete', async () => {
      await page.getByText(systemId).first().click();
    });

    await test.step('Delete system user', async () => {
      await systemUserPage.DELETE_SYSTEMUSER_BUTTON.click();
      await systemUserPage.FINAL_DELETE_SYSTEMUSER_BUTTON.click();
    });

    await test.step('Verify deletion and return to overview', async () => {
      await expect(systemUserPage.MAIN_HEADER).toBeVisible();
    });
  });

  test.afterEach(async () => {
    if (systemId) {
      // Remove system
      await TestdataApi.removeSystem(systemId);
    }
  });
});
