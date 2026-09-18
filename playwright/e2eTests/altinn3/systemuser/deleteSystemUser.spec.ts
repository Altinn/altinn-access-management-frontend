import { expect, test } from 'playwright/fixture/pomFixture';
import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
import { systemUserOwners } from './testdata';

const owner = systemUserOwners.deletion;
const vendorOrgNumber = '310736007';
const testUserPid = owner.pid;
const testOrgName = owner.name;

test.describe('System user deletion', () => {
  let systemName: string;
  let api: ApiRequests;

  test.beforeEach(
    async ({ login, systemUserPage, accessManagementFrontPage, systemUserCleanup }) => {
      await test.step('Setup API client', async () => {
        api = new ApiRequests();
      });

      await test.step('Login and navigate to application', async () => {
        await login.LoginToAccessManagement(testUserPid);
        await login.selectActor(testOrgName);
      });

      await test.step('Create system in system register', async () => {
        systemName = systemUserCleanup.track(owner, vendorOrgNumber, 'deletion').name;
        await api.createSystemSystemRegister(vendorOrgNumber, systemName);
      });

      await test.step('Navigate to system user page and create system user', async () => {
        await accessManagementFrontPage.systemUserMenuLink.click();
        // this is assigned as a text in code base, will just add more confusion to import that than hardcoding this here
        await systemUserPage.createSystemUserLink.click();
        await systemUserPage.selectSystem(systemName);
      });

      await test.step('Verify system user was created successfully', async () => {
        await expect(systemUserPage.systemUserCreatedHeading).toBeVisible();
        await expect(systemUserPage.systemUserLink(systemName)).toBeVisible();
      });
    },
  );

  test('Delete created system user', async ({ systemUserPage }) => {
    await test.step('Select system user to delete', async () => {
      await systemUserPage.openSystemUser(systemName);
    });

    await test.step('Delete system user and verify removal from overview', async () => {
      await systemUserPage.deleteSystemUser(systemName);
    });
  });
});
