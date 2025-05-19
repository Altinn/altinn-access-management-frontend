import test from '@playwright/test';

import { ClientDelegationPage } from '../../pages/systemuser/ClientDelegation';
import { loginAs } from '../../pages/loginPage';
import { ApiRequests } from '../../api-requests/ApiRequests';

test.describe.configure({ timeout: 40000 });
// Skipping these tests until this bug is fixed, these tests will keep failing in AT envirnoments until /GET Delegations work: https://github.com/Altinn/altinn-authorization-tmp/issues/689

const TEST_USERS = {
  revisorRegnskapsfoerer: {
    pid: '06857897380',
    org: '314250052',
  },
  forretningsforer: {
    pid: '02895998748',
    org: '313351203',
  },
  forretningsfoererEsek: {
    pid: '11866799328',
    org: '314239431',
  },
};

test.describe('Klientdelegering for Regnskapsfører og revisor', () => {
  let api: ApiRequests;

  test.beforeEach(async ({ page }) => {
    api = new ApiRequests();
    const user = TEST_USERS.revisorRegnskapsfoerer;
    await loginAs(page, user.pid, user.org);
  });

  test('Legg til og slett kunde og slett Systembruker: Ansvarlig revisor', async ({ page }) => {
    const name = `Playwright-e2e-revisor-${Date.now()}-${Math.random()}`;

    const customer = {
      label: 'HUSLØS DJERV TIGER',
      confirmation: 'HUSLØS DJERV TIGER AS',
      orgnummer: '313318788',
    };

    const systemId = await api.createSystemInSystemregisterWithAccessPackages(name);
    const clientDelegationPage = new ClientDelegationPage(page);
    const accessPackage = 'ansvarlig-revisor';

    const response = await api.postClientDelegationAgentRequest(
      systemId,
      accessPackage,
      TEST_USERS.revisorRegnskapsfoerer.org,
    );

    await page.goto(response.confirmUrl);

    await clientDelegationPage.confirmAndCreateSystemUser('Ansvarlig revisor');
    await clientDelegationPage.systemUserLink(name).click();
    await clientDelegationPage.openAccessPackage('Ansvarlig revisor');
    await clientDelegationPage.addCustomer(
      customer.label,
      customer.confirmation,
      customer.orgnummer,
    );
    await clientDelegationPage.removeCustomer(customer.confirmation);
    await clientDelegationPage.deleteSystemUser(name);
  });

  test('Legg til og slett kunde og slett Systembruker: Regnskapsfører', async ({ page }) => {
    const name = `Playwright-e2e-regnskapsforer-${Date.now()}-${Math.random()}`;
    const customer = {
      label: 'FINTFØLENDE GJESTFRI HAMSTER',
      confirmation: 'FINTFØLENDE GJESTFRI HAMSTER KF',
      orgnummer: '313334333',
    };

    const systemId = await api.createSystemInSystemregisterWithAccessPackages(name);
    const clientDelegationPage = new ClientDelegationPage(page);
    const accessPackage = 'regnskapsforer-lonn';

    const response = await api.postClientDelegationAgentRequest(
      systemId,
      accessPackage,
      TEST_USERS.revisorRegnskapsfoerer.org,
    );

    await page.goto(response.confirmUrl);
    await clientDelegationPage.confirmAndCreateSystemUser('Regnskapsfører lønn');
    await clientDelegationPage.systemUserLink(name).click();
    await clientDelegationPage.openAccessPackage('Regnskapsfører lønn');
    await clientDelegationPage.addCustomer(
      customer.label,
      customer.confirmation,
      customer.orgnummer,
    );
    await clientDelegationPage.removeCustomer(customer.confirmation);
    await clientDelegationPage.deleteSystemUser(name);
  });
});
test.describe('Forretningsfører', () => {
  let api: ApiRequests;

  test.beforeEach(async ({ page }) => {
    api = new ApiRequests();

    const user = TEST_USERS.forretningsfoererEsek;
    await loginAs(page, user.pid, user.org);
  });

  test('Legg til og slett kunde og slett Systembruker DEBUG', async ({ page }) => {
    const name = `Playwright-e2e-forretningsforer-${Date.now()}-${Math.random()}`;
    const customer = {
      label: 'SAMEIET UTSTRAKT STILLE LØVE',
      confirmation: 'SAMEIET UTSTRAKT STILLE LØVE',
      orgnummer: '311707086',
    };

    const systemId = await api.createSystemInSystemregisterWithAccessPackages(name);
    const clientDelegationPage = new ClientDelegationPage(page);
    const accessPackage = 'forretningsforer-eiendom';

    const response = await api.postClientDelegationAgentRequest(
      systemId,
      accessPackage,
      TEST_USERS.forretningsfoererEsek.org,
    );

    await page.goto(response.confirmUrl);
    await clientDelegationPage.confirmAndCreateSystemUser('Forretningsforer eiendom');
    await clientDelegationPage.systemUserLink(name).click();
    await clientDelegationPage.openAccessPackage('Forretningsforer eiendom');
    await clientDelegationPage.addCustomer(
      customer.label,
      customer.confirmation,
      customer.orgnummer,
    );
    await clientDelegationPage.removeCustomer(customer.confirmation);
    await clientDelegationPage.deleteSystemUser(name);
  });
});
