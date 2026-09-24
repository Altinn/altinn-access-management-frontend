import { test, expect } from 'playwright/fixture/pomFixture';
import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
import { TestdataApi } from 'playwright/util/TestdataApi';
import { LoginPage } from 'playwright/pages/LoginPage';
import { SystemUserPage } from 'playwright/pages/systemuser/SystemUserPage';
import { ClientDelegationPage } from 'playwright/pages/systemuser/ClientDelegation';

const reportArea = { annotation: { type: 'report-area', description: 'Systembruker' } };

test.describe('Systembruker - Eskaler', reportArea, () => {
  const vendorOrgNumber = '312591332';
  const systemuserOwnerOrg = '313084167';
  const regularUserPid = '09817897166'; // No accessManager privileges, may escalate requests
  const managerPid = '29849098304';
  const actorName = 'Ugjennomsiktig Usnobbet Ape';

  let api: ApiRequests;
  let name: string;
  let systemId: string;
  let externalRef: string;
  let response: { confirmUrl: string; id: string };

  test.beforeEach(async ({ reportContext }) => {
    name = '';
    api = new ApiRequests();
    name = `Playwright-e2e-eskaler-${Date.now()}`;
    reportContext.set({
      from: { pid: regularUserPid, orgNo: systemuserOwnerOrg, name: actorName },
      systemName: name,
      vendorOrgNumber,
    });
    externalRef = TestdataApi.generateExternalRef();

    systemId = await test.step('Create system', async () => {
      return await api.createSystemInSystemregisterWithAccessPackages(
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
    reportContext.set({
      from: { pid: regularUserPid, orgNo: systemuserOwnerOrg, name: actorName },
      systemId,
      systemName: name,
      vendorOrgNumber,
    });
    response = await test.step('Create system user request', async () => {
      return await api.postSystemuserRequest(
        vendorOrgNumber,
        externalRef,
        systemId,
        systemuserOwnerOrg,
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
    page,
    login,
    systemUserPage,
    browser,
    reportContext,
    runAccessibilityTest,
  }): Promise<void> => {
    await test.step('Login as regular user, select actor and escalate request', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(regularUserPid);
      await expect(systemUserPage.escalateConfirmButton).toBeVisible();
      await runAccessibilityTest.scan('forespørsel-før-eskalering');
      await systemUserPage.escalateConfirmButton.click();
      await Promise.all([page.waitForLoadState('load'), systemUserPage.finish.click()]);
    });

    const managerContext = await browser.newContext();
    const managerPage = await managerContext.newPage();
    const managerScan = runAccessibilityTest.forPage(managerPage);

    const managerLogin = new LoginPage(managerPage);
    const managerSystemUserPage = new SystemUserPage(managerPage);
    const managerClientDelegationPage = new ClientDelegationPage(managerPage);

    reportContext.set({
      from: { pid: managerPid, orgNo: systemuserOwnerOrg, name: actorName },
      systemId,
      systemName: name,
      vendorOrgNumber,
    });

    await test.step('Login as manager and choose reportee', async () => {
      await managerLogin.LoginToAccessManagement(managerPid);
      await managerLogin.selectActor(actorName);
    });

    await test.step('Find and approve escalated request', async () => {
      await managerSystemUserPage.requestsMenuItem.click();
      await managerSystemUserPage.requestLink(response.id).click();
      await expect(managerClientDelegationPage.confirmButton).toBeVisible();
      await managerScan.scan('eskalert-forespørsel');
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

    await managerScan.scan('systembruker-etter-eskalering');
    await managerContext.close();
  });

  test.afterEach(async () => {
    if (name) {
      await api.cleanUpSystemUsersForSystem(
        `${vendorOrgNumber}_${name}`,
        managerPid,
        systemuserOwnerOrg,
      );
      await api.deleteSystemInSystemRegister(vendorOrgNumber, name);
    }
  });
});
