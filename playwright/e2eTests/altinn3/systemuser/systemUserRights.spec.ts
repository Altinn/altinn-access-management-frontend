import { test, expect } from 'playwright/fixture/pomFixture';
import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
import { TestdataApi } from 'playwright/util/TestdataApi';

const vendorOrgNo = '310547891';
const partyOrgNo = '310547891';
const testUserPid = '14824497789';
const redirectUrl = 'https://altinn.no/';

const rights = [
  {
    action: 'read',
    resource: [{ id: 'urn:altinn:resource', value: 'authentication-e2e-test' }],
  },
  {
    action: 'write',
    resource: [{ id: 'urn:altinn:resource', value: 'authentication-e2e-test' }],
  },
  {
    action: 'test',
    resource: [{ id: 'urn:altinn:resource', value: 'authentication-e2e-test' }],
  },
];

test.describe('Systembruker - Samme ressurs med ulike handlinger', () => {
  test.describe.configure({ mode: 'serial' });

  let api: ApiRequests;
  let name: string;
  let systemId: string;
  let externalRef: string;
  let systemUserId: string | undefined;

  test.beforeEach(async () => {
    api = new ApiRequests();
    name = `Playwright-e2e-rights-${Date.now()}`;
    externalRef = TestdataApi.generateExternalRef();
    systemUserId = undefined;

    systemId =
      await test.step('Create system with read and write rights on same resource', async () => {
        return await api.createSystemInSystemregisterWithAccessPackages(
          vendorOrgNo,
          name,
          [],
          redirectUrl,
          rights,
        );
      });
  });

  test.afterEach(async () => {
    if (systemUserId) {
      try {
        await api.deleteRegularSystemUser(systemUserId, partyOrgNo, testUserPid);
      } catch (error) {
        console.error('Cleanup: Failed to delete system user:', error);
      }
    }
    try {
      await api.deleteSystemInSystemRegister(vendorOrgNo, name);
    } catch (error) {
      console.error('Cleanup: Failed to delete system from register:', error);
    }
  });

  test('Godkjenn systembrukerforespørsel med read og write på samme ressurs', async ({
    page,
    login,
  }): Promise<void> => {
    const response = await test.step('Create system user request with both rights', async () => {
      return await api.postSystemuserRequest(
        vendorOrgNo,
        externalRef,
        systemId,
        partyOrgNo,
        redirectUrl,
        rights,
        [],
      );
    });

    await test.step('Navigate to confirmation page and approve', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(testUserPid);
      await page.getByRole('button', { name: 'Godkjenn' }).click();
    });

    await test.step('Verify status is Accepted and resolve system user ID', async () => {
      await expect(page).toHaveURL('https://info.altinn.no');
      const status = await api.getStatusForSystemUserRequest<{ status: string }>(
        vendorOrgNo,
        response.id,
      );
      expect(status.status).toBe('Accepted');
      systemUserId = await api.getSystemUserByQuery(vendorOrgNo, systemId, partyOrgNo, externalRef);
    });
  });

  test('Avvis systembrukerforespørsel med read og write på samme ressurs', async ({
    page,
    login,
  }): Promise<void> => {
    const response = await test.step('Create system user request with both rights', async () => {
      return await api.postSystemuserRequest(
        vendorOrgNo,
        externalRef,
        systemId,
        partyOrgNo,
        redirectUrl,
        rights,
        [],
      );
    });

    await test.step('Navigate to confirmation page and reject', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(testUserPid);
      await page.getByRole('button', { name: 'Avvis' }).click();
    });

    await test.step('Verify status is Rejected', async () => {
      await expect(page).toHaveURL('https://info.altinn.no');
      const status = await api.getStatusForSystemUserRequest<{ status: string }>(
        vendorOrgNo,
        response.id,
      );
      expect(status.status).toBe('Rejected');
    });
  });
});
