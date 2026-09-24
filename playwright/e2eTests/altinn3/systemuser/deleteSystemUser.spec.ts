import { expect, test } from 'playwright/fixture/pomFixture';
import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
import { TestdataApi } from 'playwright/util/TestdataApi';

import { systemUserOwners } from './testdata';

const reportArea = { annotation: { type: 'report-area', description: 'Systembruker' } };
const owner = systemUserOwners.deletion;
const vendorOrgNumber = '310736007';
const testUserPid = owner.pid;
const testOrgName = owner.name;

test.describe('System user deletion', reportArea, () => {
  let systemId: string;
  let api: ApiRequests;

  test.beforeEach(async ({ login, systemUserPage, accessManagementFrontPage }) => {
    await test.step('Setup API client', async () => {
      systemId = '';
      api = new ApiRequests();
    });

    await test.step('Login and navigate to application', async () => {
      await login.LoginToAccessManagement(testUserPid);
      await login.selectActor(testOrgName);
    });

    await test.step('Create system in system register', async () => {
      systemId = await api.createSystemSystemRegister(vendorOrgNumber);
    });

    await test.step('Navigate to system user page and create system user', async () => {
      await accessManagementFrontPage.systemUserMenuLink.click();
      // this is assigned as a text in code base, will just add more confusion to import that than hardcoding this here
      await systemUserPage.createSystemUserLink.click();
      await systemUserPage.selectSystem(systemId);
    });

    await test.step('Verify system user was created successfully', async () => {
      await expect(systemUserPage.systemUserCreatedHeading).toBeVisible();
      await expect(systemUserPage.systemUserLink(systemId)).toBeVisible();
    });
  });

  test('Delete created system user', async ({ systemUserPage, runAccessibilityTest }) => {
    await test.step('Select system user to delete', async () => {
      await systemUserPage.openSystemUser(systemId);
    });

    await test.step('Delete system user and verify removal from overview', async () => {
      await runAccessibilityTest.scan('systembruker-før-sletting');
      await systemUserPage.deleteSystemUser(systemId);
    });
  });

  test.afterEach(async () => {
    if (systemId) {
      await api.cleanUpSystemUsersForSystem(
        `${vendorOrgNumber}_${systemId}`,
        owner.pid,
        owner.orgNo,
      );
      // Remove system after deleting its users
      await TestdataApi.removeSystem(vendorOrgNumber, systemId);
    }
  });
});
