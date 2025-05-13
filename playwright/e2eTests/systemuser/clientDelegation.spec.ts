import test, { expect } from '@playwright/test';

import { TestdataApi } from 'playwright/util/TestdataApi';
import { loginWithUser } from 'playwright/pages/loginPage';
import { env } from 'playwright/util/helper';

import { ApiRequests } from '../../api-requests/ApiRequests';

test.describe.configure({ timeout: 10000 });

/**
 * Tester for regnskapsfører og revisor
 */
test.describe('Klientdelegering - Regnskapsfører og revisor', () => {
  let api: ApiRequests;
  let systemId = '';
  const name = `Playwright-e2e-regn-revi-${Date.now()}-${Math.random()}`;

  test.beforeEach(async ({ page }) => {
    api = new ApiRequests();
    systemId = await api.createSystemInSystemregisterWithAccessPackages(name);

    const login = new loginWithUser(page);
    await login.loginWithUser(env('PID_REVISOR_REGNSKAPSFOERER'));
    await login.chooseReportee(env('AKTOER_REVISOR_REGNSKAPSFOERER'));
  });

  test('Ansvarlig revisor', async ({ page }) => {
    const accessPackage = 'ansvarlig-revisor';
    const externalRef = TestdataApi.generateExternalRef();

    const response = await api.postClientDelegationAgentRequest(
      externalRef,
      systemId,
      accessPackage,
      env('ORG_REVISOR_REGNSKAPSFOERER'),
    );
    await page.goto(response.confirmUrl);
    await page.getByRole('button', { name: 'Godkjenn' }).click();

    await page.getByRole('link', { name }).click();
    const packageButton = page.getByRole('button', { name: accessPackage.replace('-', ' ') });
    await expect(packageButton).toBeVisible();
    await packageButton.click();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Legg til kunder' }).click();
    await page.getByRole('button', { name: 'Legg til HUSLØS DJERV TIGER' }).click();
    await page.getByText('HUSLØS DJERV TIGER AS er lagt').click();

    await page.getByRole('button', { name: 'Bekreft og lukk' }).click();

    await page.getByRole('button', { name: 'Legg til eller fjern kunder' }).click();
    await page.getByRole('button', { name: 'Fjern HUSLØS DJERV TIGER AS' }).click();
    await page.getByText('HUSLØS DJERV TIGER AS er fjernet fra Systemtilgangen').click();
    await page.getByRole('button', { name: 'Bekreft og lukk' }).click();

    await page.getByRole('button', { name: 'Slett systemtilgang' }).first().click();
    await page.getByRole('button', { name: 'Slett systemtilgang' }).nth(1).click();

    await expect(page.getByRole('link', { name })).toHaveCount(0);
  });

  test('Regnskapsfører', async ({ page }) => {
    const accessPackage = 'regnskapsforer-lonn';
    const externalRef = TestdataApi.generateExternalRef();

    const response = await api.postClientDelegationAgentRequest(
      externalRef,
      systemId,
      accessPackage,
      env('ORG_REVISOR_REGNSKAPSFOERER'),
    );
    await page.goto(response.confirmUrl);
    await page.getByRole('button', { name: 'Godkjenn' }).click();

    await page.getByRole('link', { name }).click();
    const packageButton = page.getByRole('button', { name: 'Regnskapsfører lønn' });
    await expect(packageButton).toBeVisible();
    await packageButton.click();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Legg til kunder' }).click();
    await page.getByRole('button', { name: 'Legg til FINTFØLENDE GJESTFRI HAMSTER' }).click();
    await page.getByText('FINTFØLENDE GJESTFRI HAMSTER KF er lagt').click();

    await page.getByRole('button', { name: 'Bekreft og lukk' }).click();

    await page.getByRole('button', { name: 'Legg til eller fjern kunder' }).click();
    await page.getByRole('button', { name: 'FINTFØLENDE GJESTFRI HAMSTER KF' }).click();
    await page.getByText('FINTFØLENDE GJESTFRI HAMSTER KF er fjernet fra Systemtilgangen').click();
    await page.getByRole('button', { name: 'Bekreft og lukk' }).click();

    await page.getByRole('button', { name: 'Slett systemtilgang' }).first().click();
    await page.getByRole('button', { name: 'Slett systemtilgang' }).nth(1).click();

    await expect(page.getByRole('link', { name })).toHaveCount(0);
  });
});

/**
 * Egen setup for forretningsfører
 */
test.describe('Klientdelegering – Forretningsfører', () => {
  let api: ApiRequests;
  let systemId = '';
  const name = `Playwright-e2e-forretningsforer-${Date.now()}-${Math.random()}`;

  test.beforeEach(async ({ page }) => {
    api = new ApiRequests();
    systemId = await api.createSystemInSystemregisterWithAccessPackages(name);
    const login = new loginWithUser(page);
    await login.loginWithUser(env('PID_FORRETNINGSFORER'));
    await login.chooseReportee(env('AKTOER_FORRETNINGSFOERER'));
  });

  test('Opprett og godkjenn forespørsel for "forretningsfører"', async ({ page }) => {
    const accessPackage = 'forretningsforer-eiendom';
    const externalRef = TestdataApi.generateExternalRef();

    const response = await api.postClientDelegationAgentRequest(
      externalRef,
      systemId,
      accessPackage,
      env('ORG_FORRETNINGSFORER'),
    );
    await page.goto(response.confirmUrl);
    await page.getByRole('button', { name: 'Godkjenn' }).click();

    await page.getByRole('link', { name }).click();
    const packageButton = page.getByRole('button', { name: 'Forretningsforer eiendom' });
    await expect(packageButton).toBeVisible();
    await packageButton.click();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Legg til kunder' }).click();
    await page.getByRole('button', { name: 'Legg til SAMEIET TREG PATENT LØVE' }).click();
    await page.getByText('SAMEIET TREG PATENT LØVE er lagt').click();

    await page.getByRole('button', { name: 'Bekreft og lukk' }).click();

    await page.getByRole('button', { name: 'Legg til eller fjern kunder' }).click();
    await page.getByRole('button', { name: 'SAMEIET TREG PATENT LØVE' }).click();
    await page.getByText('SAMEIET TREG PATENT LØVE er fjernet fra Systemtilgangen').click();
    await page.getByRole('button', { name: 'Bekreft og lukk' }).click();

    await page.getByRole('button', { name: 'Slett systemtilgang' }).first().click();
    await page.getByRole('button', { name: 'Slett systemtilgang' }).nth(1).click();

    await expect(page.getByRole('link', { name })).toHaveCount(0);
  });
});
