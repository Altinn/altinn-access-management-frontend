import { expect, medTestbrukere } from 'playwright/fixture/pomFixture';
import { TestdataApi } from 'playwright/util/TestdataApi';
import type { SystemUserApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
import { loadTestdata } from 'playwright/util/testdata';
const {
  organisasjoner: [vendor],
} = loadTestdata('systemuser').requests;
const test = medTestbrukere({ owner: 'dagligLeder' });
const vendorOrgNumber = vendor.orgNo;
const prebuiltSystemId = '310547891_E2E-Playwright-Authentication';

test.describe('Godkjenn og avvis Systembrukerforespørsel', () => {
  let externalRef: string;
  let response: Awaited<ReturnType<SystemUserApiRequests['postSystemuserRequest']>>;

  test.beforeEach(async ({ owner, api }) => {
    externalRef = TestdataApi.generateExternalRef();
    response = await api.systemUsers.postSystemuserRequest(
      vendorOrgNumber,
      externalRef,
      prebuiltSystemId,
      owner.orgNo,
      'https://altinn.no/',
    );
  });

  test('Avvis Systembrukerforespørsel', async ({
    owner,
    page,
    login,
    systemUserConfirmPage,
    api,
  }): Promise<void> => {
    await test.step('Navigate to confirmation page and login', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(owner.pid);
    });

    await test.step('Reject system user request', async () => {
      await systemUserConfirmPage.reject();
    });

    await test.step('Verify logout and rejection status', async () => {
      //Expect user to be logged out
      await expect(page).toHaveURL('https://info.altinn.no');

      //Read from status api to verify that status is not rejected after clicking "Avvis"
      const statusApiRequest = await api.systemUsers.getStatusForSystemUserRequest<{
        status: string;
      }>(vendorOrgNumber, response.id);
      expect(statusApiRequest.status).toBe('Rejected');
    });
  });

  test('Godkjenn Systembrukerforespørsel', async ({
    owner,
    page,
    login,
    systemUserConfirmPage,
    api,
  }): Promise<void> => {
    await test.step('Navigate to confirmation page and login', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(owner.pid);
    });

    await test.step('Approve system user request', async () => {
      await systemUserConfirmPage.approve();
    });

    await test.step('Verify logout and acceptance status', async () => {
      //Expect user to be logged out
      await expect(page).toHaveURL('https://info.altinn.no');

      //Read from status api to verify that status is not Accepted after clicking "Avvis"
      const statusApiRequest = await api.systemUsers.getStatusForSystemUserRequest<{
        status: string;
      }>(vendorOrgNumber, response.id);
      expect(statusApiRequest.status).toBe('Accepted');
    });
  });
  test.afterEach(async ({ owner, api }) => {
    if (externalRef) {
      await api.systemUsers.cleanUpSystemUsersForSystem(
        prebuiltSystemId,
        owner.pid,
        owner.orgNo,
        false,
        externalRef,
      );
    }
  });
});
