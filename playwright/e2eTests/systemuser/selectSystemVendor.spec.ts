import { expect, test } from 'playwright/fixture/pomFixture';

import { TestdataApi } from 'playwright/util/TestdataApi';
import { ApiRequests } from 'playwright/api-requests/ApiRequests';

test.describe('System Register', async () => {
  let system: string;

  test.beforeEach(async ({ page, login }) => {
    const orgNumber = '310547891'; // Hardcoded org ID for testing
    const api = new ApiRequests(orgNumber);
    system = await api.createSystemSystemRegister(); // Create system before each test
    await login.LoginWithUserFromFrontpage('14824497789');
    await login.chooseReportee('AKTVERDIG RETORISK APE');
  });

  test('Create system user and verify landing page', async ({
    page,
    systemUserPage,
    accessManagementFrontPage,
  }): Promise<void> => {
    // Navigate to system user page via menu link
    await accessManagementFrontPage.apiAndSystemAccessLink.click();

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
