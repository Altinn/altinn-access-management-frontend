import { test, expect } from 'playwright/fixture/pomFixture';

import { TestdataApi } from 'playwright/util/TestdataApi';
import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
import { systemUserOwners } from './testdata';

const owner = systemUserOwners.requests;
const vendorOrgNumber = '310547891';
const testUserPid = owner.pid;

test.describe('Godkjenn og avvis Systembrukerforespørsel', () => {
  let api: ApiRequests;
  let response: Awaited<ReturnType<ApiRequests['postSystemuserRequest']>>;

  test.beforeEach(async ({ systemUserCleanup }) => {
    api = new ApiRequests();
    const externalRef = TestdataApi.generateExternalRef();
    const system = systemUserCleanup.track(owner, vendorOrgNumber, 'requests');
    await api.createSystemInSystemregisterWithAccessPackages(
      vendorOrgNumber,
      system.name,
      [{ urn: 'urn:altinn:accesspackage:baerekraft' }, { urn: 'urn:altinn:accesspackage:plansak' }],
      'https://altinn.no/',
      [
        { resource: [{ value: 'authentication-e2e-test', id: 'urn:altinn:resource' }] },
        { resource: [{ value: 'vegardtestressurs', id: 'urn:altinn:resource' }] },
      ],
    );
    response = await api.postSystemuserRequest(
      vendorOrgNumber,
      externalRef,
      system.id,
      owner.orgNo,
      'https://altinn.no/',
    );
  });

  test('Avvis Systembrukerforespørsel', async ({
    page,
    login,
    systemUserConfirmPage,
  }): Promise<void> => {
    await test.step('Navigate to confirmation page and login', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(testUserPid);
    });

    await test.step('Reject system user request', async () => {
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
  }): Promise<void> => {
    await test.step('Navigate to confirmation page and login', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(testUserPid);
    });

    await test.step('Approve system user request', async () => {
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
});
