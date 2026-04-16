import { test, expect } from 'playwright/fixture/pomFixture';
import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
import { EnduserConnection } from 'playwright/api-requests/EnduserConnection';
import { TestdataApi } from 'playwright/util/TestdataApi';
import { pickRandom } from 'playwright/util/helper';

test.describe('Systembruker - Legg til egen organisasjon', () => {
  const partyOrgNo = '314240545';
  const managerPid = '02858098613';
  const orgName = 'Elegant Lett Tiger AS';
  const accessPackageApiName = pickRandom([
    'jordbruk',
    'motorvognavgift',
    'innbygger-vapen',
    'pensjon',
  ]);
  const accessPackageUrn = `urn:altinn:accesspackage:${accessPackageApiName}`;

  const clients = [
    { orgNo: '310629499', managerPid: '03878497650', orgName: 'Allslags Kompatibel Tiger AS' },
    { orgNo: '310349070', managerPid: '16926997746', orgName: 'Blomstrete Vrien Tiger AS' },
    { orgNo: '313089789', managerPid: '17906298724', orgName: 'Klok Spesiell Tiger AS' },
  ];

  let api: ApiRequests;
  let name: string;
  let systemId: string;
  let externalRef: string;
  let response: { confirmUrl: string; id: string };

  test.beforeEach(async () => {
    api = new ApiRequests();
    name = `Playwright-e2e-${accessPackageApiName}-${Date.now()}`;
    externalRef = TestdataApi.generateExternalRef();

    systemId = await test.step('Create system with access package', async () => {
      return await api.createSystemInSystemregisterWithAccessPackages('310547891', name, [
        { urn: accessPackageUrn },
      ]);
    });

    response = await test.step('Create system user agent request', async () => {
      return await api.postClientDelegationAgentRequest(
        '310547891',
        systemId,
        accessPackageApiName,
        partyOrgNo,
        externalRef,
      );
    });

    await test.step('Setup client connections via API', async () => {
      const connection = new EnduserConnection();
      await Promise.all(
        clients.map(({ orgNo, managerPid: clientPid }) =>
          connection.addConnectionAndPackagesToUser(clientPid, orgNo, partyOrgNo, [
            accessPackageUrn,
          ]),
        ),
      );
    });
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status === 'passed') return;

    try {
      await api.deleteAgentSystemUser('310547891', systemId, partyOrgNo, externalRef, managerPid);
    } catch (error) {
      console.error('Cleanup: Failed to delete agent system user:', error);
    }
    try {
      await api.deleteSystemInSystemRegister('310547891', name);
    } catch (error) {
      console.error('Cleanup: Failed to delete system from system register:', error);
    }
  });

  test('Legg til din virksomhet', async ({
    page,
    login,
    accessManagementFrontPage,
    clientDelegationPage,
  }): Promise<void> => {
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
      await accessManagementFrontPage.systemAccessLink.click();

      await expect(clientDelegationPage.systemUserLink(name)).toBeVisible();
      await clientDelegationPage.systemUserLink(name).click();
    });

    await test.step('Add all clients', async () => {
      await clientDelegationPage.addAllCustomers();
      await clientDelegationPage.confirmAndCloseButton.click();
    });

    await test.step('Verify clients are added', async () => {
      for (const { orgNo, orgName } of clients) {
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
      await expect(clientDelegationPage.ownOrgHeading(orgName)).toBeVisible();
      await expect(
        clientDelegationPage.ownOrgNumber(
          orgName,
          `Org.nr. ${partyOrgNo.slice(0, 3)} ${partyOrgNo.slice(3, 6)} ${partyOrgNo.slice(6)}`,
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
});
