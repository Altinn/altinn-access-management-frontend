import { expect, medTestbrukere } from 'playwright/fixture/pomFixture';
import { Language } from 'playwright/pages/LanguageMenu';
import { loadTestdata } from 'playwright/util/testdata';

const {
  organisasjoner: [vendor],
} = loadTestdata('systemuser').creation;
const test = medTestbrukere({ owner: 'dagligLeder' });

// Runs in nynorsk on purpose: exercises the before-login language pinning
// (settings API) and proves the dict-driven selectors work in a non-default
// language. The rest of the suites run in the default bokmål.
test.use({ language: Language.NN });
const vendorOrgNumber = vendor.orgNo;

test.describe('System Register', async () => {
  let system: string;

  test.beforeEach(async ({ owner, api, login }) => {
    system = '';
    system = await api.systemUsers.createSystemSystemRegister(vendorOrgNumber);
    await login.LoginToAccessManagement(owner.pid);
    await login.selectActor(owner.name);
  });

  test('Create system user and verify landing page', async ({
    systemUserPage,
    accessManagementFrontPage,
  }): Promise<void> => {
    await test.step('Navigate to system user page', async () => {
      await accessManagementFrontPage.systemUserMenuLink.click();
    });

    await test.step('Create system user', async () => {
      // this is assigned as a text in code base, will just add more confusion to import that than hardcoding this here
      await systemUserPage.createSystemUserLink.click();
      await systemUserPage.selectSystem(system);
    });

    await test.step('Verify system user created', async () => {
      await expect(systemUserPage.systemUserCreatedHeading).toBeVisible();
      await expect(systemUserPage.systemUserLink(system)).toBeVisible();
    });
  });

  test.afterEach(async ({ owner, api }) => {
    if (system) {
      await api.systemUsers.cleanUpSystemUsersForSystem(
        `${vendorOrgNumber}_${system}`,
        owner.pid,
        owner.orgNo,
      );
      await api.systemUsers.deleteSystemInSystemRegister(vendorOrgNumber, system);
    }
  });
});
