import test from '@playwright/test';

import { ClientDelegationPage } from '../../pages/systemuser/ClientDelegation';
import { loginWithUser } from '../../pages/loginPage';
import { TestdataApi } from '../../util/TestdataApi';
import { env } from '../../util/helper';
import { ApiRequests } from '../../api-requests/ApiRequests';

test.describe.configure({ timeout: 10000 });

test.describe('Klientdelegering – Regnskapsfører og revisor', () => {
  let api: ApiRequests;

  test.beforeEach(async ({ page }) => {
    api = new ApiRequests();

    const login = new loginWithUser(page);
    await login.loginWithUser(env('PID_REVISOR_REGNSKAPSFOERER'));
    await login.chooseReportee(env('AKTOER_REVISOR_REGNSKAPSFOERER'));
  });

  test('Legg til og slett kunde og slett Systembruker - Ansvarlig revisor', async ({ page }) => {
    const name = `Playwright-e2e-revisor-${Date.now()}-${Math.random()}`;
    const customer = {
      label: 'HUSLØS DJERV TIGER',
      confirmation: 'HUSLØS DJERV TIGER AS',
    };

    const systemId = await api.createSystemInSystemregisterWithAccessPackages(name);
    const clientDelegationPage = new ClientDelegationPage(page);
    const accessPackage = 'ansvarlig-revisor';
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
    await clientDelegationPage.openAccessPackage('Ansvarlig revisor');
    await clientDelegationPage.addCustomer(customer.label, customer.confirmation);
    await clientDelegationPage.removeCustomer(customer.confirmation);
    await clientDelegationPage.deleteSystemUser(name);
  });

  test('Legg til og slett kunde og slett Systembruker - Regnskapsfører', async ({ page }) => {
    const name = `Playwright-e2e-regnskapsforer-${Date.now()}-${Math.random()}`;
    const customer = {
      label: 'FINTFØLENDE GJESTFRI HAMSTER',
      confirmation: 'FINTFØLENDE GJESTFRI HAMSTER KF',
    };

    const systemId = await api.createSystemInSystemregisterWithAccessPackages(name);
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
    await clientDelegationPage.addCustomer(customer.label, customer.confirmation);
    await clientDelegationPage.removeCustomer(customer.confirmation);
    await clientDelegationPage.deleteSystemUser(name);
  });
});

test.describe('Klientdelegering – Forretningsfører', () => {
  let api: ApiRequests;

  test.beforeEach(async ({ page }) => {
    api = new ApiRequests();

    const login = new loginWithUser(page);
    await login.loginWithUser(env('PID_FORRETNINGSFORER'));
    await login.chooseReportee(env('AKTOER_FORRETNINGSFOERER'));
  });

  test('Legg til og slett kunde og slett Systembruker', async ({ page }) => {
    const name = `Playwright-e2e-forretningsforer-${Date.now()}-${Math.random()}`;
    const customer = {
      label: 'SAMEIET TREG PATENT LØVE',
      confirmation: 'SAMEIET TREG PATENT LØVE',
    };

    const systemId = await api.createSystemInSystemregisterWithAccessPackages(name);
    const clientDelegationPage = new ClientDelegationPage(page);
    const accessPackage = 'forretningsforer-eiendom';
    const externalRef = TestdataApi.generateExternalRef();

    const response = await api.postClientDelegationAgentRequest(
      externalRef,
      systemId,
      accessPackage,
      env('ORG_FORRETNINGSFORER'),
    );

    await page.goto(response.confirmUrl);
    await clientDelegationPage.confirmDelegation();
    await clientDelegationPage.openAccessPackageModal(name);
    await clientDelegationPage.openAccessPackage('Forretningsforer eiendom');
    await clientDelegationPage.addCustomer(customer.label, customer.confirmation);
    await clientDelegationPage.removeCustomer(customer.confirmation);
    await clientDelegationPage.deleteSystemUser(name);
  });
});
