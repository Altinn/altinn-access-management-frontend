import test from '@playwright/test';

import { ClientDelegationPage } from '../../pages/systemuser/ClientDelegation';
import { loginWithUser } from '../../pages/loginPage';
import { TestdataApi } from '../../util/TestdataApi';
import { env } from '../../util/helper';
import { ApiRequests } from '../../api-requests/ApiRequests';

test.describe.configure({ timeout: 10000 });

test.describe('Klientdelegering – Regnskapsfører og revisor', () => {
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
    const clientDelegationPage = new ClientDelegationPage(page);
    const accessPackage = 'ansvarlig-revisor';
    const externalRef = TestdataApi.generateExternalRef();

    const response = await api.postClientDelegationAgentRequest(
      externalRef,
      systemId,
      accessPackage,
      env('ORG_REVISOR_REGNSKAPSFOERER'),
    );

    //Navigate to approve System User Request for Agent request
    await page.goto(response.confirmUrl);
    await clientDelegationPage.confirmDelegation();
    await clientDelegationPage.openAccessPackageModal(name);

    await clientDelegationPage.openAccessPackage('Ansvarlig revisor');
    await clientDelegationPage.addCustomer('HUSLØS DJERV TIGER', 'HUSLØS DJERV TIGER AS');
    await clientDelegationPage.removeCustomer('HUSLØS DJERV TIGER AS');
    await clientDelegationPage.deleteSystemUser(name);
  });

  test('Regnskapsfører', async ({ page }) => {
    const clientDelegationPage = new ClientDelegationPage(page);
    const accessPackage = 'regnskapsforer-lonn';
    const externalRef = TestdataApi.generateExternalRef();

    const response = await api.postClientDelegationAgentRequest(
      externalRef,
      systemId,
      accessPackage,
      env('ORG_REVISOR_REGNSKAPSFOERER'),
    );

    await page.goto(response.confirmUrl);
    await clientDelegationPage.confirmDelegation();
    await clientDelegationPage.openAccessPackageModal(name);
    await clientDelegationPage.openAccessPackage('Regnskapsfører lønn');
    await clientDelegationPage.addCustomer(
      'FINTFØLENDE GJESTFRI HAMSTER',
      'FINTFØLENDE GJESTFRI HAMSTER KF',
    );
    await clientDelegationPage.removeCustomer('FINTFØLENDE GJESTFRI HAMSTER KF');
    await clientDelegationPage.deleteSystemUser(name);
  });
});

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
    const clientDelegationPage = new ClientDelegationPage(page);
    const accessPackage = 'forretningsforer-eiendom';
    const externalRef = TestdataApi.generateExternalRef();

    const response = await api.postClientDelegationAgentRequest(
      externalRef,
      systemId,
      accessPackage,
      env('ORG_FORRETNINGSFORER'),
    );

    //Navigate to approve System User Request for Agent request
    await page.goto(response.confirmUrl);
    await clientDelegationPage.confirmDelegation();
    await clientDelegationPage.openAccessPackageModal(name);

    await clientDelegationPage.openAccessPackage('Forretningsforer eiendom');
    await clientDelegationPage.addCustomer('SAMEIET TREG PATENT LØVE', 'SAMEIET TREG PATENT LØVE');
    await clientDelegationPage.removeCustomer('SAMEIET TREG PATENT LØVE');
    await clientDelegationPage.deleteSystemUser(name);
  });
});
