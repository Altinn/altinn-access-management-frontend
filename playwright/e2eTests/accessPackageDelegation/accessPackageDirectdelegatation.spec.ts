import { test } from 'playwright/fixture/pomFixture';
import { DelegationApiUtil } from 'playwright/util/delegationApiUtil';

test.describe('Delegate access pacakge from Org-A(Avgiver) to Org-B(Rettighetshaver) ', () => {});
test('Org-A delegates access package to Org-B', async ({ delegation, login }) => {
  await login.loginWithUserInA3('04856996188');
  await login.chooseAktøriA3('SUBJEKTIV ELASTISK TIGER AS');
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

test('Org-C revokes all delegated rights from Org-D', async ({ delegation, page, login }) => {
  await login.loginWithUserInA3('22875997754');
  await login.chooseAktøriA3('DRIFTIG LOGISK TIGER AS');
  await DelegationApiUtil.addOrgToDelegate('Org-C', 'Org-D');
  await DelegationApiUtil.delegateAccessPackage('Org-C', 'Org-D', [
    'urn:altinn:accesspackage:byggesoknad',
    'urn:altinn:accesspackage:godkjenning-av-personell',
    'urn:altinn:accesspackage:veitransport',
  ]);
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Step 2: Open delegation flow

  await delegation.chooseOrg('Skyfri Oksydert Katt Klemme');

  //Step3 : Delete delegated pacakge directly from area list
  await delegation.deleteDelegatedPackage('Transport og lagring', 'Veitransport');
  await delegation.deleteDelegatedPackage('Oppvekst og utdanning', 'Godkjenning av personell');

  //Delete package by opening the package first
  await delegation.deletePackageInside('Bygg, anlegg og eiendom', 'Byggesøknad');
  //Delete user from rettighetshaver list
  await delegation.deleteDelegatedUser();
  await delegation.logoutFromBrukerflate();
});
