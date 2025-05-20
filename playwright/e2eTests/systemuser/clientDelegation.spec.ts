import test from '@playwright/test';

import { FacilitatorRole, loadAllFacilitators } from '../../util/loadFacilitators';
import { ClientDelegationPage } from '../../pages/systemuser/ClientDelegation';
import { loginAs } from '../../pages/loginPage';
import { ApiRequests } from '../../api-requests/ApiRequests';
import { loadCustomersFromCsv } from '../../util/loadTestdataFromCsv';

test.describe('Klientdelegering', () => {
  let api: ApiRequests;
  const TEST_USERS = loadAllFacilitators();
  test.describe.configure({ timeout: 40000 });

  test.beforeEach(() => {
    api = new ApiRequests();
  });

  test('Ansvarlig revisor', async ({ page }) => {
    // Setup
    const user = TEST_USERS[FacilitatorRole.Revisor];
    await loginAs(page, user.pid, user.org);

    // Test data
    const name = `Playwright-e2e-revisor-${Date.now()}-${Math.random()}`;
    const customers = loadCustomersFromCsv('e2eTests/testdata/customers/revisor.csv');

    // Action
    const systemId = await api.createSystemInSystemregisterWithAccessPackages(name);
    const clientDelegationPage = new ClientDelegationPage(page);
    const accessPackage = 'ansvarlig-revisor';

    const response = await api.postClientDelegationAgentRequest(systemId, accessPackage, user.org);

    await page.goto(response.confirmUrl);
    await clientDelegationPage.confirmAndCreateSystemUser('Ansvarlig revisor');
    await clientDelegationPage.systemUserLink(name).click();
    await clientDelegationPage.openAccessPackage('Ansvarlig revisor');

    for (const customer of customers) {
      await clientDelegationPage.addCustomer(
        customer.label,
        customer.confirmation,
        customer.orgnummer,
      );
    }

    for (const customer of customers) {
      await clientDelegationPage.removeCustomer(customer.confirmation);
    }

    await clientDelegationPage.deleteSystemUser(name);
  });

  test('Regnskapsfører', async ({ page }) => {
    // Setup
    const user = TEST_USERS.regnskapsfoerer;
    await loginAs(page, user.pid, user.org);

    // Test data
    const name = `Playwright-e2e-regnskapsforer-${Date.now()}-${Math.random()}`;
    const customers = loadCustomersFromCsv('e2eTests/testdata/customers/regnskapsforer.csv');

    // Action
    const systemId = await api.createSystemInSystemregisterWithAccessPackages(name);
    const clientDelegationPage = new ClientDelegationPage(page);
    const accessPackage = 'regnskapsforer-lonn';

    const response = await api.postClientDelegationAgentRequest(systemId, accessPackage, user.org);

    await page.goto(response.confirmUrl);
    await clientDelegationPage.confirmAndCreateSystemUser('Regnskapsfører lønn');
    await clientDelegationPage.systemUserLink(name).click();
    await clientDelegationPage.openAccessPackage('Regnskapsfører lønn');

    for (const customer of customers) {
      await clientDelegationPage.addCustomer(
        customer.label,
        customer.confirmation,
        customer.orgnummer,
      );
      await clientDelegationPage.removeCustomer(customer.confirmation);
    }

    await clientDelegationPage.deleteSystemUser(name);
  });

  test('Forretningsfører', async ({ page }) => {
    // Setup
    const user = TEST_USERS.forretningsforer;
    await loginAs(page, user.pid, user.org);

    // Test data
    const name = `Playwright-e2e-forretningsforer-${Date.now()}-${Math.random()}`;
    const customers = loadCustomersFromCsv('e2eTests/testdata/customers/forretningsforer.csv');

    // Action
    const systemId = await api.createSystemInSystemregisterWithAccessPackages(name);
    const clientDelegationPage = new ClientDelegationPage(page);
    const accessPackage = 'forretningsforer-eiendom';

    const response = await api.postClientDelegationAgentRequest(systemId, accessPackage, user.org);

    await page.goto(response.confirmUrl);
    await clientDelegationPage.confirmAndCreateSystemUser('Forretningsforer eiendom');
    await clientDelegationPage.systemUserLink(name).click();
    await clientDelegationPage.openAccessPackage('Forretningsforer eiendom');

    for (const customer of customers) {
      await clientDelegationPage.addCustomer(
        customer.label,
        customer.confirmation,
        customer.orgnummer,
      );
      await clientDelegationPage.removeCustomer(customer.confirmation);
    }

    await clientDelegationPage.deleteSystemUser(name);
  });
});
