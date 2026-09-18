import { test, expect } from '../../../fixture/pomFixture';

import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';

test.describe('Delegering av klienter til Systembruker', () => {
  const vendorOrgNumber = '310547891';
  let api: ApiRequests;

  test.beforeEach(() => {
    api = new ApiRequests();
  });

  test.describe('Ansvarlig revisor', () => {
    const role = 'revisor';
    const accessPackageApiName = 'ansvarlig-revisor';
    const accessPackageDisplayName = 'Ansvarlig revisor';

    const user = {
      pid: '01836299988',
      orgNo: '314246993',
      name: 'ROMANTISK ULLEN TIGER AS',
    };

    let name: string;
    let response: { confirmUrl: string };

    test.beforeEach(async () => {
      name = `Playwright-e2e-${role}-${Date.now()}`;

      const systemId = await test.step('Create system with access packages', async () => {
        return await api.createSystemInSystemregisterWithAccessPackages(vendorOrgNumber, name);
      });

      response = await test.step('Create client delegation agent request', async () => {
        return await api.postClientDelegationAgentRequest(
          vendorOrgNumber,
          systemId,
          accessPackageApiName,
          user.orgNo,
        );
      });
    });

    test.afterEach(async () => {
      if (name) {
        await api.cleanUpSystemUsersForSystem(
          `${vendorOrgNumber}_${name}`,
          user.pid,
          user.orgNo,
          true,
        );
        await api.deleteSystemInSystemRegister(vendorOrgNumber, name);
      }
    });

    test('Ansvarlig revisor - add all customers with one click', async ({
      page,
      login,
      accessManagementFrontPage,
      clientDelegationPage,
      runAccessibilityTest,
    }, testInfo) => {
      runAccessibilityTest.setTestData({ from: user, systemName: name, vendorOrgNumber });

      await test.step('Approve system user request', async () => {
        await page.goto(response.confirmUrl);
        await login.loginNotChoosingActor(user.pid);
        await expect(clientDelegationPage.confirmButton).toBeVisible();
        await runAccessibilityTest.scan(testInfo, 'klientforespørsel');
        await clientDelegationPage.confirmAndCreateSystemUser(accessPackageDisplayName);
        await expect(login.loginButton).toBeVisible();
      });

      await test.step('Login and navigate to system user', async () => {
        await login.LoginToAccessManagement(user.pid);
        await login.selectActor(user.name);

        await accessManagementFrontPage.systemUserMenuLink.click();

        await expect(clientDelegationPage.systemUserLink(name)).toBeVisible();
        await clientDelegationPage.systemUserLink(name).click();
      });

      await test.step('Open system user and delegate all customers with one click', async () => {
        await clientDelegationPage.openSystemUser(accessPackageDisplayName);
        await clientDelegationPage.addAllCustomers();
        await clientDelegationPage.confirmAndCloseButton.click();
      });

      await runAccessibilityTest.scan(testInfo, 'systembruker-med-klienter');

      await test.step('Cleanup: Delete system user', async () => {
        await clientDelegationPage.deleteSystemUser(name);
      });
    });
  });

  test.describe('Regnskapsfører', () => {
    const role = 'regnskapsfoerer';
    const accessPackageApiName = 'regnskapsforer-lonn';
    const accessPackageDisplayName = 'Regnskapsfører lønn';

    const user = {
      pid: '04816298283',
      orgNo: '310309486',
      name: 'HENSYNSLØS HENSYNSLØS TIGER AS',
    };

    const customers = [
      {
        label: 'FYLDIG OMKOMMEN TIGER AS',
        confirmation: 'FYLDIG OMKOMMEN TIGER AS',
        orgnummer: '311810308',
      },
    ];

    let name: string;
    let response: { confirmUrl: string };

    test.beforeEach(async () => {
      name = `Playwright-e2e-${role}-${Date.now()}`;

      const systemId = await test.step('Create system with access packages', async () => {
        return await api.createSystemInSystemregisterWithAccessPackages(vendorOrgNumber, name);
      });

      response = await test.step('Create client delegation agent request', async () => {
        return await api.postClientDelegationAgentRequest(
          vendorOrgNumber,
          systemId,
          accessPackageApiName,
          user.orgNo,
        );
      });
    });

    test.afterEach(async () => {
      if (name) {
        await api.cleanUpSystemUsersForSystem(
          `${vendorOrgNumber}_${name}`,
          user.pid,
          user.orgNo,
          true,
        );
        await api.deleteSystemInSystemRegister(vendorOrgNumber, name);
      }
    });

    test('Regnskapsfører', async ({
      page,
      login,
      accessManagementFrontPage,
      clientDelegationPage,
      runAccessibilityTest,
    }, testInfo) => {
      runAccessibilityTest.setTestData({ from: user, systemName: name, vendorOrgNumber });

      await test.step('Approve system user request', async () => {
        await page.goto(response.confirmUrl);
        await login.loginNotChoosingActor(user.pid);
        await expect(clientDelegationPage.confirmButton).toBeVisible();
        await runAccessibilityTest.scan(testInfo, 'klientforespørsel');
        await clientDelegationPage.confirmAndCreateSystemUser(accessPackageDisplayName);
        await expect(login.loginButton).toBeVisible();
      });

      await test.step('Login and navigate to system user', async () => {
        await login.LoginToAccessManagement(user.pid);
        await login.selectActor(user.name);

        await accessManagementFrontPage.systemUserMenuLink.click();

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

      await runAccessibilityTest.scan(testInfo, 'systembruker-med-klienter');

      await test.step('Cleanup: Delete system user', async () => {
        await clientDelegationPage.deleteSystemUser(name);
      });
    });
  });

  test.describe('Forretningsfører', () => {
    const role = 'forretningsfoerer';
    const accessPackageApiName = 'forretningsforer-eiendom';
    const accessPackageDisplayName = 'Forretningsforer eiendom';

    const user = {
      pid: '26904899347',
      orgNo: '313404757',
      name: 'OVERBEVISENDE INNSIKTSFULL TIGER AS',
    };

    const customers = [
      {
        label: 'LAV TREG LØVE SAMEIE',
        confirmation: 'LAV TREG LØVE SAMEIE',
        orgnummer: '313347737',
      },
    ];

    let name: string;
    let response: { confirmUrl: string };

    test.beforeEach(async () => {
      name = `Playwright-e2e-${role}-${Date.now()}`;

      const systemId = await test.step('Create system with access packages', async () => {
        return await api.createSystemInSystemregisterWithAccessPackages(vendorOrgNumber, name);
      });

      response = await test.step('Create client delegation agent request', async () => {
        return await api.postClientDelegationAgentRequest(
          vendorOrgNumber,
          systemId,
          accessPackageApiName,
          user.orgNo,
        );
      });
    });

    test.afterEach(async () => {
      if (name) {
        await api.cleanUpSystemUsersForSystem(
          `${vendorOrgNumber}_${name}`,
          user.pid,
          user.orgNo,
          true,
        );
        await api.deleteSystemInSystemRegister(vendorOrgNumber, name);
      }
    });

    test('Forretningsfører', async ({
      page,
      login,
      accessManagementFrontPage,
      clientDelegationPage,
      runAccessibilityTest,
    }, testInfo) => {
      runAccessibilityTest.setTestData({ from: user, systemName: name, vendorOrgNumber });

      await test.step('Approve system user request', async () => {
        await page.goto(response.confirmUrl);
        await login.loginNotChoosingActor(user.pid);
        await expect(clientDelegationPage.confirmButton).toBeVisible();
        await runAccessibilityTest.scan(testInfo, 'klientforespørsel');
        await clientDelegationPage.confirmAndCreateSystemUser(accessPackageDisplayName);
        await expect(login.loginButton).toBeVisible();
      });

      await test.step('Login and navigate to system user', async () => {
        await login.LoginToAccessManagement(user.pid);
        await login.selectActor(user.name);

        await accessManagementFrontPage.systemUserMenuLink.click();

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

      await runAccessibilityTest.scan(testInfo, 'systembruker-med-klienter');

      await test.step('Cleanup: Delete system user', async () => {
        await clientDelegationPage.deleteSystemUser(name);
      });
    });
  });
});
