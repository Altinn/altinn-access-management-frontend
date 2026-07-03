import { test } from 'playwright/fixture/pomFixture';
import { DelegationApiUtil } from 'playwright/util/delegationApiUtil';
import { EnduserConnection } from 'playwright/api-requests/EnduserConnection';
import { cleanupConnection } from 'playwright/util/delegationHelpers';
import { TenorTestData, type TenorDagligLederMedOrg } from 'playwright/tenor/TenorTestData';

test.describe('Delegate access pacakge from Org-A(Avgiver) to Org-B(Rettighetshaver) ', () => {
  const api = new EnduserConnection();
  const tenor = new TenorTestData();
  let orgA: TenorDagligLederMedOrg;
  let orgB: TenorDagligLederMedOrg;

  test.beforeEach(async () => {
    // Org-A (avgiver) delegerer til Org-B (rettighetshaver). Org-B hentes som en
    // dagligLederMedOrg fordi vi trenger BÅDE virksomheten og dens daglige leder
    // (nøkkelrolle-brukeren som arver de delegerte pakkene).
    orgA = await tenor.dagligLederMedOrg();
    orgB = await tenor.dagligLederMedOrg({ ekskluder: [orgA.org.orgnr] }); // ikke deleger til seg selv
  });

  test.afterEach(async () => {
    await cleanupConnection(api, {
      pid: orgA.dagligLeder.pid,
      from: orgA.org.orgnr,
      to: orgB.org.orgnr,
    });
  });

  test('Org-A delegates access package to Org-B', async ({
    delegation,
    login,
    accessManagementFrontPage,
  }) => {
    await test.step('Log in', async () => {
      // LoginToAccessManagement pins the app language (before login, via the
      // settings API) so selectors match regardless of the user's profile.
      await login.LoginToAccessManagement(orgA.dagligLeder.pid);
      await login.selectMainUnitBySearching(orgA.org.navn);
      await accessManagementFrontPage.goToUsers();
    });

    // Step 3: Add new user
    await test.step('Add new user', async () => {
      await delegation.addUser();
    });

    // Step 4: Add organization
    await test.step('Add organization', async () => {
      await delegation.addOrganization(orgB.org.orgnr);
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

      // Org-B sin daglige leder (nøkkelrolle) skal ha arvet pakkene.
      await delegation.verifyKeyRoleUserHasDelegatedPackages(orgB.org.navn, orgB.dagligLeder.navn, [
        { areaName: 'Bygg, anlegg og eiendom', packageName: 'Byggesøknad' },
        { areaName: 'Oppvekst og utdanning', packageName: 'Godkjenning av personell' },
        { areaName: 'Transport og lagring', packageName: 'Veitransport' },
      ]);
    });

    await test.step('log out', async () => {
      await delegation.logoutFromBrukerflate();
    });
  });

  // Doesnt test anything? Skipping for now.
  test.skip('Org-C revokes all delegated rights from Org-D', async ({
    page,
    login,
    aktorvalgHeader,
  }) => {
    await test.step('log in', async () => {
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
