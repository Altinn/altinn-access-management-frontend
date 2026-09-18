import { test, expect } from 'playwright/fixture/pomFixture';
import { TestdataApi } from 'playwright/util/TestdataApi';
import { env } from 'playwright/util/helper';
import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
import { systemUserOwners } from './testdata';

const owner = systemUserOwners.changes;
const vendorOrgNumber = '310547891';
const testUserPid = owner.pid;
const testOrgName = owner.name;

const testUser = testUserPid;

const changeRequest = {
  requiredRights: [{ resource: [{ value: 'vegardtestressurs', id: 'urn:altinn:resource' }] }],
  unwantedRights: [{ resource: [{ value: 'authentication-e2e-test', id: 'urn:altinn:resource' }] }],
  requiredAccessPackages: [{ urn: 'urn:altinn:accesspackage:plansak' }],
  unwantedAccessPackages: [{ urn: 'urn:altinn:accesspackage:baerekraft' }],
};

test.describe('Systembruker endringsforespørsel', () => {
  let api: ApiRequests;
  let systemUserId: string;
  let changeRequestResponse: Awaited<ReturnType<ApiRequests['postSystemuserChangeRequest']>>;

  test.beforeEach(async ({ systemUserCleanup }) => {
    api = new ApiRequests();
    const externalRef = TestdataApi.generateExternalRef();
    const system = systemUserCleanup.track(owner, vendorOrgNumber, 'changes');
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

    const response = await api.postSystemuserRequest(
      vendorOrgNumber,
      externalRef,
      system.id,
      owner.orgNo,
      undefined,
      [{ resource: [{ value: 'authentication-e2e-test', id: 'urn:altinn:resource' }] }],
    );
    await api.approveSystemuserRequest(response.id, owner.orgNo, testUserPid);

    systemUserId = await api.getSystemUserByQuery(
      vendorOrgNumber,
      system.id,
      owner.orgNo,
      externalRef,
    );

    changeRequestResponse = await api.postSystemuserChangeRequest(
      vendorOrgNumber,
      systemUserId,
      changeRequest,
    );
  });

  test('Avvis endringsforespørsel', async ({
    page,
    login,
    systemUserConfirmPage,
  }): Promise<void> => {
    await test.step('Navigate to change request confirmation page and login', async () => {
      await page.goto(changeRequestResponse.confirmUrl);
      await login.loginNotChoosingActor(testUser);
    });

    await test.step('Reject change request', async () => {
      await systemUserConfirmPage.reject();
    });

    await test.step('Verify rejection status', async () => {
      await expect(login.loginButton).toBeVisible();

      const statusApiRequest = await api.getStatusForSystemUserChangeRequest<{ status: string }>(
        vendorOrgNumber,
        changeRequestResponse.id,
      );

      expect(statusApiRequest.status).toBe('Rejected');
    });
  });

  test('Godkjenn endringsforespørsel', async ({
    page,
    login,
    systemUserConfirmPage,
  }): Promise<void> => {
    await test.step('Navigate to change request confirmation page and login', async () => {
      await page.goto(changeRequestResponse.confirmUrl);
      await login.loginNotChoosingActor(testUser);
    });

    await test.step('Approve change request', async () => {
      await systemUserConfirmPage.approve();
    });

    await test.step('Verify acceptance status', async () => {
      //Look for login button
      await expect(login.loginButton).toBeVisible();

      //Read from status api to verify that status is not Accepted after clicking "Approve"
      const statusApiRequest = await api.getStatusForSystemUserChangeRequest<{ status: string }>(
        vendorOrgNumber,
        changeRequestResponse.id,
      );
      expect(statusApiRequest.status).toBe('Accepted');
    });

    await test.step('Verify rights changes are reflected', async () => {
      await login.LoginToAccessManagement(testUser);
      await login.selectActor(testOrgName);

      const systemUserUrl = `${env('SYSTEMUSER_URL')}`;
      await page.goto(systemUserUrl + '/' + systemUserId);

      // Added by change request
      await expect(page.getByText('vegardendetilende')).toBeVisible();
      await expect(page.getByText('Plansak')).toBeVisible();

      // Removed by change request
      await expect(page.getByText('authentication-e2e-test')).not.toBeVisible();
      await expect(page.getByText('Baerekraft')).not.toBeVisible();
    });
  });
});
