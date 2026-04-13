import { test, expect } from 'playwright/fixture/pomFixture';

import { ApiRequests } from 'playwright/api-requests/ApiRequests';
import { ClientDelegationPage } from 'playwright/pages/systemuser/ClientDelegation';
import { AccessManagementFrontPage } from 'playwright/pages/AccessManagementFrontPage';
import { pickRandom } from 'playwright/util/helper';

test.describe('Systembruker - Legg til eigen organisasjon', () => {
  const vendorOrgNumber = '310547891';
  const partyOrgNo = '314240545';
  const managerPid = '02858098613';
  const orgName = 'Elegant Lett Tiger AS';

  const accessPackages = ['jordbruk', 'motorvognavgift', 'innbygger-vapen', 'pensjon'];
  const accessPackageApiName = pickRandom(accessPackages);

  let api: ApiRequests;
  let name: string;
  let clientDelegationPage: ClientDelegationPage;
  let response: { confirmUrl: string; id: string };

  test.beforeEach(async ({ page }) => {
    api = new ApiRequests(vendorOrgNumber);
    name = `Playwright-e2e-${accessPackageApiName}-${Date.now()}-${Math.random()}`;
    clientDelegationPage = new ClientDelegationPage(page);

    const systemId = await test.step('Create system with access package', async () => {
      return await api.createSystemInSystemregisterWithAccessPackages(name, [
        { urn: `urn:altinn:accesspackage:${accessPackageApiName}` },
      ]);
    });

    response = await test.step('Create system user agent request', async () => {
      return await api.postClientDelegationAgentRequest(systemId, accessPackageApiName, partyOrgNo);
    });
  });

  test('Legg til din virksomhet', async ({ page, login }): Promise<void> => {
    await test.step('Navigate to confirmation page and approve request', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(managerPid);
      await expect(clientDelegationPage.confirmButton).toBeVisible();
      await clientDelegationPage.confirmButton.click();
      await expect(login.loginButton).toBeVisible();
    });

    await test.step('Login and navigate to system user', async () => {
      await login.LoginToAccessManagement(managerPid);
      await login.chooseReportee(orgName, orgName);

      const frontPage = new AccessManagementFrontPage(page);
      await frontPage.systemAccessLink.click();

      await expect(clientDelegationPage.systemUserLink(name)).toBeVisible();
      await clientDelegationPage.systemUserLink(name).click();
    });

    await test.step('Add own org to system user', async () => {
      await clientDelegationPage.addOwnOrgButton.click();
    });

    await test.step('Verify own org is added', async () => {
      await expect(clientDelegationPage.ownOrgBadge).toBeVisible();
      await expect(clientDelegationPage.removeOwnOrgButton).toBeVisible();
      await expect(clientDelegationPage.ownOrgHeading(orgName)).toBeVisible();
      await expect(
        clientDelegationPage.ownOrgNumber(
          `Org.nr. ${partyOrgNo.slice(0, 3)} ${partyOrgNo.slice(3, 6)} ${partyOrgNo.slice(6)}`,
        ),
      ).toBeVisible();
    });

    await test.step('Remove own org via "Fjern fra systemtilgang" link', async () => {
      await clientDelegationPage.removeOwnOrgButton.click();
      await expect(clientDelegationPage.ownOrgBadge).not.toBeVisible();
      await expect(clientDelegationPage.removeOwnOrgButton).not.toBeVisible();
    });

    await test.step('Cleanup: Delete system user', async () => {
      await clientDelegationPage.deleteSystemUser(name);
    });
  });
});
