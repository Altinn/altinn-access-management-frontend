import { expect, medTestbrukere } from 'playwright/fixture/pomFixture';
import { TestdataApi } from 'playwright/util/TestdataApi';
import { pickRandom } from 'playwright/util/helper';
import { loadTestdata } from 'playwright/util/testdata';

// The clients delegate the access package to the owner in `beforeEach`, which is what
// makes them show up under «Legg til alle kunder».
const test = medTestbrukere({
  systemUserOwner: 'dagligLeder',
  client1: 'dagligLeder',
  client2: 'dagligLeder',
});

test.describe('Systembruker - Legg til egen organisasjon', () => {
  const {
    organisasjoner: [vendor],
  } = loadTestdata('systemuser').addOwnOrg;
  const vendorOrgNumber = vendor.orgNo;
  const accessPackageApiName = pickRandom(['jordbruk', 'motorvognavgift', 'pensjon']);
  const accessPackageUrn = `urn:altinn:accesspackage:${accessPackageApiName}`;

  let name: string;
  let systemId: string;
  let externalRef: string;
  let response: { confirmUrl: string; id: string };

  test.beforeEach(async ({ systemUserOwner, client1, client2, api }) => {
    name = '';
    name = `Playwright-e2e-${accessPackageApiName}-${Date.now()}`;
    externalRef = TestdataApi.generateExternalRef();

    for (const client of [client1, client2]) {
      await api.connections.addConnectionAndPackagesToUser(
        client.pid,
        client.orgNo,
        systemUserOwner.orgNo,
        [accessPackageUrn],
      );
    }

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
    systemUserOwner,
    client1,
    client2,
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
      for (const { orgNo, name: orgName } of [client1, client2]) {
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
  test.afterEach(async ({ systemUserOwner, client1, client2, api }) => {
    for (const client of [client1, client2]) {
      try {
        await api.connections.deleteConnection(client.pid, client.orgNo, [systemUserOwner.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete client connection:', error);
      }
    }
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
