import { test, expect } from 'playwright/fixture/pomFixture';

import { TestdataApi } from 'playwright/util/TestdataApi';
import { ApiRequests } from 'playwright/api-requests/ApiRequests';

test.describe('Godkjenn og avvis Systembrukerforespørsel', () => {
  let api: ApiRequests;
  const orgNumber = '310547891'; // Hardcoded org ID for testing
  const systemId = '310547891_E2E-Playwright-Authentication'; // Hardcoded system ID for testing

  test.beforeEach(async () => {
    api = new ApiRequests(orgNumber);
  });

  test('Avvis Systembrukerforespørsel', async ({ page, login }): Promise<void> => {
    const externalRef = TestdataApi.generateExternalRef();

    const response = await test.step('Create system user request', async () => {
      return await api.postSystemuserRequest(externalRef, systemId);
    });

    await test.step('Navigate to confirmation page and login', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor('14824497789');
    });

    await test.step('Reject system user request', async () => {
      await page.getByRole('button', { name: 'Avvis' }).click();
    });

    await test.step('Verify logout and rejection status', async () => {
      //Expect user to be logged out
      await expect(page).toHaveURL('https://info.altinn.no');

      //Read from status api to verify that status is not rejected after clicking "Avvis"
      const statusApiRequest = await api.getStatusForSystemUserRequest<{ status: string }>(
        response.id,
      );
      expect(statusApiRequest.status).toBe('Rejected');
    });
  });

  test('Godkjenn Systembrukerforespørsel', async ({ page, login }): Promise<void> => {
    const externalRef = TestdataApi.generateExternalRef();

    const response = await test.step('Create system user request', async () => {
      return await api.postSystemuserRequest(externalRef, systemId);
    });

    await test.step('Navigate to confirmation page and login', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor('14824497789');
    });

    await test.step('Approve system user request', async () => {
      await page.getByRole('button', { name: 'Godkjenn' }).click();
    });

    await test.step('Verify logout and acceptance status', async () => {
      //Expect user to be logged out
      await expect(page).toHaveURL('https://info.altinn.no');

      //Read from status api to verify that status is not Accepted after clicking "Avvis"
      const statusApiRequest = await api.getStatusForSystemUserRequest<{ status: string }>(
        response.id,
      );
      expect(statusApiRequest.status).toBe('Accepted');
    });
  });
});
