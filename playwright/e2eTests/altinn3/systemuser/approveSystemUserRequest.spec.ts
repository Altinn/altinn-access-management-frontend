import { systemUserOwners } from './testdata';
import { test, expect } from 'playwright/fixture/pomFixture';

import { TestdataApi } from 'playwright/util/TestdataApi';
import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
const owner = systemUserOwners.requests;
const vendorOrgNumber = '310547891';
const prebuiltSystemId = '310547891_E2E-Playwright-Authentication';
const testUserPid = owner.pid;

test.describe('Godkjenn og avvis Systembrukerforespørsel', () => {
  let api: ApiRequests;
  let externalRef: string;
  let response: Awaited<ReturnType<ApiRequests['postSystemuserRequest']>>;

  test.beforeEach(async () => {
    api = new ApiRequests();
    externalRef = TestdataApi.generateExternalRef();
    response = await api.postSystemuserRequest(
      vendorOrgNumber,
      externalRef,
      prebuiltSystemId,
      owner.orgNo,
      'https://altinn.no/',
    );
  });

  test('Avvis Systembrukerforespørsel', async ({
    page,
    login,
    systemUserConfirmPage,
    runAccessibilityTest,
  }, testInfo): Promise<void> => {
    runAccessibilityTest.setTestData({ from: owner, systemId: prebuiltSystemId, vendorOrgNumber });

    await test.step('Navigate to confirmation page and login', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(testUserPid);
    });

    await test.step('Reject system user request', async () => {
      await expect(systemUserConfirmPage.rejectButton).toBeVisible();
      await runAccessibilityTest.scan(testInfo, 'forespørsel-før-reject');
      await systemUserConfirmPage.reject();
    });

    await test.step('Verify logout and rejection status', async () => {
      //Expect user to be logged out
      await expect(page).toHaveURL('https://info.altinn.no');

      //Read from status api to verify that status is not rejected after clicking "Avvis"
      const statusApiRequest = await api.getStatusForSystemUserRequest<{ status: string }>(
        vendorOrgNumber,
        response.id,
      );
      expect(statusApiRequest.status).toBe('Rejected');
    });
  });

  test('Godkjenn Systembrukerforespørsel', async ({
    page,
    login,
    systemUserConfirmPage,
    runAccessibilityTest,
  }, testInfo): Promise<void> => {
    runAccessibilityTest.setTestData({ from: owner, systemId: prebuiltSystemId, vendorOrgNumber });

    await test.step('Navigate to confirmation page and login', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(testUserPid);
    });

    await test.step('Approve system user request', async () => {
      await expect(systemUserConfirmPage.approveButton).toBeVisible();
      await runAccessibilityTest.scan(testInfo, 'forespørsel-før-approve');
      await systemUserConfirmPage.approve();
    });

    await test.step('Verify logout and acceptance status', async () => {
      //Expect user to be logged out
      await expect(page).toHaveURL('https://info.altinn.no');

      //Read from status api to verify that status is not Accepted after clicking "Avvis"
      const statusApiRequest = await api.getStatusForSystemUserRequest<{ status: string }>(
        vendorOrgNumber,
        response.id,
      );
      expect(statusApiRequest.status).toBe('Accepted');
    });
  });
  test.afterEach(async () => {
    if (externalRef) {
      await api.cleanUpSystemUsersForSystem(
        prebuiltSystemId,
        owner.pid,
        owner.orgNo,
        false,
        externalRef,
      );
    }
  });
});
