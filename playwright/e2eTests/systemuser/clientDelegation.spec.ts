import test, { expect } from '@playwright/test';

import { TestdataApi } from 'playwright/util/TestdataApi';
import { loginWithUser } from 'playwright/pages/loginPage';

import { ApiRequests } from '../../api-requests/ApiRequests';

test.describe.configure({ timeout: 10000 }); // Set timeout for all tests in this file

test.describe('Klientdelegering', () => {
  let api: ApiRequests;
  let systemId = '';
  const name = `Playwright-e2e-${Date.now()}_${Math.random()}`;

  test.beforeEach(async ({ page }) => {
    api = new ApiRequests();

    systemId = await api.createSystemInSystemregisterWithAccessPackages(name); // Create system before tests
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
    //Todo: får ikke verifisert kunde lagt til, resolver til to kliss like elementer med samme state?

    //Fjern kunde
    await page.getByRole('button', { name: 'Legg til eller fjern kunder' }).click();
    await page.getByRole('button', { name: 'Fjern HUSLØS DJERV TIGER AS' }).click();
    await page.getByText('HUSLØS DJERV TIGER AS er fjernet fra Systemtilgangen').click();
    await page.getByRole('button', { name: 'Bekreft og lukk' }).click();

    // Slett Systembruker
    await page.getByRole('button', { name: 'Slett systemtilgang' }).first().click();
    await page.getByRole('button', { name: 'Slett systemtilgang' }).nth(1).click(); //Ugly but exact same definition as previous one

    //Verify system user is no longer available
    await expect(page.getByRole('link', { name })).toHaveCount(0);
  });

  test('Opprett og godkjenn forespørsel for "regnskapsfører"', async ({ page }) => {
    const accessPackage = 'regnskapsforer-lonn';
    const externalRef = TestdataApi.generateExternalRef();

    const response = api.postClientDelegationAgentRequest(externalRef, systemId, accessPackage);
    await page.goto((await response).confirmUrl);
    await page.getByRole('button', { name: 'Godkjenn' }).click();

    //Click System user
    await page.getByRole('link', { name: name }).click();
    const packageButton = page.getByRole('button', { name: 'Regnskapsfører lønn' });
    await expect(packageButton).toBeVisible();
    await packageButton.click();
    //Assert modal is visibler - todo

    await page.keyboard.press('Escape');
    //Assert modal is hidden - todo

    //Add customer
    await page.getByRole('button', { name: 'Legg til kunder' }).click();
    await page.getByRole('button', { name: 'Legg til FINTFØLENDE GJESTFRI HAMSTER' }).click();
    await page.getByText('FINTFØLENDE GJESTFRI HAMSTER KF er lagt').click();

    //Lukk modal og sjekk at kunde er lagt til
    await page.getByRole('button', { name: 'Bekreft og lukk' }).click();
    //Todo: får ikke verifisert kunde lagt til, resolver til to kliss like elementer med samme state?

    //Fjern kunde
    await page.getByRole('button', { name: 'Legg til eller fjern kunder' }).click();
    await page.getByRole('button', { name: 'FINTFØLENDE GJESTFRI HAMSTER KF' }).click();
    await page.getByText('FINTFØLENDE GJESTFRI HAMSTER KF er fjernet fra Systemtilgangen').click();
    await page.getByRole('button', { name: 'Bekreft og lukk' }).click();

    // Slett Systembruker
    await page.getByRole('button', { name: 'Slett systemtilgang' }).first().click();
    await page.getByRole('button', { name: 'Slett systemtilgang' }).nth(1).click(); //Ugly but exact same definition as previous one

    //Verify system user is no longer available
    await expect(page.getByRole('link', { name })).toHaveCount(0);
  });

  test('Klientdelegering for "forretningsfører"', async ({ page }) => {
    const accessPackage = 'forretningsforer-eiendom';
    const externalRef = TestdataApi.generateExternalRef();

    const response = api.postClientDelegationAgentRequest(externalRef, systemId, accessPackage);
    await page.goto((await response).confirmUrl);
    await page.getByRole('button', { name: 'Godkjenn' }).click();

    //Click System user
    await page.getByRole('link', { name: name }).click();
    const packageButton = page.getByRole('button', { name: 'Regnskapsfører lønn' });
    await expect(packageButton).toBeVisible();
    await packageButton.click();
    //Assert modal is visibler - todo

    await page.keyboard.press('Escape');
    //Assert modal is hidden - todo

    //Add customer
    await page.getByRole('button', { name: 'Legg til kunder' }).click();
    await page.getByRole('button', { name: 'Legg til FINTFØLENDE GJESTFRI HAMSTER' }).click();
    await page.getByText('FINTFØLENDE GJESTFRI HAMSTER KF er lagt').click();

    //Lukk modal og sjekk at kunde er lagt til
    await page.getByRole('button', { name: 'Bekreft og lukk' }).click();
    //Todo: får ikke verifisert kunde lagt til, resolver til to kliss like elementer med samme state?

    //Fjern kunde
    await page.getByRole('button', { name: 'Legg til eller fjern kunder' }).click();
    await page.getByRole('button', { name: 'FINTFØLENDE GJESTFRI HAMSTER KF' }).click();
    await page.getByText('FINTFØLENDE GJESTFRI HAMSTER KF er fjernet fra Systemtilgangen').click();
    await page.getByRole('button', { name: 'Bekreft og lukk' }).click();

    // Slett Systembruker
    await page.getByRole('button', { name: 'Slett systemtilgang' }).first().click();
    await page.getByRole('button', { name: 'Slett systemtilgang' }).nth(1).click(); //Ugly but exact same definition as previous one

    //Verify system user is no longer available
    await expect(page.getByRole('link', { name })).toHaveCount(0);
  });
});
