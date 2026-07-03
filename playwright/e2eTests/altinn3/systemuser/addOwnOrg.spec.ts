import { test, expect } from 'playwright/fixture/pomFixture';
import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
import { TestdataApi } from 'playwright/util/TestdataApi';
import { pickRandom } from 'playwright/util/helper';
import { EnduserConnection } from 'playwright/api-requests/EnduserConnection';
import { TenorTestData, type TenorDagligLederMedOrg } from 'playwright/tenor/TenorTestData';
import { cleanupSystemUser } from 'playwright/util/systemUserCleanup';

// Leverandøren (310547891) er registrert infrastruktur (ikke Tenor). Eier-org og
// klientene hentes fra Tenor: en fersk eier har ingen klienter, så vi setter opp
// akkurat noen få via API — da blir «legg til alle klienter» raskt.
const vendorOrgNumber = '310547891';
const ANTALL_KLIENTER = 2;

test.describe('Systembruker - Legg til egen organisasjon', () => {
  const tenor = new TenorTestData();
  const enduser = new EnduserConnection();
  const accessPackageApiName = pickRandom(['jordbruk', 'motorvognavgift', 'pensjon']);
  const accessPackageUrn = `urn:altinn:accesspackage:${accessPackageApiName}`;

  let api: ApiRequests;
  let owner: TenorDagligLederMedOrg;
  let clients: TenorDagligLederMedOrg[];
  let name: string;
  let systemId: string;
  let externalRef: string;
  let response: { confirmUrl: string; id: string };

  test.beforeEach(async () => {
    api = new ApiRequests();

    owner = await tenor.dagligLederMedOrg();
    clients = [];
    while (clients.length < ANTALL_KLIENTER) {
      const kandidat = await tenor.dagligLederMedOrg();
      const brukt = [owner, ...clients].some((o) => o.org.orgnr === kandidat.org.orgnr);
      if (!brukt) clients.push(kandidat);
    }

    // Hver klient delegerer tilgangspakken til eier-org, slik at eier får dem som
    // klienter
    await test.step('Klientene delegerer tilgangspakken til eier-org', async () => {
      for (const klient of clients) {
        await enduser.addConnectionAndPackagesToUser(
          klient.dagligLeder.pid,
          klient.org.orgnr,
          owner.org.orgnr,
          [accessPackageUrn],
        );
      }
    });

    name = `Playwright-e2e-${accessPackageApiName}-${Date.now()}`;
    externalRef = TestdataApi.generateExternalRef();

    systemId = await test.step('Create system with access package', async () => {
      return await api.createSystemInSystemregisterWithAccessPackages(vendorOrgNumber, name, [
        { urn: accessPackageUrn },
      ]);
    });

    response = await test.step('Create system user agent request', async () => {
      return await api.postClientDelegationAgentRequest(
        vendorOrgNumber,
        systemId,
        accessPackageApiName,
        owner.org.orgnr,
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
      await login.loginNotChoosingActor(owner.dagligLeder.pid);
      await expect(clientDelegationPage.confirmButton).toBeVisible();
      await clientDelegationPage.confirmButton.click();
      await expect(login.loginButton).toBeVisible();
    });

    await test.step('Login and navigate to system user', async () => {
      await login.LoginToAccessManagement(owner.dagligLeder.pid);
      await login.selectMainUnitBySearching(owner.org.navn);
      await accessManagementFrontPage.systemUserMenuLink.click();

      await expect(clientDelegationPage.systemUserLink(name)).toBeVisible();
      await clientDelegationPage.systemUserLink(name).click();
    });

    await test.step('Add all clients', async () => {
      await clientDelegationPage.addAllCustomers();
      await clientDelegationPage.confirmAndCloseButton.click();
    });

    await test.step('Verify clients are added', async () => {
      for (const klient of clients) {
        const orgNo = klient.org.orgnr;
        const formatted = `Org.nr. ${orgNo.slice(0, 3)} ${orgNo.slice(3, 6)} ${orgNo.slice(6)}`;
        await expect(clientDelegationPage.ownOrgHeading(klient.org.navn)).toBeVisible();
        await expect(
          clientDelegationPage.clientOrgNumber(klient.org.navn, formatted),
        ).toBeVisible();
      }
    });

    await test.step('Add own org to system user', async () => {
      await clientDelegationPage.addOwnOrgButton.click();
    });

    await test.step('Verify own org is added', async () => {
      const orgNo = owner.org.orgnr;
      await expect(clientDelegationPage.ownOrgBadge).toBeVisible();
      await expect(clientDelegationPage.removeOwnOrgButton).toBeVisible();
      await expect(clientDelegationPage.ownOrgHeading(owner.org.navn)).toBeVisible();
      await expect(
        clientDelegationPage.ownOrgNumber(
          owner.org.navn,
          `Org.nr. ${orgNo.slice(0, 3)} ${orgNo.slice(3, 6)} ${orgNo.slice(6)}`,
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

  test.afterEach(async () => {
    // Agent-systembrukeren slettes i UI-steget i testen (API-sletting av en agent
    // med tilordnede klienter feiler). Her fjerner vi systemet og klient-koblingene.
    await cleanupSystemUser({
      vendorOrgNumber,
      ownerOrg: owner.org.orgnr,
      ownerPid: owner.dagligLeder.pid,
      systemName: name,
    });
    for (const klient of clients) {
      try {
        await enduser.deleteConnection(klient.dagligLeder.pid, klient.org.orgnr, [owner.org.orgnr]);
      } catch (error) {
        console.error('Cleanup: Failed to delete client connection:', error);
      }
    }
  });
});
