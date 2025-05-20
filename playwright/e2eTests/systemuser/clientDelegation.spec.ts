import type { Page } from '@playwright/test';
import { test, expect } from '@playwright/test';

import { FacilitatorRole, loadCustomers, loadFacilitator } from '../../util/loadFacilitators';
import { ClientDelegationPage } from '../../pages/systemuser/ClientDelegation';
import { loginAs } from '../../pages/loginPage';
import { ApiRequests } from '../../api-requests/ApiRequests';

test.describe.configure({ timeout: 30000 });

test.describe.skip('Klientdelegering', () => {
  let api: ApiRequests;
  test.slow();

  test.beforeEach(() => {
    api = new ApiRequests();
  });

  test('Ansvarlig revisor', async ({ page }) => {
    await runDelegationTest({
      page,
      role: FacilitatorRole.Revisor,
      accessPackageApiName: 'ansvarlig-revisor',
      accessPackageDisplayName: 'Ansvarlig revisor',
    });
  });

  test('Regnskapsfører', async ({ page }) => {
    await runDelegationTest({
      page,
      role: FacilitatorRole.Regnskapsfoerer,
      accessPackageApiName: 'regnskapsforer-lonn',
      accessPackageDisplayName: 'Regnskapsfører lønn',
    });
  });

  test('Forretningsfører', async ({ page }) => {
    await runDelegationTest({
      page,
      role: FacilitatorRole.Forretningsfoerer,
      accessPackageApiName: 'forretningsforer-eiendom',
      accessPackageDisplayName: 'Forretningsforer eiendom',
    });
  });

  async function runDelegationTest({
    page,
    role,
    accessPackageApiName,
    accessPackageDisplayName,
  }: {
    page: Page;
    role: FacilitatorRole;
    accessPackageApiName: string;
    accessPackageDisplayName: string;
  }) {
    const user = loadFacilitator(role);
    const customers = loadCustomers(role);
    await loginAs(page, user.pid, user.org);

    const name = `Playwright-e2e-${role}-${Date.now()}-${Math.random()}`;
    const systemId = await api.createSystemInSystemregisterWithAccessPackages(name);
    const clientDelegationPage = new ClientDelegationPage(page);

    const response = await api.postClientDelegationAgentRequest(
      systemId,
      accessPackageApiName,
      user.org,
    );

    //Navigate to approve system user request URL returned by API
    await page.goto(response.confirmUrl);

    //Approve system user and click it
    await clientDelegationPage.confirmAndCreateSystemUser(accessPackageDisplayName);
    await expect(clientDelegationPage.systemUserLink(name)).toBeVisible();
    await clientDelegationPage.systemUserLink(name).click();

    await clientDelegationPage.openAccessPackage(accessPackageDisplayName);

    // Add customers to system user and remove them after so you can delete system user
    for (const customer of customers) {
      await clientDelegationPage.addCustomer(
        customer.label,
        customer.confirmation,
        customer.orgnummer,
      );

      await clientDelegationPage.removeCustomer(customer.confirmation);
    }

    //Cleanup: All clients need to be removed (api validatoin) to delete system user
    await clientDelegationPage.deleteSystemUser(name);
  }
});
