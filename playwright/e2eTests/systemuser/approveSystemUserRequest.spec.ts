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
    const response = await api.postSystemuserRequest(externalRef, systemId);

    await page.goto(response.confirmUrl);
    await login.LoginWithUserFromFrontpage('14824497789');

    await page.getByRole('button', { name: 'Avvis' }).click();

    //Expect user to be logged out
    await expect(page).toHaveURL('https://info.altinn.no');

    //Read from status api to verify that status is not rejected after clicking "Avvis"
    const statusApiRequest = await api.getStatusForSystemUserRequest<{ status: string }>(
      response.id,
    );
    expect(statusApiRequest.status).toBe('Rejected');
  });

  test('Godkjenn Systembrukerforespørsel', async ({ page, login }): Promise<void> => {
    const externalRef = TestdataApi.generateExternalRef();
    const response = await api.postSystemuserRequest(externalRef, systemId);

    await page.goto(response.confirmUrl);
    await login.LoginWithUserFromFrontpage('14824497789');

    await page.getByRole('button', { name: 'Godkjenn' }).click();

    //Expect user to be logged out
    await expect(page).toHaveURL('https://info.altinn.no');

    //Read from status api to verify that status is not Accepted after clicking "Avvis"
    const statusApiRequest = await api.getStatusForSystemUserRequest<{ status: string }>(
      response.id,
    );
    expect(statusApiRequest.status).toBe('Accepted');
  });
});
