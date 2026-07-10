import { test, expect } from 'playwright/fixture/pomFixture';

import { TestdataApi } from 'playwright/util/TestdataApi';
import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
const vendorOrgNumber = '310547891';
const prebuiltSystemId = '310547891_E2E-Playwright-Authentication';
const testUserPid = '14824497789';

test.describe('Godkjenn og avvis Systembrukerforespørsel', () => {
  let api: ApiRequests;
  let response: Awaited<ReturnType<ApiRequests['postSystemuserRequest']>>;

  test.beforeEach(async () => {
    api = new ApiRequests();
    const externalRef = TestdataApi.generateExternalRef();
    response = await api.postSystemuserRequest(
      vendorOrgNumber,
      externalRef,
      prebuiltSystemId,
      vendorOrgNumber,
      'https://altinn.no/',
    );
  });

  test('Avvis Systembrukerforespørsel', async ({
    page,
    login,
    systemUserConfirmPage,
  }): Promise<void> => {
    await test.step('Navigate to confirmation page and login', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(testUserPid);
    });

    await test.step('Reject system user request', async () => {
      await systemUserConfirmPage.reject();
    });

    await test.step('Verify logout and rejection status', async () => {
      //Expect user to be logged out
      await expect(page).toHaveURL('https://info.altinn.no');

      //Read from status api to verify that status is not rejected after clicking "Avvis"
      const statusApiRequest = await api.getStatusForSystemUserRequest<{ status: string }>(
        vendorOrgNumber,
        response.id,
      );
      expect(statusApiRequest.status).toBe('Rejected');
    });
  });

  test('Godkjenn Systembrukerforespørsel', async ({
    page,
    login,
    systemUserConfirmPage,
  }): Promise<void> => {
    await test.step('Navigate to confirmation page and login', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(testUserPid);
    });

    await test.step('Approve system user request', async () => {
      await systemUserConfirmPage.approve();
    });

    await test.step('Verify logout and acceptance status', async () => {
      //Expect user to be logged out
      await expect(page).toHaveURL('https://info.altinn.no');

      //Read from status api to verify that status is not Accepted after clicking "Avvis"
      const statusApiRequest = await api.getStatusForSystemUserRequest<{ status: string }>(
        vendorOrgNumber,
        response.id,
      );
      expect(statusApiRequest.status).toBe('Accepted');
    });
  });
});
