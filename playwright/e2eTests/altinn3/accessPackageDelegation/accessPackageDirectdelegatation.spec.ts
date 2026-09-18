import { expect } from '@playwright/test';
import { test } from 'playwright/fixture/pomFixture';
import { DelegationApiUtil } from 'playwright/util/delegationApiUtil';
import { withTimeout } from 'playwright/util/asyncUtils';
import { getTestPersonForCategory } from 'playwright/util/testDelegationdatautil';

test.describe('Delegate access pacakge from Org-A(Avgiver) to Org-B(Rettighetshaver) ', () => {
  test.beforeEach(async ({}, testInfo) => {
    const title = testInfo.title || 'unknown-test';
    try {
      await DelegationApiUtil.cleanupAllDelegations(title);
    } catch {
      /* ignore if nothing to clean */
    }
  });

  test.afterEach(async ({}, testInfo) => {
    const title = testInfo.title || 'unknown-test';

    try {
      await withTimeout(
        DelegationApiUtil.cleanupAllDelegations(title),
        15_000, // cleanup budget
        `cleanupAllDelegations(${title})`,
      );
    } catch (err) {
      // Don't fail tests if cleanup is flaky or slow
      console.warn(`[afterEach] Cleanup failed or timed out for: ${title}`, err);
    }
  });

  test('Org-A delegates access package to Org-B', async ({
    delegation,
    login,
    aktorvalgHeader,
    accessManagementFrontPage,
    runAccessibilityTest,
  }, testInfo) => {
    await test.step('Log in', async () => {
      // LoginToAccessManagement pins the app language (before login, via the
      // settings API) so selectors match regardless of the user's profile.
      await login.LoginToAccessManagement('04856996188');
      await aktorvalgHeader.selectActorFromHeaderMenu('SUBJEKTIV ELASTISK TIGER AS');
      await accessManagementFrontPage.goToUsers();
    });

    // Step 3: Add new user
    await test.step('Add new user', async () => {
      await delegation.addUser();
    });

    // Step 4: Add organization
    await test.step('Add organization', async () => {
      await delegation.addOrganization('213091492');
    });

    // Step 5: Grant access to multiple packages
    await test.step('Grant access to multiple packages', async () => {
      await delegation.grantAccessPkgNameDirect('Veitransport');
      await delegation.grantAccessPkgName('Byggesøknad');
      await delegation.grantAccessPkgNameDirect('Godkjenning av personell');
      await delegation.closeAccessModal();
    });

    // 4) Verify delegated packages for the current org / view
    await test.step('Verify delegated packages for the current org / view', async () => {
      await delegation.verifyDelegatedPackages([
        { areaName: 'Bygg, anlegg og eiendom', packageName: 'Byggesøknad' },
        { areaName: 'Oppvekst og utdanning', packageName: 'Godkjenning av personell' },
        { areaName: 'Transport og lagring', packageName: 'Veitransport' },
      ]);

      await delegation.verifyKeyRoleUserHasDelegatedPackages(
        'Sivilisert Trygg Tiger AS',
        'Moderne Analyse',
        [
          { areaName: 'Bygg, anlegg og eiendom', packageName: 'Byggesøknad' },
          { areaName: 'Oppvekst og utdanning', packageName: 'Godkjenning av personell' },
          { areaName: 'Transport og lagring', packageName: 'Veitransport' },
        ],
      );
    });

    await runAccessibilityTest.scan(testInfo, 'delegerte-tilgangspakker');

    await test.step('log out', async () => {
      await delegation.logoutFromBrukerflate();
    });
  });

  test('Org-C revokes all delegated rights from Org-D', async ({
    delegation,
    page,
    login,
    aktorvalgHeader,
    accessManagementFrontPage,
    runAccessibilityTest,
  }, testInfo) => {
    const recipient = 'Skyfri Oksydert Katt Klemme';
    const manager = await getTestPersonForCategory('Dagligleder-Org-C');
    const recipientParty = await getTestPersonForCategory('Org-D');

    await test.step('Create delegated rights via API', async () => {
      await DelegationApiUtil.addOrgToDelegate('Org-C', 'Org-D');
      await DelegationApiUtil.delegateAccessPackage('Org-C', 'Org-D', [
        'urn:altinn:accesspackage:byggesoknad',
        'urn:altinn:accesspackage:godkjenning-av-personell',
        'urn:altinn:accesspackage:veitransport',
      ]);
    });

    await test.step('Log in as Org-C and verify Org-D has the delegated rights', async () => {
      await login.LoginToAccessManagement(manager.PID!);
      await aktorvalgHeader.selectActorFromHeaderMenu('DRIFTIG LOGISK TIGER AS');
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(recipient);
      await accessManagementFrontPage.clickUser(recipient);
      await delegation.verifyDelegatedPackages([
        { areaName: 'Bygg, anlegg og eiendom', packageName: 'Byggesøknad' },
        { areaName: 'Oppvekst og utdanning', packageName: 'Godkjenning av personell' },
        { areaName: 'Transport og lagring', packageName: 'Veitransport' },
      ]);
    });

    await test.step('Remove Org-D and all delegated rights', async () => {
      await delegation.deleteDelegatedUser();
      await accessManagementFrontPage.goToUsers();
      await expect(page.getByRole('button', { name: recipient, exact: true })).toHaveCount(0);
      const reloadedUsers = page.waitForResponse(
        (response) =>
          response.url().includes('/rightholders?') && response.request().method() === 'GET',
      );
      await page.reload();
      const response = await reloadedUsers;
      expect(response.ok()).toBeTruthy();
      expect(JSON.stringify(await response.json())).not.toContain(recipientParty.PartyUUID!);
      await accessManagementFrontPage.goToUsers();
      await expect(page.getByRole('button', { name: recipient, exact: true })).toHaveCount(0);
    });

    await runAccessibilityTest.scan(testInfo, 'etter-tilbakekalling-av-fullmakter');
  });
});
