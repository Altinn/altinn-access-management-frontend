import test, { expect } from '@playwright/test';

import { TestdataApi } from 'playwright/util/TestdataApi';
import { loginWithUser } from 'playwright/pages/loginPage';
import { Util } from 'playwright/util/Util';

import { ApiRequests } from '../../api-requests/ApiRequests';

test.describe.configure({ timeout: 10000 }); // Set timeout for all tests in this file

test.describe('Klientdelegering', () => {
  let api: ApiRequests;
  let systemId = '';
  const name = `Playwright-e2e-${Date.now()}_${Math.random()}`;

  test.beforeAll(async () => {
    api = new ApiRequests();
    systemId = await api.createSystemInSystemregisterWithAccessPackages(name); // Create system before tests
  });

  test.beforeEach(async ({ page }) => {
    const login = new loginWithUser(page);

    try {
      if (process.env.PID) {
        await login.loginWithUser(process.env.PID || '');
      }
      if (process.env.ALTINN_PARTY_ORG_CLIENT_DELEGATION && process.env.AKTOER) {
        await login.chooseReportee(process.env.AKTOER);
      }
    } catch (error) {
      console.error('Error during login or reportee selection:', error);
      throw new Error('Login or reportee selection failed. Check logs for details.');
    }
  });

  test('Opprett og godkjenn forespørsel for "ansvarlig-revisor"', async ({ page }) => {
    const accessPackage = 'ansvarlig-revisor';
    const externalRef = TestdataApi.generateExternalRef();

    const response = api.postClientDelegationAgentRequest(externalRef, systemId, accessPackage);
    await page.goto((await response).confirmUrl);
    await page.getByRole('button', { name: 'Godkjenn' }).click();

    //Click System user
    await page.getByRole('link', { name: name }).click();
    const packageButton = page.getByRole('button', { name: accessPackage.replace('-', ' ') });
    await expect(packageButton).toBeVisible();
    await packageButton.click();
    //Assert modal is visibler - todo

    await page.keyboard.press('Escape');
    //Assert modal is hidden - todo

    //Add customer
    await page.getByRole('button', { name: 'Legg til kunder' }).click();
    await page.getByRole('button', { name: 'Legg til HUSLØS DJERV TIGER' }).click();
    await page.getByText('HUSLØS DJERV TIGER AS er lagt').click();

    //Lukk modal og sjekk at kunde er lagt til
    await page.getByRole('button', { name: 'Bekreft og lukk' }).click();
    //Todo: får ikke verifisert kunde lagt til, resolver til to kliss like elementer

    //Fjern kunde
    await page.getByRole('button', { name: 'Legg til eller fjern kunder' }).click();
    await page.getByRole('button', { name: 'Fjern HUSLØS DJERV TIGER AS' }).click();
    await page.getByText('HUSLØS DJERV TIGER AS er fjernet fra Systemtilgangen').click();
    await page.getByRole('button', { name: 'Bekreft og lukk' }).click();

    // Slet Systembruker
    await page.getByRole('button', { name: 'Slett systemtilgang' }).first().click();
    await page.getByRole('button', { name: 'Slett systemtilgang' }).nth(1).click(); //Ugly but exact same definition as previous one

    //Verify system is no longer visible
    await expect(page.getByRole('link', { name })).toHaveCount(0);
  });
});
