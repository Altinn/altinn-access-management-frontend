import { test } from 'playwright/fixture/pomFixture';
import { DelegationApiUtil } from 'playwright/util/delegationApiUtil';

test.describe('Delegate access pacakge from Org-A(Avgiver) to Org-B(Rettighetshaver) ', () => {
  test('Org-A delegates access pacakge to Org-B', async ({ login, delegation }) => {
    // Step 1: Login and select organization as reportee
    await login.loginWithUser('23926299794');
    await login.chooseReportee('UTGÅTT FLEKSIBEL TIGER AS');

    // Step 2: Open delegation flow
    await delegation.openDelegationFlow();

    // Step 3: Add new user
    await delegation.addUser();

    // Step 4: Add organization
    await delegation.addOrganization('310021199');

    // Step 5: Grant access to multiple packages
    await delegation.grantAccessPkgNameDirect(
      'Transport og lagring',
      'Veitransport',
      'LYKKELIG RAKRYGGET PUMA BBL',
    );
    await delegation.grantAccessPkgName('Bygg, anlegg og eiendom', 'Byggesøknad');
    await delegation.grantAccessPkgNameDirect(
      'Oppvekst og utdanning',
      'Godkjenning av personell',
      'LYKKELIG RAKRYGGET PUMA BBL',
    );

    await delegation.closeAccessModal();

    //verify delegation success
    //Step5 : Delete delegated pacakge directly from area list
    //  await delegation.deleteDelegatedPackage('Transport og lagring', 'Veitransport');
    // await delegation.deleteDelegatedPackage('Oppvekst og utdanning', 'Godkjenning av personell');

    //Delete package by opening the package first
    // await delegation.deletePackageInside('Bygg, anlegg og eiendom', 'Byggesøknad');
    //Delete user from rettighetshaver list
    // await delegation.deleteDelegatedUser();
  });

  test('Org-2(Rettighetshaver) verifies it in "Våre tilganger hos andre"', async ({
    login,
    delegation,
  }) => {
    // Step 1: Login and select organization as reportee
    await login.loginWithUser('06815597492');
    await login.chooseReportee('LYKKELIG RAKRYGGET PUMA BBL');

    await delegation.newAccessRights('UTGÅTT FLEKSIBEL TIGER AS');
    await delegation.verifyDelegatedPacakge('Bygg, anlegg og eiendom', 'Byggesøknad');
    await delegation.verifyDelegatedPacakge('Transport og lagring', 'Veitransport');
    await delegation.verifyDelegatedPacakge('Oppvekst og utdanning', 'Godkjenning av personell');
  });

  test.afterAll(async () => {
    console.log('Running cleanup after all tests...');
    await DelegationApiUtil.cleanupDelegations();
    console.log('Cleanup finished.');
  });
});
