import { test, expect } from 'playwright/fixture/pomFixture';
import { TestdataApi } from 'playwright/util/TestdataApi';
import { env } from 'playwright/util/helper';
import { ApiRequests } from '../../api-requests/ApiRequests';

test.describe('Systembruker endringsforespørsel', () => {
  let api: ApiRequests;
  let orgNumber: string;
  let systemId: string;
  let systemUserIds: string[] = [];

  test.beforeEach(async () => {
    orgNumber = '310547891'; // Hardcoded org ID for testing
    systemId = '310547891_E2E-Playwright-Authentication'; // Hardcoded system ID for testing
    api = new ApiRequests(orgNumber);
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

  test('Avvis endringsforespørsel', async ({ page, login }): Promise<void> => {
    //Generate confirmUrl from API
    const externalRef = TestdataApi.generateExternalRef();
    const response = await api.postSystemuserRequest(externalRef, systemId);

    await api.approveSystemuserRequest(response.id);

    const systemUserId = await api.getSystemUserByQuery(systemId, orgNumber, externalRef);
    systemUserIds.push(systemUserId);

    const changeRequestResponse = await api.postSystemuserChangeRequest(systemUserId);

    await page.goto(changeRequestResponse.confirmUrl);
    await login.loginNotChoosingActor('14824497789');
    await page.getByRole('button', { name: 'Avvis' }).click();

    //Look for login button
    await expect(login.loginButton).toBeVisible();

    const statusApiRequest = await api.getStatusForSystemUserChangeRequest<{ status: string }>(
      changeRequestResponse.id,
    );

    expect(statusApiRequest.status).toBe('Rejected');
  });

  test('Godkjenn endringsforespørsel', async ({ page, login, systemUserPage }): Promise<void> => {
    const externalRef = TestdataApi.generateExternalRef();
    const response = await api.postSystemuserRequest(externalRef, systemId);

    await api.approveSystemuserRequest(response.id);

    const systemUserId = await api.getSystemUserByQuery(systemId, orgNumber, externalRef);
    systemUserIds.push(systemUserId); // Track for cleanup

    const changeRequestResponse = await api.postSystemuserChangeRequest(systemUserId);
    await page.goto(changeRequestResponse.confirmUrl);
    await login.loginNotChoosingActor('14824497789');
    await page.getByRole('button', { name: 'Godkjenn' }).click();

    //Look for login button

    await expect(login.loginButton).toBeVisible();

    //Read from status api to verify that status is not Accepted after clicking "Avvis"
    const statusApiRequest = await api.getStatusForSystemUserChangeRequest<{ status: string }>(
      changeRequestResponse.id,
    );
    expect(statusApiRequest.status).toBe('Accepted');

    // Verify rights given
    await login.LoginWithUserFromFrontpage('14824497789');
    await login.chooseReportee('Blåveis Skravlete', 'Aktverdig Retorisk Ape');

    const systemUserUrl = `${env('SYSTEMUSER_URL')}`;
    await page.goto(systemUserUrl + '/' + systemUserId);

    // Verify the reflected changes
    await expect(page.getByText('Plansak')).toBeVisible();
    await expect(page.getByText('Baerekraft')).not.toBeVisible();
  });
});
