import { test } from 'playwright/fixture/pomFixture';

test.describe('Delegate access pacakge from Org-A(Avgiver) to Org-B(Rettighetshaver) ', () => {
  test('Org-A delegates access pacakge to Org-B', async ({ login, delegation }) => {
    // Step 1: Login and select organization as reportee
    await login.loginWithUser('23926299794');
    await login.chooseReportee('UTGÅTT FLEKSIBEL TIGER AS');

    // Step 2: Open delegation flow
    await delegation.openDelegationFlow();

    // Step 3: Add new user
    await delegation.addUser();

    // Step 4: Add organization using tenor/test data
    await delegation.addOrganization('310021199');

    // Step 5: Grant access to multiple items
    await delegation.grantAccessPkgName('Transport og lagring', 'Veitransport');
    await delegation.grantAccessPkgName('Bygg, anlegg og eiendom', 'Byggesøknad');
    await delegation.grantAccessPkgName('Oppvekst og utdanning', 'Godkjenning av personell');

    await delegation.closeAccessModal();

    // Optional: verify delegation success
    // await expect(delegation.successMessage('Delegation successful')).toBeVisible();
  });
});
