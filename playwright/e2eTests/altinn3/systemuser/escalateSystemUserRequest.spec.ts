import { test, expect } from 'playwright/fixture/pomFixture';

import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
import { TestdataApi } from 'playwright/util/TestdataApi';
import { env } from 'playwright/util/helper';

test.describe('Systembruker - Eskaler', () => {
  const systemuserOwnerOrg = '313084167';
  const regularUserPid = '09817897166'; // No accessManager privileges, may escalate requests
  const managerPid = '29849098304';

  let api: ApiRequests;
  let name: string;
  let systemId: string;
  let externalRef: string;
  let response: { confirmUrl: string; id: string };
  let systemUserId: string;

  test.beforeEach(async () => {
    api = new ApiRequests();
    name = `Playwright-e2e-eskaler-${Date.now()}`;
    externalRef = TestdataApi.generateExternalRef();

    systemId = await test.step('Create system', async () => {
      return await api.createSystemInSystemregisterWithAccessPackages(
        '312591332',
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
      return await api.postSystemuserRequest(
        '312591332',
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
    clientDelegationPage,
  }): Promise<void> => {
    await test.step('Login as regular user, select actor and escalate request', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(regularUserPid);
      await systemUserPage.escalateConfirmButton.click();
      await systemUserPage.finish.click();
    });

    await test.step('Login as manager and choose reportee', async () => {
      await login.LoginToAccessManagement(managerPid);
      await login.chooseReportee(systemuserOwnerOrg, 'Ugjennomsiktig Usnobbet Ape');
    });

    await test.step('Find and approve escalated request', async () => {
      await systemUserPage.requestsMenuItem.click();
      await systemUserPage.requestLink(response.id).click();
      await expect(clientDelegationPage.confirmButton).toBeVisible();
      await clientDelegationPage.confirmButton.click();
    });

    await test.step('Verify system user was created with proper rights', async () => {
      await clientDelegationPage.systemUserLink(name).click();
      systemUserId = new URL(page.url()).pathname.split('/').pop()!;
      await expect(page.getByRole('button', { name: 'Bærekraft' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'vegardendetilende' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'authentication-e2e-test' })).toBeVisible();
    });
  });

  test.afterEach(async () => {
    if (systemUserId) {
      try {
        await api.deleteRegularSystemUser(systemUserId, systemuserOwnerOrg, managerPid);
      } catch (error) {
        console.error('Cleanup: Failed to delete system user:', error);
      }
    }
    try {
      await api.deleteSystemInSystemRegister('312591332', name);
    } catch (error) {
      console.error('Cleanup: Failed to delete system from system register:', error);
    }
  });
});
