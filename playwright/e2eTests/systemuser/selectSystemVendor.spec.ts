import { expect, test } from '@playwright/test';

import { TestdataApi } from 'playwright/util/TestdataApi';
import { env } from 'playwright/util/helper';
import { ApiRequests } from 'playwright/api-requests/ApiRequests';
import { LoginPage } from 'playwright/pages/LoginPage';

import { SystemUserPage } from '../../pages/systemuser/SystemUserPage';

test.describe('System Register', async () => {
  let system: string;

  test.beforeEach(async ({ page }) => {
    const orgNumber = '310547891'; // Hardcoded org ID for testing
    const api = new ApiRequests(orgNumber);
    system = await api.createSystemSystemRegister(); // Create system before each test
    const login = new LoginPage(page);
    await login.loginWithUser('14824497789');
    await login.chooseReportee('AKTVERDIG RETORISK APE');
  });

  test('Create system user and verify landing page', async ({ page }): Promise<void> => {
    const systemUserPage = new SystemUserPage(page);

    // Navigate to system user page
    await page.goto(`${env('SYSTEMUSER_URL')}` + '/overview');

    // Intro to "new brukerflate"
    await page.getByRole('button', { name: 'Prøv ny tilgangsstyring' }).click();

    // this is assigned as a text in code base, will just add more confusion to import that than hardcoding this here
    await systemUserPage.CREATE_SYSTEM_USER_LINK.click();
    await systemUserPage.selectSystem(system);
    await expect(systemUserPage.SYSTEMUSER_CREATED_HEADING).toBeVisible();
    await expect(page.getByText(system).first()).toBeVisible();
  });

  test.afterEach(async () => {
    if (system) {
      await TestdataApi.removeSystem(system);
    }
  });
});
