import { test, expect } from 'playwright/fixture/pomFixture';

import { ApiRequests } from 'playwright/api-requests/ApiRequests';
import { TestdataApi } from 'playwright/util/TestdataApi';
import { env } from 'playwright/util/helper';

test.describe('Systembruker - Eskaler systembrukerforespørsel', () => {
  const vendorOrgNumber = '312591332';
  const partyOrgNo = '313084167';
  const regularUserPid = '09817897166';
  const managerPid = '29849098304';

  let api: ApiRequests;
  let name: string;
  let systemId: string;
  let externalRef: string;
  let response: { confirmUrl: string; id: string };

  test.beforeEach(async () => {
    api = new ApiRequests(vendorOrgNumber);
    name = `Playwright-e2e-eskaler-${Date.now()}`;
    externalRef = TestdataApi.generateExternalRef();

    systemId = await test.step('Create system', async () => {
      return await api.createSystemInSystemregisterWithAccessPackages(
        name,
        [
          { urn: 'urn:altinn:accesspackage:baerekraft' },
          { urn: 'urn:altinn:accesspackage:forretningsforer-eiendom' },
        ],
        'https://example.com/',
      );
    });
    console.log('systemId', systemId);
    response = await test.step('Create system user request', async () => {
      return await api.postSystemuserRequest(externalRef, systemId, partyOrgNo);
    });
  });

  test.afterEach(async () => {
    try {
      await api.deleteRegularSystemUser(systemId, partyOrgNo, managerPid);
    } catch (error) {
      console.error('Cleanup: Failed to delete system user:', error);
    }
    try {
      await api.deleteSystemInSystemRegister(name);
    } catch (error) {
      console.error('Cleanup: Failed to delete system from system register:', error);
    }
  });

  test('Eskaler systembruker', async ({
    page,
    login,
    accessManagementFrontPage,
    systemUserPage,
    clientDelegationPage,
  }): Promise<void> => {
    await test.step('Login as regular user, select actor and escalate request', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(regularUserPid);
      await systemUserPage.escalateConfirmButton.click();
      await systemUserPage.finish.click();
    });

    await test.step('Login as manager and navigate to system access', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement(managerPid);
      await login.chooseReportee(partyOrgNo, 'Ugjennomsiktig Usnobbet Ape');
      await accessManagementFrontPage.systemAccessLink.click();
    });

    await test.step('Find and approve escalated request', async () => {
      await systemUserPage.requestsMenuItem.click();
      await systemUserPage.requestLink(response.id).click();
      await expect(clientDelegationPage.confirmButton).toBeVisible();
      await clientDelegationPage.confirmButton.click();
    });
  });
});
