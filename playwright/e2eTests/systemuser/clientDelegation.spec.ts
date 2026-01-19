import { test, expect } from 'playwright/fixture/pomFixture';

import { FacilitatorRole, loadCustomers, loadFacilitator } from '../../util/loadFacilitators';
import { ClientDelegationPage } from '../../pages/systemuser/ClientDelegation';
import { AccessManagementFrontPage } from '../../pages/AccessManagementFrontPage';
import { ApiRequests } from '../../api-requests/ApiRequests';

test.describe('Klientdelegering', () => {
  let api: ApiRequests;

  test.beforeEach(() => {
    const orgNumber = '310547891'; // Hardcoded org ID for testing
    api = new ApiRequests(orgNumber);
  });

  test('Ansvarlig revisor', async ({ page, login }) => {
    const role = FacilitatorRole.Revisor;
    const accessPackageApiName = 'ansvarlig-revisor';
    const accessPackageDisplayName = 'Ansvarlig revisor';

    const user = loadFacilitator(role);
    const name = `Playwright-e2e-${role}-${Date.now()}-${Math.random()}`;

    const clientDelegationPage = new ClientDelegationPage(page);

    const systemId = await test.step('Create system with access packages', async () => {
      return await api.createSystemInSystemregisterWithAccessPackages(name);
    });

    const response = await test.step('Create client delegation agent request', async () => {
      return await api.postClientDelegationAgentRequest(systemId, accessPackageApiName, user.org);
    });

    await test.step('Approve system user request', async () => {
      // Navigate to approve system user request URL returned by API
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(user.pid);

      // Approve system user and click it
      await clientDelegationPage.confirmAndCreateSystemUser(accessPackageDisplayName);

      // Verify logout by checking for login page elements
      await expect(login.loginButton).toBeVisible();
    });

    await test.step('Login and navigate to system user', async () => {
      // Navigate to system user login page
      await login.LoginToAccessManagement(user.pid);
      const reporteeName = user.name;
      await login.chooseReportee(user.pidName, reporteeName);

      // Go to system user overview page via menu link
      const frontPage = new AccessManagementFrontPage(page);
      await frontPage.systemAccessLink.click();

      await expect(clientDelegationPage.systemUserLink(name)).toBeVisible();
      await clientDelegationPage.systemUserLink(name).click();
    });

    await test.step('Open System User and delegate customers', async () => {
      await clientDelegationPage.openSystemUser(accessPackageDisplayName);

      // Add customers using "Legg til alle kunder"
      await clientDelegationPage.addAllCustomers();

      // Close modal
      await clientDelegationPage.confirmAndCloseButton.click();
    });

    await test.step('Cleanup: Delete system user', async () => {
      await clientDelegationPage.deleteSystemUser(name);
    });
  });

  test('Regnskapsfører', async ({ page, login }) => {
    const role = FacilitatorRole.Regnskapsfoerer;
    const accessPackageApiName = 'regnskapsforer-lonn';
    const accessPackageDisplayName = 'Regnskapsfører lønn';

    const user = loadFacilitator(role);
    const customers = loadCustomers(role);
    const name = `Playwright-e2e-${role}-${Date.now()}-${Math.random()}`;

    const clientDelegationPage = new ClientDelegationPage(page);

    const systemId = await test.step('Create system with access packages', async () => {
      return await api.createSystemInSystemregisterWithAccessPackages(name);
    });

    const response = await test.step('Create client delegation agent request', async () => {
      return await api.postClientDelegationAgentRequest(systemId, accessPackageApiName, user.org);
    });

    await test.step('Approve system user request', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(user.pid);
      await clientDelegationPage.confirmAndCreateSystemUser(accessPackageDisplayName);
      await expect(login.loginButton).toBeVisible();
    });

    await test.step('Login and navigate to system user', async () => {
      await login.LoginToAccessManagement(user.pid);
      const reporteeName = user.name;
      await login.chooseReportee(user.pidName, reporteeName);

      const frontPage = new AccessManagementFrontPage(page);
      await frontPage.systemAccessLink.click();

      await expect(clientDelegationPage.systemUserLink(name)).toBeVisible();
      await clientDelegationPage.systemUserLink(name).click();
    });

    await test.step('Open system user and delegate customers', async () => {
      await clientDelegationPage.openSystemUser(accessPackageDisplayName);

      for (const customer of customers) {
        await clientDelegationPage.addCustomer(
          customer.label,
          customer.confirmation,
          customer.orgnummer,
        );
      }
    });

    await test.step('Cleanup: Delete system user', async () => {
      await clientDelegationPage.deleteSystemUser(name);
    });
  });

  test('Forretningsfører', async ({ page, login }) => {
    const role = FacilitatorRole.Forretningsfoerer;
    const accessPackageApiName = 'forretningsforer-eiendom';
    const accessPackageDisplayName = 'Forretningsforer eiendom';

    const user = loadFacilitator(role);
    const customers = loadCustomers(role);
    const name = `Playwright-e2e-${role}-${Date.now()}-${Math.random()}`;

    const clientDelegationPage = new ClientDelegationPage(page);

    const systemId = await test.step('Create system with access packages', async () => {
      return await api.createSystemInSystemregisterWithAccessPackages(name);
    });

    const response = await test.step('Create client delegation agent request', async () => {
      return await api.postClientDelegationAgentRequest(systemId, accessPackageApiName, user.org);
    });

    await test.step('Approve system user request', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(user.pid);
      await clientDelegationPage.confirmAndCreateSystemUser(accessPackageDisplayName);
      await expect(login.loginButton).toBeVisible();
    });

    await test.step('Login and navigate to system user', async () => {
      await login.LoginToAccessManagement(user.pid);
      const reporteeName = user.name;
      await login.chooseReportee(user.pidName, reporteeName);

      const frontPage = new AccessManagementFrontPage(page);
      await frontPage.systemAccessLink.click();

      await expect(clientDelegationPage.systemUserLink(name)).toBeVisible();
      await clientDelegationPage.systemUserLink(name).click();
    });

    await test.step('Open system user and delegate customers', async () => {
      await clientDelegationPage.openSystemUser(accessPackageDisplayName);

      for (const customer of customers) {
        await clientDelegationPage.addCustomer(
          customer.label,
          customer.confirmation,
          customer.orgnummer,
        );
      }
    });

    await test.step('Cleanup: Delete system user', async () => {
      await clientDelegationPage.deleteSystemUser(name);
    });
  });
});
