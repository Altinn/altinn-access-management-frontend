import type { Page } from '@playwright/test';
import { test, expect } from 'playwright/fixture/pomFixture';

import { FacilitatorRole, loadCustomers, loadFacilitator } from '../../util/loadFacilitators';
import { ClientDelegationPage } from '../../pages/systemuser/ClientDelegation';
import { LoginPage } from '../../pages/LoginPage';
import { AccessManagementFrontPage } from '../../pages/AccessManagementFrontPage';
import { ApiRequests } from '../../api-requests/ApiRequests';

test.describe('Klientdelegering', () => {
  let api: ApiRequests;

  test.beforeEach(() => {
    const orgNumber = '310547891'; // Hardcoded org ID for testing
    api = new ApiRequests(orgNumber);
  });

  test('Ansvarlig revisor', async ({ page, login }) => {
    await runDelegationTest({
      page,
      login,
      role: FacilitatorRole.Revisor,
      accessPackageApiName: 'ansvarlig-revisor',
      accessPackageDisplayName: 'Ansvarlig revisor',
      removeCustomers: true,
    });
  });

  test('Regnskapsfører', async ({ page, login }) => {
    await runDelegationTest({
      page,
      login,
      role: FacilitatorRole.Regnskapsfoerer,
      accessPackageApiName: 'regnskapsforer-lonn',
      accessPackageDisplayName: 'Regnskapsfører lønn',
      removeCustomers: false,
    });
  });

  test('Forretningsfører', async ({ page, login }) => {
    await runDelegationTest({
      page,
      login,
      role: FacilitatorRole.Forretningsfoerer,
      accessPackageApiName: 'forretningsforer-eiendom',
      accessPackageDisplayName: 'Forretningsforer eiendom',
      removeCustomers: false,
    });
  });

  async function runDelegationTest({
    page,
    login,
    role,
    accessPackageApiName,
    accessPackageDisplayName,
    removeCustomers,
  }: {
    page: Page;
    login: LoginPage;
    role: FacilitatorRole;
    accessPackageApiName: string;
    accessPackageDisplayName: string;
    removeCustomers: boolean;
  }) {
    const user = loadFacilitator(role);
    const customers = loadCustomers(role);

    const name = `Playwright-e2e-${role}-${Date.now()}-${Math.random()}`;

    const systemId = await test.step('Create system with access packages', async () => {
      return await api.createSystemInSystemregisterWithAccessPackages(name);
    });

    const clientDelegationPage = new ClientDelegationPage(page);

    const response = await test.step('Create client delegation agent request', async () => {
      return await api.postClientDelegationAgentRequest(systemId, accessPackageApiName, user.org);
    });

    await test.step('Approve system user request', async () => {
      //Navigate to approve system user request URL returned by API
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(user.pid);

      //Approve system user and click it
      await clientDelegationPage.confirmAndCreateSystemUser(accessPackageDisplayName);

      // Verify logout by checking for login page elements
      await expect(login.loginButton).toBeVisible();
    });

    await test.step('Login and navigate to system user', async () => {
      // Navigate to system user login page
      await login.LoginToAccessManagement(user.pid);
      // Use facilitator name if available, otherwise fallback to placeholder
      const reporteeName = user.name;
      await login.chooseReportee(user.pidName, reporteeName);

      //Go to system user overview page via menu link
      const frontPage = new AccessManagementFrontPage(page);
      await frontPage.systemAccessLink.click();

      await expect(clientDelegationPage.systemUserLink(name)).toBeVisible();
      await clientDelegationPage.systemUserLink(name).click();
    });

    await test.step('Open access package and delegate customers to system user', async () => {
      await clientDelegationPage.openAccessPackage(accessPackageDisplayName);

      // Add customers to system user
      for (const customer of customers) {
        await clientDelegationPage.addCustomer(
          customer.label,
          customer.confirmation,
          customer.orgnummer,
        );

        // Only remove customers if removeCustomers is true
        if (removeCustomers) {
          await clientDelegationPage.removeCustomer(customer.confirmation);
        }
      }
    });

    await test.step('Cleanup: Delete system user', async () => {
      await clientDelegationPage.deleteSystemUser(name);
    });
  }
});
