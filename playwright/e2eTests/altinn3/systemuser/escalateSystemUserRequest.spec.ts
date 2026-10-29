import { expect, medTestbrukere } from 'playwright/fixture/pomFixture';
import { TestdataApi } from 'playwright/util/TestdataApi';
import { loadTestdata } from 'playwright/util/testdata';
import { LoginPage } from 'playwright/pages/LoginPage';
import { SystemUserPage } from 'playwright/pages/systemuser/SystemUserPage';
import { ClientDelegationPage } from 'playwright/pages/systemuser/ClientDelegation';

// `regularUser` is connected to the owner as a plain right-holder: no access manager
// privileges, so they may escalate the request but not approve it.
const test = medTestbrukere({ owner: 'dagligLeder', regularUser: 'privatperson' });

test.describe('Systembruker - Eskaler', () => {
  const {
    organisasjoner: [vendor],
  } = loadTestdata('systemuser').escalate;
  const vendorOrgNumber = vendor.orgNo;

  let name: string;
  let systemId: string;
  let externalRef: string;
  let response: { confirmUrl: string; id: string };

  test.beforeEach(async ({ owner, regularUser, api }) => {
    name = '';
    name = `Playwright-e2e-eskaler-${Date.now()}`;
    externalRef = TestdataApi.generateExternalRef();
    await api.connections.addConnection(owner.pid, owner.orgNo, regularUser.pid);

    systemId = await test.step('Create system', async () => {
      return await api.systemUsers.createSystemInSystemregisterWithAccessPackages(
        vendorOrgNumber,
        name,
        [{ urn: 'urn:altinn:accesspackage:baerekraft' }],
        'https://example.com/',
        [
          { resource: [{ value: 'authentication-e2e-test', id: 'urn:altinn:resource' }] },
          { resource: [{ value: 'vegardtestressurs', id: 'urn:altinn:resource' }] },
        ],
      );
    });
    response = await test.step('Create system user request', async () => {
      return await api.systemUsers.postSystemuserRequest(
        vendorOrgNumber,
        externalRef,
        systemId,
        owner.orgNo,
        undefined,
        [
          { resource: [{ value: 'vegardtestressurs', id: 'urn:altinn:resource' }] },
          { resource: [{ value: 'authentication-e2e-test', id: 'urn:altinn:resource' }] },
        ],
        [{ urn: 'urn:altinn:accesspackage:baerekraft' }],
      );
    });
  });

  test('Eskaler Systembrukerforespørsel som "vanlig" bruker og godkjenn som daglig leder', async ({
    owner,
    regularUser,
    page,
    login,
    systemUserPage,
    browser,
    api,
    language,
  }): Promise<void> => {
    await test.step('Login as regular user, select actor and escalate request', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(regularUser.pid);
      await systemUserPage.escalateConfirmButton.click();
      await Promise.all([page.waitForLoadState('load'), systemUserPage.finish.click()]);
    });

    const managerContext = await browser.newContext();
    const managerPage = await managerContext.newPage();
    const managerLogin = new LoginPage(managerPage, api, language);
    const managerSystemUserPage = new SystemUserPage(managerPage, language);
    const managerClientDelegationPage = new ClientDelegationPage(managerPage, language);

    await test.step('Login as manager and choose reportee', async () => {
      await managerLogin.LoginToAccessManagement(owner.pid);
      await managerLogin.selectActor(owner.name);
    });

    await test.step('Find and approve escalated request', async () => {
      await managerSystemUserPage.requestsMenuItem.click();
      await managerSystemUserPage.requestLink(response.id).click();
      await expect(managerClientDelegationPage.confirmButton).toBeVisible();
      await managerClientDelegationPage.confirmButton.click();
    });

    await test.step('Verify system user was created with proper rights', async () => {
      await managerClientDelegationPage.systemUserLink(name).click();
      await expect(managerPage.getByRole('button', { name: 'Bærekraft' })).toBeVisible();
      await expect(managerPage.getByRole('button', { name: 'vegardendetilende' })).toBeVisible();
      await expect(
        managerPage.getByRole('button', { name: 'authentication-e2e-test' }),
      ).toBeVisible();
    });

    await managerContext.close();
  });

  test.afterEach(async ({ owner, regularUser, api }) => {
    try {
      await api.connections.deleteConnection(owner.pid, owner.orgNo, [regularUser.pid]);
    } catch (error) {
      console.error('Cleanup: Failed to delete connection:', error);
    }
    if (name) {
      await api.systemUsers.cleanUpSystemUsersForSystem(
        `${vendorOrgNumber}_${name}`,
        owner.pid,
        owner.orgNo,
      );
      await api.systemUsers.deleteSystemInSystemRegister(vendorOrgNumber, name);
    }
  });
});
