import { test, expect } from '../../../fixture/pomFixture';

import { ClientDelegationPage } from '../../../pages/systemuser/ClientDelegation';
import { AccessManagementFrontPage } from '../../../pages/AccessManagementFrontPage';
import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';

interface Facilitator {
  pid: string;
  org: string;
  name: string;
}

interface Customer {
  label: string;
  confirmation: string;
  orgnummer: string;
}

test.describe('Delegering av klienter til Systembruker', () => {
  let api: ApiRequests;

  test.beforeEach(() => {
    api = new ApiRequests();
  });

  test.describe('Ansvarlig revisor', () => {
    const role = 'revisor';
    const accessPackageApiName = 'ansvarlig-revisor';
    const accessPackageDisplayName = 'Ansvarlig revisor';

    const user: Facilitator = {
      pid: '07875898560',
      org: '314251768',
      name: 'KUNST STERK MINK ANS',
    };

    let name: string;
    let clientDelegationPage: ClientDelegationPage;
    let response: { confirmUrl: string };

    test.beforeEach(async ({ page }) => {
      name = `Playwright-e2e-${role}-${Date.now()}-${Math.random()}`;
      clientDelegationPage = new ClientDelegationPage(page);

      const systemId = await test.step('Create system with access packages', async () => {
        return await api.createSystemInSystemregisterWithAccessPackages('310547891', name);
      });

      response = await test.step('Create client delegation agent request', async () => {
        return await api.postClientDelegationAgentRequest(
          '310547891',
          systemId,
          accessPackageApiName,
          user.org,
        );
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
        await login.selectMainUnitBySearching(user.name);

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
    const role = 'regnskapsfoerer';
    const accessPackageApiName = 'regnskapsforer-lonn';
    const accessPackageDisplayName = 'Regnskapsfører lønn';

    const user: Facilitator = {
      pid: '25872549881',
      org: '312433834',
      name: 'TILFELDIG RAKRYGGET KATT MALSTRØM',
    };

    const customers: Customer[] = [
      {
        label: 'DYP VERD TIGER AS',
        confirmation: 'DYP VERD TIGER AS',
        orgnummer: '214172542',
      },
    ];

    let name: string;
    let clientDelegationPage: ClientDelegationPage;
    let response: { confirmUrl: string };

    test.beforeEach(async ({ page }) => {
      name = `Playwright-e2e-${role}-${Date.now()}-${Math.random()}`;
      clientDelegationPage = new ClientDelegationPage(page);

      const systemId = await test.step('Create system with access packages', async () => {
        return await api.createSystemInSystemregisterWithAccessPackages('310547891', name);
      });

      response = await test.step('Create client delegation agent request', async () => {
        return await api.postClientDelegationAgentRequest(
          '310547891',
          systemId,
          accessPackageApiName,
          user.org,
        );
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
        await login.selectMainUnitBySearching(user.name);

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
    const role = 'forretningsfoerer';
    const accessPackageApiName = 'forretningsforer-eiendom';
    const accessPackageDisplayName = 'Forretningsforer eiendom';

    const user: Facilitator = {
      pid: '12826697375',
      org: '312158019',
      name: 'MOMENTAN VENNLIG TIGER AS',
    };

    const customers: Customer[] = [
      {
        label: 'SAMEIET ARTIG SKRIVEFØR LØVE',
        confirmation: 'SAMEIET ARTIG SKRIVEFØR LØVE',
        orgnummer: '213461532',
      },
    ];

    let name: string;
    let clientDelegationPage: ClientDelegationPage;
    let response: { confirmUrl: string };

    test.beforeEach(async ({ page }) => {
      name = `Playwright-e2e-${role}-${Date.now()}-${Math.random()}`;
      clientDelegationPage = new ClientDelegationPage(page);

      const systemId = await test.step('Create system with access packages', async () => {
        return await api.createSystemInSystemregisterWithAccessPackages('310547891', name);
      });

      response = await test.step('Create client delegation agent request', async () => {
        return await api.postClientDelegationAgentRequest(
          '310547891',
          systemId,
          accessPackageApiName,
          user.org,
        );
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
        await login.selectMainUnitBySearching(user.name);

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
