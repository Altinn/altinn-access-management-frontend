import { test, expect } from 'playwright/fixture/pomFixture';
import { TestdataApi } from 'playwright/util/TestdataApi';
import { env } from 'playwright/util/helper';
import { ApiRequests } from '../../../api-requests/ApiRequests';
const vendorOrgNumber = '310547891';
const prebuiltSystemId = '310547891_E2E-Playwright-Authentication';
const testUserPid = '14824497789';
const testOrgName = 'Aktverdig Retorisk Ape';
const testUserName = 'Skravlete Blåveis';

const testUser = testUserPid;

const changeRequest = {
  requiredRights: [{ resource: [{ value: 'vegardtestressurs', id: 'urn:altinn:resource' }] }],
  unwantedRights: [{ resource: [{ value: 'authentication-e2e-test', id: 'urn:altinn:resource' }] }],
  requiredAccessPackages: [{ urn: 'urn:altinn:accesspackage:plansak' }],
  unwantedAccessPackages: [{ urn: 'urn:altinn:accesspackage:baerekraft' }],
};

test.describe('Systembruker endringsforespørsel', () => {
  let api: ApiRequests;
  let systemUserIds: string[] = [];

  test.beforeEach(async () => {
    api = new ApiRequests(vendorOrgNumber);
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
    const externalRef = TestdataApi.generateExternalRef();

    await test.step('Create and approve system user request', async () => {
      const response = await api.postSystemuserRequest(
        externalRef,
        prebuiltSystemId,
        vendorOrgNumber,
      );
      await api.approveSystemuserRequest(response.id);
    });

    const systemUserId = await test.step('Get system user ID', async () => {
      const systemUserId = await api.getSystemUserByQuery(
        prebuiltSystemId,
        vendorOrgNumber,
        externalRef,
      );
      systemUserIds.push(systemUserId);
      return systemUserId;
    });

    const changeRequestResponse = await test.step('Create change request', async () => {
      return await api.postSystemuserChangeRequest(systemUserId, changeRequest);
    });

    await test.step('Navigate to change request confirmation page and login', async () => {
      await page.goto(changeRequestResponse.confirmUrl);
      await login.loginNotChoosingActor(testUser);
    });

    await test.step('Reject change request', async () => {
      await page.getByRole('button', { name: 'Avvis' }).click();
    });

    await test.step('Verify rejection status', async () => {
      await expect(login.loginButton).toBeVisible();

      const statusApiRequest = await api.getStatusForSystemUserChangeRequest<{ status: string }>(
        changeRequestResponse.id,
      );

      expect(statusApiRequest.status).toBe('Rejected');
    });
  });

  test('Godkjenn endringsforespørsel', async ({ page, login }): Promise<void> => {
    const externalRef = TestdataApi.generateExternalRef();

    await test.step('Create and approve system user request', async () => {
      const response = await api.postSystemuserRequest(
        externalRef,
        prebuiltSystemId,
        vendorOrgNumber,
      );
      await api.approveSystemuserRequest(response.id);
    });

    const systemUserId = await test.step('Get system user ID', async () => {
      const systemUserId = await api.getSystemUserByQuery(
        prebuiltSystemId,
        vendorOrgNumber,
        externalRef,
      );
      systemUserIds.push(systemUserId); // Track for cleanup
      return systemUserId;
    });

    const changeRequestResponse = await test.step('Create change request', async () => {
      return await api.postSystemuserChangeRequest(systemUserId, changeRequest);
    });

    await test.step('Navigate to change request confirmation page and login', async () => {
      await page.goto(changeRequestResponse.confirmUrl);
      await login.loginNotChoosingActor(testUser);
    });

    await test.step('Approve change request', async () => {
      await page.getByRole('button', { name: 'Godkjenn' }).click();
    });

    await test.step('Verify acceptance status', async () => {
      //Look for login button
      await expect(login.loginButton).toBeVisible();

      //Read from status api to verify that status is not Accepted after clicking "Avvis"
      const statusApiRequest = await api.getStatusForSystemUserChangeRequest<{ status: string }>(
        changeRequestResponse.id,
      );
      expect(statusApiRequest.status).toBe('Accepted');
    });

    await test.step('Verify rights changes are reflected', async () => {
      await login.LoginToAccessManagement(testUser);
      await login.chooseReportee(testUserName, testOrgName);

      const systemUserUrl = `${env('SYSTEMUSER_URL')}`;
      await page.goto(systemUserUrl + '/' + systemUserId);

      // Added by change request
      await expect(page.getByText('vegardendetilende')).toBeVisible();
      await expect(page.getByText('Plansak')).toBeVisible();

      // Removed by change request
      await expect(page.getByText('authentication-e2e-test')).not.toBeVisible();
      await expect(page.getByText('Baerekraft')).not.toBeVisible();
    });
  });
});
