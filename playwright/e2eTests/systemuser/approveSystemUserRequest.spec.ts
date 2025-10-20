import test, { expect } from '@playwright/test';

import { TestdataApi } from 'playwright/util/TestdataApi';
import { LoginPage } from '../../pages/LoginPage';

import { ApiRequests } from '../../api-requests/ApiRequests';

test.describe('Godkjenn og avvis Systembrukerforespørsel', () => {
  let api: ApiRequests;
  const orgNumber = '310547891'; // Hardcoded org ID for testing
  const systemId = '310547891_E2E-Playwright-Authentication'; // Hardcoded system ID for testing

  test.beforeEach(async ({ page }) => {
    api = new ApiRequests(orgNumber);
    const login = new LoginPage(page);
    await login.loginWithUser('14824497789');
    await login.chooseReportee('AKTVERDIG RETORISK APE');
  });

  test('Avvis Systembrukerforespørsel', async ({ page }): Promise<void> => {
    const externalRef = TestdataApi.generateExternalRef();
    const response = await api.postSystemuserRequest(externalRef, systemId);

    await page.goto(response.confirmUrl);

    await page.getByRole('button', { name: 'Avvis' }).click();

    //Expect user to be logged out
    await expect(page).toHaveURL('https://info.altinn.no');

    //Read from status api to verify that status is not rejected after clicking "Avvis"
    const statusApiRequest = await api.getStatusForSystemUserRequest<{ status: string }>(
      response.id,
    );
    expect(statusApiRequest.status).toBe('Rejected');
  });

  test('Godkjenn Systembrukerforespørsel', async ({ page }): Promise<void> => {
    const externalRef = TestdataApi.generateExternalRef();
    const response = await api.postSystemuserRequest(externalRef, systemId);

    await page.goto(response.confirmUrl);
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
