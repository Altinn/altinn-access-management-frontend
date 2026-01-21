import { test, expect } from 'playwright/fixture/pomFixture';

import { FacilitatorRole, loadCustomers, loadFacilitator } from '../../util/loadFacilitators';
import { ClientDelegationPage } from '../../pages/systemuser/ClientDelegation';
import { AccessManagementFrontPage } from '../../pages/AccessManagementFrontPage';
import { ApiRequests } from '../../api-requests/ApiRequests';

test.describe('Delegering av klienter til Systembruker', () => {
  let api: ApiRequests;

  test.beforeEach(() => {
    const orgNumber = '310547891'; // Hardcoded org ID for testing
    api = new ApiRequests(orgNumber);
  });

  test.describe('Ansvarlig revisor', () => {
    const role = FacilitatorRole.Revisor;
    const accessPackageApiName = 'ansvarlig-revisor';
    const accessPackageDisplayName = 'Ansvarlig revisor';

    let user: ReturnType<typeof loadFacilitator>;
    let name: string;
    let clientDelegationPage: ClientDelegationPage;
    let response: { confirmUrl: string };

    test.beforeEach(async ({ page }) => {
      user = loadFacilitator(role);
      name = `Playwright-e2e-${role}-${Date.now()}-${Math.random()}`;
      clientDelegationPage = new ClientDelegationPage(page);

      const systemId = await test.step('Create system with access packages', async () => {
        return await api.createSystemInSystemregisterWithAccessPackages(name);
      });

      response = await test.step('Create client delegation agent request', async () => {
        return await api.postClientDelegationAgentRequest(systemId, accessPackageApiName, user.org);
      });
    });

    test('Ansvarlig revisor - add all customers with one click', async ({ page, login }) => {
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

      await test.step('Open system user and delegate all customers with one click', async () => {
        await clientDelegationPage.openSystemUser(accessPackageDisplayName);
        await clientDelegationPage.addAllCustomers();
        await clientDelegationPage.confirmAndCloseButton.click();
      });

      await test.step('Cleanup: Delete system user', async () => {
        await clientDelegationPage.deleteSystemUser(name);
      });
    });
  });

  test.describe('Regnskapsfører', () => {
    const role = FacilitatorRole.Regnskapsfoerer;
    const accessPackageApiName = 'regnskapsforer-lonn';
    const accessPackageDisplayName = 'Regnskapsfører lønn';

    let user: ReturnType<typeof loadFacilitator>;
    let customers: ReturnType<typeof loadCustomers>;
    let name: string;
    let clientDelegationPage: ClientDelegationPage;
    let response: { confirmUrl: string };

    test.beforeEach(async ({ page }) => {
      user = loadFacilitator(role);
      customers = loadCustomers(role);
      name = `Playwright-e2e-${role}-${Date.now()}-${Math.random()}`;
      clientDelegationPage = new ClientDelegationPage(page);

      const systemId = await test.step('Create system with access packages', async () => {
        return await api.createSystemInSystemregisterWithAccessPackages(name);
      });

      response = await test.step('Create client delegation agent request', async () => {
        return await api.postClientDelegationAgentRequest(systemId, accessPackageApiName, user.org);
      });
    });

    test('Regnskapsfører', async ({ page, login }) => {
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

  test.describe('Forretningsfører', () => {
    const role = FacilitatorRole.Forretningsfoerer;
    const accessPackageApiName = 'forretningsforer-eiendom';
    const accessPackageDisplayName = 'Forretningsforer eiendom';

    let user: ReturnType<typeof loadFacilitator>;
    let customers: ReturnType<typeof loadCustomers>;
    let name: string;
    let clientDelegationPage: ClientDelegationPage;
    let response: { confirmUrl: string };

    test.beforeEach(async ({ page }) => {
      user = loadFacilitator(role);
      customers = loadCustomers(role);
      name = `Playwright-e2e-${role}-${Date.now()}-${Math.random()}`;
      clientDelegationPage = new ClientDelegationPage(page);

      const systemId = await test.step('Create system with access packages', async () => {
        return await api.createSystemInSystemregisterWithAccessPackages(name);
      });

      response = await test.step('Create client delegation agent request', async () => {
        return await api.postClientDelegationAgentRequest(systemId, accessPackageApiName, user.org);
      });
    });

    test('Forretningsfører', async ({ page, login }) => {
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
});
