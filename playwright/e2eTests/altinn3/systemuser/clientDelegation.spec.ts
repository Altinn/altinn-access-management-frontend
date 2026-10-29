import { test, expect } from '../../../fixture/pomFixture';
import { loadTestdata } from '../../../util/testdata';

test.describe('Delegering av klienter til Systembruker', () => {
  const testdata = loadTestdata('systemuser');
  const {
    organisasjoner: [vendor],
  } = testdata.clientDelegation;
  const vendorOrgNumber = vendor.orgNo;

  test.describe('Ansvarlig revisor', () => {
    const role = 'revisor';
    const accessPackageApiName = 'ansvarlig-revisor';
    const accessPackageDisplayName = 'Ansvarlig revisor';

    const {
      organisasjoner: [user],
    } = testdata.revisor;

    let name: string;
    let response: { confirmUrl: string };

    test.beforeEach(async ({ api }) => {
      name = `Playwright-e2e-${role}-${Date.now()}`;

      const systemId = await test.step('Create system with access packages', async () => {
        return await api.systemUsers.createSystemInSystemregisterWithAccessPackages(
          vendorOrgNumber,
          name,
        );
      });

      response = await test.step('Create client delegation agent request', async () => {
        return await api.systemUsers.postClientDelegationAgentRequest(
          vendorOrgNumber,
          systemId,
          accessPackageApiName,
          user.orgNo,
        );
      });
    });

    test.afterEach(async ({ api }) => {
      if (name) {
        await api.systemUsers.cleanUpSystemUsersForSystem(
          `${vendorOrgNumber}_${name}`,
          user.pid,
          user.orgNo,
          true,
        );
        await api.systemUsers.deleteSystemInSystemRegister(vendorOrgNumber, name);
      }
    });

    test('Ansvarlig revisor - add all customers with one click', async ({
      page,
      login,
      accessManagementFrontPage,
      clientDelegationPage,
    }) => {
      await test.step('Approve system user request', async () => {
        await page.goto(response.confirmUrl);
        await login.loginNotChoosingActor(user.pid);
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

      await test.step('Cleanup: Delete system user', async () => {
        await clientDelegationPage.deleteSystemUser(name);
      });
    });
  });

  test.describe('Regnskapsfører', () => {
    const role = 'regnskapsfoerer';
    const accessPackageApiName = 'regnskapsforer-lonn';
    const accessPackageDisplayName = 'Regnskapsfører lønn';

    const {
      organisasjoner: [user, customer],
    } = testdata.regnskapsfoerer;
    const customers = [
      { label: customer.name, confirmation: customer.name, orgnummer: customer.orgNo },
    ];

    let name: string;
    let response: { confirmUrl: string };

    test.beforeEach(async ({ api }) => {
      name = `Playwright-e2e-${role}-${Date.now()}`;

      const systemId = await test.step('Create system with access packages', async () => {
        return await api.systemUsers.createSystemInSystemregisterWithAccessPackages(
          vendorOrgNumber,
          name,
        );
      });

      response = await test.step('Create client delegation agent request', async () => {
        return await api.systemUsers.postClientDelegationAgentRequest(
          vendorOrgNumber,
          systemId,
          accessPackageApiName,
          user.orgNo,
        );
      });
    });

    test.afterEach(async ({ api }) => {
      if (name) {
        await api.systemUsers.cleanUpSystemUsersForSystem(
          `${vendorOrgNumber}_${name}`,
          user.pid,
          user.orgNo,
          true,
        );
        await api.systemUsers.deleteSystemInSystemRegister(vendorOrgNumber, name);
      }
    });

    test('Regnskapsfører', async ({
      page,
      login,
      accessManagementFrontPage,
      clientDelegationPage,
    }) => {
      await test.step('Approve system user request', async () => {
        await page.goto(response.confirmUrl);
        await login.loginNotChoosingActor(user.pid);
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

      await test.step('Cleanup: Delete system user', async () => {
        await clientDelegationPage.deleteSystemUser(name);
      });
    });
  });

  test.describe('Forretningsfører', () => {
    const role = 'forretningsfoerer';
    const accessPackageApiName = 'forretningsforer-eiendom';
    const accessPackageDisplayName = 'Forretningsforer eiendom';

    const {
      organisasjoner: [user, customer],
    } = testdata.forretningsfoerer;
    const customers = [
      { label: customer.name, confirmation: customer.name, orgnummer: customer.orgNo },
    ];

    let name: string;
    let response: { confirmUrl: string };

    test.beforeEach(async ({ api }) => {
      name = `Playwright-e2e-${role}-${Date.now()}`;

      const systemId = await test.step('Create system with access packages', async () => {
        return await api.systemUsers.createSystemInSystemregisterWithAccessPackages(
          vendorOrgNumber,
          name,
        );
      });

      response = await test.step('Create client delegation agent request', async () => {
        return await api.systemUsers.postClientDelegationAgentRequest(
          vendorOrgNumber,
          systemId,
          accessPackageApiName,
          user.orgNo,
        );
      });
    });

    test.afterEach(async ({ api }) => {
      if (name) {
        await api.systemUsers.cleanUpSystemUsersForSystem(
          `${vendorOrgNumber}_${name}`,
          user.pid,
          user.orgNo,
          true,
        );
        await api.systemUsers.deleteSystemInSystemRegister(vendorOrgNumber, name);
      }
    });

    test('Forretningsfører', async ({
      page,
      login,
      accessManagementFrontPage,
      clientDelegationPage,
    }) => {
      await test.step('Approve system user request', async () => {
        await page.goto(response.confirmUrl);
        await login.loginNotChoosingActor(user.pid);
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

      await test.step('Cleanup: Delete system user', async () => {
        await clientDelegationPage.deleteSystemUser(name);
      });
    });
  });
});
