import { test, expect } from 'playwright/fixture/pomFixture';
import { TestdataApi } from 'playwright/util/TestdataApi';
import { pickRandom } from 'playwright/util/helper';
import { loadTestdata } from 'playwright/util/testdata';

test.describe('Systembruker - Legg til egen organisasjon', () => {
  const {
    organisasjoner: [vendor, systemUserOwner, client1, client2, client3],
  } = loadTestdata('systemuser').addOwnOrg;
  const vendorOrgNumber = vendor.orgNo;
  const accessPackageApiName = pickRandom(['jordbruk', 'motorvognavgift', 'pensjon']);
  const accessPackageUrn = `urn:altinn:accesspackage:${accessPackageApiName}`;

  // All these clients must have delegated the accessPackages listed above to the owner organization
  const clients = [client1, client2, client3];

  let name: string;
  let systemId: string;
  let externalRef: string;
  let response: { confirmUrl: string; id: string };

  test.beforeEach(async ({ api }) => {
    name = '';
    name = `Playwright-e2e-${accessPackageApiName}-${Date.now()}`;
    externalRef = TestdataApi.generateExternalRef();

    systemId = await test.step('Create system with access package', async () => {
      return await api.systemUsers.createSystemInSystemregisterWithAccessPackages(
        vendorOrgNumber,
        name,
        [{ urn: accessPackageUrn }],
      );
    });

    response = await test.step('Create system user agent request', async () => {
      return await api.systemUsers.postClientDelegationAgentRequest(
        vendorOrgNumber,
        systemId,
        accessPackageApiName,
        systemUserOwner.orgNo,
        externalRef,
      );
    });
  });

  test('Legg til din virksomhet', async ({
    page,
    login,
    accessManagementFrontPage,
    clientDelegationPage,
  }): Promise<void> => {
    await test.step('Navigate to confirmation page and approve request', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(systemUserOwner.pid);
      await expect(clientDelegationPage.confirmButton).toBeVisible();
      await clientDelegationPage.confirmButton.click();
      await expect(login.loginButton).toBeVisible();
    });

    await test.step('Login and navigate to system user', async () => {
      await login.LoginToAccessManagement(systemUserOwner.pid);
      await login.selectActor(systemUserOwner.name);
      await accessManagementFrontPage.systemUserMenuLink.click();

      await expect(clientDelegationPage.systemUserLink(name)).toBeVisible();
      await clientDelegationPage.systemUserLink(name).click();
    });

    await test.step('Add all clients', async () => {
      await clientDelegationPage.addAllCustomers();
      await clientDelegationPage.confirmAndCloseButton.click();
    });

    await test.step('Verify clients are added', async () => {
      for (const { orgNo, name: orgName } of clients) {
        const formatted = `Org.nr. ${orgNo.slice(0, 3)} ${orgNo.slice(3, 6)} ${orgNo.slice(6)}`;
        await expect(clientDelegationPage.ownOrgHeading(orgName)).toBeVisible();
        await expect(clientDelegationPage.clientOrgNumber(orgName, formatted)).toBeVisible();
      }
    });

    await test.step('Add own org to system user', async () => {
      await clientDelegationPage.addOwnOrgButton.click();
    });

    await test.step('Verify own org is added', async () => {
      await expect(clientDelegationPage.ownOrgBadge).toBeVisible();
      await expect(clientDelegationPage.removeOwnOrgButton).toBeVisible();
      await expect(clientDelegationPage.ownOrgHeading(systemUserOwner.name)).toBeVisible();
      await expect(
        clientDelegationPage.ownOrgNumber(
          systemUserOwner.name,
          `Org.nr. ${systemUserOwner.orgNo.slice(0, 3)} ${systemUserOwner.orgNo.slice(3, 6)} ${systemUserOwner.orgNo.slice(6)}`,
        ),
      ).toBeVisible();
    });

    await test.step('Remove own org via "Fjern fra systemtilgang" link', async () => {
      await clientDelegationPage.removeOwnOrgButton.click();
      await expect(clientDelegationPage.removeOwnOrgButton).not.toBeVisible();
      await expect(clientDelegationPage.addOwnOrgButton).toBeVisible();
    });

    await test.step('Delete system user and verify it is removed', async () => {
      await clientDelegationPage.deleteSystemUser(name);
    });
  });
  test.afterEach(async ({ api }) => {
    if (name) {
      await api.systemUsers.cleanUpSystemUsersForSystem(
        `${vendorOrgNumber}_${name}`,
        systemUserOwner.pid,
        systemUserOwner.orgNo,
        true,
      );
      await api.systemUsers.deleteSystemInSystemRegister(vendorOrgNumber, name);
    }
  });
});
