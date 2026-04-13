import { test, expect } from 'playwright/fixture/pomFixture';

import { ApiRequests } from 'playwright/api-requests/ApiRequests';
import { ClientDelegationPage } from 'playwright/pages/systemuser/ClientDelegation';
import { AccessManagementFrontPage } from 'playwright/pages/AccessManagementFrontPage';
import { env } from 'playwright/util/helper';

test.describe('Systembruker - Legg til eigen organisasjon - edge cases', () => {
  const vendorOrgNumber = '310547891';
  const partyOrgNo = '314240545';
  const managerPid = '02858098613';
  const orgName = 'Elegant Lett Tiger AS';
  const accessPackageApiName = 'jordbruk';
  const formattedOrgNo = `Org.nr. ${partyOrgNo.slice(0, 3)} ${partyOrgNo.slice(3, 6)} ${partyOrgNo.slice(6)}`;

  let api: ApiRequests;
  let name: string;
  let clientDelegationPage: ClientDelegationPage;

  test.beforeEach(async ({ page, login }) => {
    api = new ApiRequests(vendorOrgNumber);
    name = `Playwright-e2e-edge-${Date.now()}-${Math.random()}`;
    clientDelegationPage = new ClientDelegationPage(page);

    const systemId = await test.step('Create system and agent request', async () => {
      const id = await api.createSystemInSystemregisterWithAccessPackages(name, [
        { urn: `urn:altinn:accesspackage:${accessPackageApiName}` },
      ]);
      const response = await api.postClientDelegationAgentRequest(
        id,
        accessPackageApiName,
        partyOrgNo,
      );

      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(managerPid);
      await clientDelegationPage.confirmButton.click();
      await expect(login.loginButton).toBeVisible();
      return id;
    });

    await test.step('Login and navigate to system user detail page', async () => {
      await login.LoginToAccessManagement(managerPid);
      await login.chooseReportee(orgName, orgName);

      const frontPage = new AccessManagementFrontPage(page);
      await frontPage.systemAccessLink.click();

      await expect(clientDelegationPage.systemUserLink(name)).toBeVisible();
      await clientDelegationPage.systemUserLink(name).click();
    });
  });

  test.afterEach(async () => {
    await clientDelegationPage.deleteSystemUser(name);
  });

  test('"Legg til din virksomhet" button disappears after adding', async ({ page }) => {
    await clientDelegationPage.addOwnOrgButton.click();

    await expect(clientDelegationPage.ownOrgBadge).toBeVisible();
    await expect(clientDelegationPage.addOwnOrgButton).not.toBeVisible();
  });

  test('Remove own org works', async ({ page }) => {
    await clientDelegationPage.addOwnOrgButton.click();
    await expect(clientDelegationPage.ownOrgBadge).toBeVisible();

    await clientDelegationPage.removeOwnOrgButton.click();

    await expect(clientDelegationPage.ownOrgBadge).not.toBeVisible();
    await expect(clientDelegationPage.removeOwnOrgButton).not.toBeVisible();
    await expect(clientDelegationPage.ownOrgHeading(orgName)).not.toBeVisible();
    await expect(clientDelegationPage.ownOrgNumber(formattedOrgNo)).not.toBeVisible();
  });

  test('"Legg til din virksomhet" button reappears after removing', async ({ page }) => {
    await clientDelegationPage.addOwnOrgButton.click();
    await expect(clientDelegationPage.ownOrgBadge).toBeVisible();

    await clientDelegationPage.removeOwnOrgButton.click();
    await expect(clientDelegationPage.ownOrgBadge).not.toBeVisible();

    await expect(clientDelegationPage.addOwnOrgButton).toBeVisible();
  });

  test('Re-add after remove works', async ({ page }) => {
    await clientDelegationPage.addOwnOrgButton.click();
    await expect(clientDelegationPage.ownOrgBadge).toBeVisible();

    await clientDelegationPage.removeOwnOrgButton.click();
    await expect(clientDelegationPage.ownOrgBadge).not.toBeVisible();

    await clientDelegationPage.addOwnOrgButton.click();

    await expect(clientDelegationPage.ownOrgBadge).toBeVisible();
    await expect(clientDelegationPage.removeOwnOrgButton).toBeVisible();
    await expect(clientDelegationPage.ownOrgHeading(orgName)).toBeVisible();
    await expect(clientDelegationPage.ownOrgNumber(formattedOrgNo)).toBeVisible();
  });

  test('Own org persists after page reload', async ({ page }) => {
    await clientDelegationPage.addOwnOrgButton.click();
    await expect(clientDelegationPage.ownOrgBadge).toBeVisible();

    await page.reload();

    await expect(clientDelegationPage.ownOrgBadge).toBeVisible();
    await expect(clientDelegationPage.removeOwnOrgButton).toBeVisible();
    await expect(clientDelegationPage.ownOrgHeading(orgName)).toBeVisible();
    await expect(clientDelegationPage.ownOrgNumber(formattedOrgNo)).toBeVisible();
    await expect(clientDelegationPage.addOwnOrgButton).not.toBeVisible();
  });
});
