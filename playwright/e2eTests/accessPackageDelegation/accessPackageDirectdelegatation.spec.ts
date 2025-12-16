import { test } from 'playwright/fixture/pomFixture';
import { DelegationApiUtil } from 'playwright/util/delegationApiUtil';

test.describe('Delegate access pacakge from Org-A(Avgiver) to Org-B(Rettighetshaver) ', () => {
  test.beforeEach(async ({ login, delegation }) => {
    await login.LoginToAccessManagement('23926299794');
    await login.chooseReportee('Utgått Fleksibel Tiger AS');
  });
  test.skip('Org-A delegates access pacakge to Org-B', async ({
    login,
    delegation,
    accessManagementFrontPage,
  }) => {
    // Step 2: Open delegation flow using Fullmakter menu link
    await accessManagementFrontPage.usersLink.click();

    // Step 3: Add new user
    await delegation.addUser();

    // Step 4: Add organization
    await delegation.addOrganization('310021199');

    // Step 5: Grant access to multiple packages
    await delegation.grantAccessPkgNameDirect(
      'Transport og lagring',
      'Veitransport',
      'Lykkelig Rakrygget Puma BBL',
    );
    await delegation.grantAccessPkgName('Bygg, anlegg og eiendom', 'Byggesøknad');
    await delegation.grantAccessPkgNameDirect(
      'Oppvekst og utdanning',
      'Godkjenning av personell',
      'Lykkelig Rakrygget Puma BBL',
    );

    await delegation.closeAccessModal();
    await delegation.logoutFromBrukerflate();

    // Step 6: Login with Org-2(Rettighetshaver) and select organization as reportee
    await login.LoginToAccessManagement('06815597492');
    await login.chooseReportee('Lykkelig Rakrygget Puma BBL');

    await delegation.newAccessRights('Utgått Fleksibel Tiger AS');

    //Verify Org-2(Rettighetshaver) has got rights on accesspkg from Org-1(Avgiver) under "Våre tilganger hos andre"
    await delegation.verifyDelegatedPacakge('Bygg, anlegg og eiendom', 'Byggesøknad');
    await delegation.verifyDelegatedPacakge('Transport og lagring', 'Veitransport');
    await delegation.verifyDelegatedPacakge('Oppvekst og utdanning', 'Godkjenning av personell');
  });

  test.skip('Org-A revokes all delegated access package rights from Org-2', async ({
    delegation,
    accessManagementFrontPage,
  }) => {
    await DelegationApiUtil.addOrgToDelegate();
    await DelegationApiUtil.delegateAccessPacakage();

    // Step 2: Open delegation flow using Fullmakter menu link
    await accessManagementFrontPage.usersLink.click();
    await delegation.chooseOrg('Lykkelig Rakrygget Puma BBL');

    //Step3 : Delete delegated pacakge directly from area list
    await delegation.deleteDelegatedPackage('Transport og lagring', 'Veitransport');
    await delegation.deleteDelegatedPackage('Oppvekst og utdanning', 'Godkjenning av personell');

    //Delete package by opening the package first
    await delegation.deletePackageInside('Bygg, anlegg og eiendom', 'Byggesøknad');
    //Delete user from rettighetshaver list
    await delegation.deleteDelegatedUser();
  });

  test.afterAll(async () => {
    await DelegationApiUtil.cleanupDelegations();
  });
});
