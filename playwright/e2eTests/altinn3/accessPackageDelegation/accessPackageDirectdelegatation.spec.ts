import { env } from 'playwright/util/helper';
import { test } from 'playwright/fixture/pomFixture';
import { DelegationApiUtil } from 'playwright/util/delegationApiUtil';
import { withTimeout } from 'playwright/util/asyncUtils';

test.describe('Delegate access pacakge from Org-A(Avgiver) to Org-B(Rettighetshaver) ', () => {
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
    page,
    delegation,
    login,
    aktorvalgHeader,
    accessManagementFrontPage,
  }) => {
    await page.goto(env('BASE_URL'));
    await login.LoginToAccessManagement('04856996188');
    await aktorvalgHeader.selectActorFromHeaderMenu('SUBJEKTIV ELASTISK TIGER AS');
    await accessManagementFrontPage.goToUsers();

    // Step 3: Add new user
    await delegation.addUser();

    // Step 4: Add organization
    await delegation.addOrganization('213091492');

    // Step 5: Grant access to multiple packages
    await delegation.grantAccessPkgNameDirect('Veitransport');
    await delegation.grantAccessPkgName('Byggesøknad');
    await delegation.grantAccessPkgNameDirect('Godkjenning av personell');
    await delegation.closeAccessModal();

    // 4) Verify delegated packages for the current org / view
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

    await delegation.logoutFromBrukerflate();
  });

  test('Org-C revokes all delegated rights from Org-D', async ({
    delegation,
    page,
    login,
    aktorvalgHeader,
  }) => {
    await test.step('log in', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('04856996188');
      await aktorvalgHeader.selectActorFromHeaderMenu('SUBJEKTIV ELASTISK TIGER AS');
    });

    await test.step('delegate stuff via api', async () => {
      await DelegationApiUtil.addOrgToDelegate('Org-C', 'Org-D');
      await DelegationApiUtil.delegateAccessPackage('Org-C', 'Org-D', [
        'urn:altinn:accesspackage:byggesoknad',
        'urn:altinn:accesspackage:godkjenning-av-personell',
        'urn:altinn:accesspackage:veitransport',
      ]);
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
    });

    // // Step 2: Open delegation flow
    // await test.step('velg aktør Skyfri Oksydert Katt Klemme', async () => {
    //   // await delegation.chooseOrg('Skyfri Oksydert Katt Klemme');
    //   await aktorvalgHeader.goToSelectActor('SUBJEKTIV ELASTISK TIGER AS');
    //   await aktorvalgHeader.selectActor('Skyfri Oksydert Katt Klemme');
    // });

    // //Step3 : Delete delegated pacakge directly from area list
    // await test.step('deleger pakker direkte fra area-lista', async () => {
    //   await delegation.deleteDelegatedPackage('Transport og lagring', 'Veitransport');
    //   await delegation.deleteDelegatedPackage('Oppvekst og utdanning', 'Godkjenning av personell');
    // });

    // //Delete package by opening the package first
    // await test.step('slett pakke', async () => {
    //   await delegation.deletePackageInside('Bygg, anlegg og eiendom', 'Byggesøknad');
    // });

    // //Delete user from rettighetshaver list
    // await test.step('slett brukeren fra rettighetshaverlista', async () => {
    //   await delegation.deleteDelegatedUser();
    //   await delegation.logoutFromBrukerflate();
    // });
  });
});
