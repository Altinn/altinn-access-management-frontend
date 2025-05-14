import test from '@playwright/test';

import { ClientDelegationPage } from '../../pages/systemuser/ClientDelegation';
import { loginWithUser } from '../../pages/loginPage';
import { TestdataApi } from '../../util/TestdataApi';
import { ApiRequests } from '../../api-requests/ApiRequests';

test.describe.configure({ timeout: 20000 });

const TEST_USERS = {
  revisorRegnskapsfoerer: {
    pid: '06857897380',
    org: '314250052',
    aktoer: 'TILBAKEHOLDEN USYMMETRISK TIGER',
  },
  forretningsforer: {
    pid: '02895998748',
    org: '313351203',
    aktoer: 'GENIERKLÆRT LEI PUMA',
  },
};

test.describe('Klientdelegering for Regnskapsfører og revisor', () => {
  let api: ApiRequests;

  test.beforeEach(async ({ page }) => {
    api = new ApiRequests();

    const user = TEST_USERS.revisorRegnskapsfoerer;
    const login = new loginWithUser(page);
    await login.loginWithUser(user.pid);
    await login.chooseReportee(user.aktoer);
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
      TEST_USERS.revisorRegnskapsfoerer.org,
    );

    await page.goto(response.confirmUrl);

    await clientDelegationPage.confirmAndCreateSystemUser('Ansvarlig revisor');
    await clientDelegationPage.systemUserLink(name).click();
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
      TEST_USERS.revisorRegnskapsfoerer.org,
    );

    await page.goto(response.confirmUrl);
    await clientDelegationPage.confirmAndCreateSystemUser('Regnskapsfører lønn');
    await clientDelegationPage.systemUserLink(name).click();
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

    const user = TEST_USERS.forretningsforer;
    const login = new loginWithUser(page);
    await login.loginWithUser(user.pid);
    await login.chooseReportee(user.aktoer);
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
      TEST_USERS.forretningsforer.org,
    );

    await page.goto(response.confirmUrl);
    await clientDelegationPage.confirmAndCreateSystemUser('Forretningsforer eiendom');
    await clientDelegationPage.systemUserLink(name).click();
    await clientDelegationPage.openAccessPackage('Forretningsforer eiendom');
    await clientDelegationPage.addCustomer(customer.label, customer.confirmation);
    await clientDelegationPage.removeCustomer(customer.confirmation);
    await clientDelegationPage.deleteSystemUser(name);
  });
});
