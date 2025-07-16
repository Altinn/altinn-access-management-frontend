import test, { expect } from '@playwright/test';

import { TestdataApi } from 'playwright/util/TestdataApi';
import { LoginPage } from 'playwright/pages/loginPage';

import { ApiRequests } from '../../api-requests/ApiRequests';

test.describe('Godkjenn og avvis Systembruker endringsforespørsel', () => {
  let api: ApiRequests;

  test.beforeEach(async ({ page }) => {
    api = new ApiRequests();
    const login = new LoginPage(page);
    await login.loginWithUser('14824497789');
    await login.chooseReportee('AKTVERDIG RETORISK APE');
  });

  test('Avvis Systembruker endringsforespørsel', async ({ page }): Promise<void> => {
    //Generate confirmUrl from API
    const externalRef = TestdataApi.generateExternalRef();
    const response = await api.postSystemuserRequest(externalRef);

    await api.approveSystemuserRequest(response.id);

    const confirmUrlChangeRequest = await api.postSystemuserChangeRequest(externalRef);
    await page.goto(confirmUrlChangeRequest);
    await page.getByRole('button', { name: 'Avvis' }).click();

    //Expect user to be logged out
    await expect(page).toHaveURL('https://info.altinn.no');

    //Read from status api to verify that status is not Accepted after clicking "Avvis"
    const statusApiRequest = await api.getStatusForSystemUserRequest<{ status: string }>(
      response.id,
    );
    expect(statusApiRequest.status).toBe('Accepted');
  });

  test('Godkjenn Systembruker endringsforespørsel', async ({ page }): Promise<void> => {
    const externalRef = TestdataApi.generateExternalRef();
    const response = await api.postSystemuserRequest(externalRef);

    await api.approveSystemuserRequest(response.id);

    const confirmUrlChangeRequest = await api.postSystemuserChangeRequest(externalRef);
    await page.goto(confirmUrlChangeRequest);
    await page.getByRole('button', { name: 'Godkjenn' }).click();

    //Expect user to be logged out
    await expect(page).toHaveURL('https://info.altinn.no');
  });
});
