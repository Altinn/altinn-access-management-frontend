import { expect, test } from 'playwright/fixture/pomFixture';
import { Language } from 'playwright/pages/LanguageMenu';

import { TestdataApi } from 'playwright/util/TestdataApi';
import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
import { pickVendorOrg } from 'playwright/util/systemVendors';
import { TenorTestData, type TenorDagligLederMedOrg } from 'playwright/tenor/TenorTestData';
import { cleanupSystemUser } from 'playwright/util/systemUserCleanup';

// Runs in nynorsk on purpose: exercises the before-login language pinning
// (settings API) and proves the dict-driven selectors work in a non-default
// language. The rest of the suites run in the default bokmål.
test.use({ language: Language.NN });
// Systemleverandøren er en registrert leverandør i systemregisteret (fast
// infrastruktur, ikke Tenor). Eier-virksomheten som oppretter systembrukeren
// hentes derimot fra Tenor, så parallelle kjøringer ikke deler samme aktør.
const vendorOrgNumber = pickVendorOrg();

test.describe('System Register', async () => {
  const tenor = new TenorTestData();
  let system: string;
  let owner: TenorDagligLederMedOrg;
  let systemUserId: string;

  test.beforeEach(async ({ login }) => {
    const api = new ApiRequests();
    system = await api.createSystemSystemRegister(vendorOrgNumber);
    owner = await tenor.dagligLederMedOrg();
    await login.LoginToAccessManagement(owner.dagligLeder.pid);
    await login.selectMainUnitBySearching(owner.org.navn);
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
      const link = systemUserPage.systemUserLink(system);
      await expect(link).toBeVisible();
      // Fang system-bruker-IDen fra lenka (…/systemuser/<id>) så vi kan slette
      // den via API etterpå (UI-opprettet, så ingen external-ref å søke på).
      const href = await link.getAttribute('href');
      systemUserId = href?.split('/').filter(Boolean).pop() ?? '';
    });
  });

  test.afterEach(async () => {
    await cleanupSystemUser({
      vendorOrgNumber,
      ownerOrg: owner.org.orgnr,
      ownerPid: owner.dagligLeder.pid,
      systemUserId,
    });
    if (system) {
      await TestdataApi.removeSystem(vendorOrgNumber, system);
    }
  });
});
