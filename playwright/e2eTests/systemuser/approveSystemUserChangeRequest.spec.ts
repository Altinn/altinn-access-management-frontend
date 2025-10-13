import test, { expect } from '@playwright/test';

import { TestdataApi } from 'playwright/util/TestdataApi';
import { LoginPage } from '../../pages/LoginPage';
import { SystemUserPage } from '../../pages/systemuser/SystemUserPage';
import { ApiRequests } from '../../api-requests/ApiRequests';

test.describe('Systembruker endringsforespørsel', () => {
  let api: ApiRequests;
  let loginPage: LoginPage;
  let systemUserPage: SystemUserPage;
  let orgNumber: string;
  let systemId: string;
  let systemUserIds: string[] = [];

  test.beforeEach(async ({ page }) => {
    api = new ApiRequests();
    loginPage = new LoginPage(page);
    systemUserPage = new SystemUserPage(page);
    orgNumber = process.env.ORG!;
    systemId = process.env.SYSTEM_ID!;
    if (!orgNumber) {
      throw new Error('ORG environment variable is not set');
    }
    if (!systemId) {
      throw new Error('SYSTEM_ID environment variable is not set');
    }
    await loginPage.loginWithUser('14824497789');
    await loginPage.chooseReportee('AKTVERDIG RETORISK APE');
  });

  test.afterEach(async () => {
    // Cleanup system users created during tests
    if (systemUserIds.length > 0) {
      try {
        await api.cleanUpSystemUsers(systemUserIds.map((id) => ({ id })));
      } catch (error) {
        console.error('Error during system user cleanup:', error);
      }
      systemUserIds = []; // Reset the array
    }
  });

  test('Avvis endringsforespørsel', async ({ page }): Promise<void> => {
    //Generate confirmUrl from API
    const externalRef = TestdataApi.generateExternalRef();
    const response = await api.postSystemuserRequest(externalRef);

    await api.approveSystemuserRequest(response.id);

    const systemUserId = await api.getSystemUserByQuery(systemId, orgNumber, externalRef);
    systemUserIds.push(systemUserId); // Track for cleanup

    const changeRequestResponse = await api.postSystemuserChangeRequest(systemUserId);

    await page.goto(changeRequestResponse.confirmUrl);
    await page.getByRole('button', { name: 'Avvis' }).click();

    //Look for login button
    await expect(loginPage.loginButton).toBeVisible();

    const statusApiRequest = await api.getStatusForSystemUserChangeRequest<{ status: string }>(
      changeRequestResponse.id,
    );

    expect(statusApiRequest.status).toBe('Rejected');
  });

  test('Godkjenn endringsforespørsel', async ({ page }): Promise<void> => {
    const externalRef = TestdataApi.generateExternalRef();
    const response = await api.postSystemuserRequest(externalRef);

    await api.approveSystemuserRequest(response.id);

    const systemUserId = await api.getSystemUserByQuery(systemId, orgNumber, externalRef);
    systemUserIds.push(systemUserId); // Track for cleanup

    const changeRequestResponse = await api.postSystemuserChangeRequest(systemUserId);
    await page.goto(changeRequestResponse.confirmUrl);
    await page.getByRole('button', { name: 'Godkjenn' }).click();

    //Look for login button

    await expect(loginPage.loginButton).toBeVisible();

    //Read from status api to verify that status is not Accepted after clicking "Avvis"
    const statusApiRequest = await api.getStatusForSystemUserChangeRequest<{ status: string }>(
      changeRequestResponse.id,
    );
    expect(statusApiRequest.status).toBe('Accepted');

    // Verify rights given
    await loginPage.loginWithUser('14824497789');
    await loginPage.chooseReportee('AKTVERDIG RETORISK APE');

    const systemUserUrl = `${process.env.SYSTEMUSER_URL}`;
    await page.goto(systemUserUrl + '/' + systemUserId);

    await systemUserPage.TRY_NEW_ACCESS_MANAGEMENT_BUTTON.click();

    // Verify the reflected changes
    await expect(page.getByText('Plansak')).toBeVisible();
    await expect(page.getByText('Baerekraft')).not.toBeVisible();
  });
});
