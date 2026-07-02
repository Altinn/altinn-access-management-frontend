import { expect, test } from 'playwright/fixture/pomFixture';
import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
import { TestdataApi } from 'playwright/util/TestdataApi';
import { TenorTestData, type TenorDagligLederMedOrg } from 'playwright/tenor/TenorTestData';

// Leverandør er registrert infrastruktur (ikke Tenor). Eier-virksomheten som
// oppretter og sletter systembrukeren hentes fra Tenor.
const vendorOrgNumber = '310736007';

test.describe('System user deletion', () => {
  const tenor = new TenorTestData();
  let systemId: string;
  let api: ApiRequests;
  let owner: TenorDagligLederMedOrg;

  test.beforeEach(async ({ login, systemUserPage, accessManagementFrontPage }) => {
    await test.step('Setup API client', async () => {
      api = new ApiRequests();
    });

    await test.step('Login and navigate to application', async () => {
      owner = await tenor.dagligLederMedOrg();
      await login.LoginToAccessManagement(owner.dagligLeder.pid);
      await login.selectMainUnitBySearching(owner.org.navn);
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

  test('Delete created system user', async ({ systemUserPage }) => {
    await test.step('Select system user to delete', async () => {
      await systemUserPage.openSystemUser(systemId);
    });

    await test.step('Delete system user and verify removal from overview', async () => {
      await systemUserPage.deleteSystemUser(systemId);
    });
  });

  test.afterEach(async () => {
    if (systemId) {
      // Remove system
      await TestdataApi.removeSystem(vendorOrgNumber, systemId);
    }
  });
});
