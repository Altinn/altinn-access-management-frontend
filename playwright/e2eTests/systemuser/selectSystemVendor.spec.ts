import { expect, test } from '@playwright/test';
import { TestdataApi } from 'playwright/util/TestdataApi';
import { ApiRequests } from 'playwright/api-requests/ApiRequests';
import { loginWithUser } from 'playwright/pages/loginPage';
import { SystemUserPage } from '../../pages/systemuser/SystemUserPage';

test.describe.configure({ timeout: 20000 }); // Set timeout for all tests in this file

test.describe('System Register', async () => {
  let system: string;

  test.beforeEach(async ({ page }) => {
    const api = new ApiRequests();
    system = await api.createSystemSystemRegister(); // Create system before each test
    const login = new loginWithUser(page);
    await login.loginWithUser('14824497789');
    await login.chooseReportee('AKTVERDIG RETORISK APE');
  });

  test('Create system user and verify landing page', async ({ page }): Promise<void> => {
    const systemUserPage = new SystemUserPage(page);

    // Navigate to system user page
    await page.goto(`${process.env.SYSYEMUSER_URL}`);

    // this is assigned as a text in code base, will just add more confusion to import that than hardcoding this here
    await systemUserPage.CREATE_SYSTEM_USER_LINK.click();
    await systemUserPage.selectSystem(system);
    await expect(systemUserPage.SYSTEMUSER_CREATED_HEADING).toBeVisible();
    await expect(page.getByText(system).first()).toBeVisible();
  });

  test.afterEach(async () => {
    if (system) {
      console.log('Removing system');
      await TestdataApi.removeSystem(system);
    }
  });
});
