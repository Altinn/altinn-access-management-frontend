import { test, expect } from 'playwright/fixture/pomFixture';

import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
import { TestdataApi } from 'playwright/util/TestdataApi';
import { LoginPage } from 'playwright/pages/LoginPage';
import { SystemUserPage } from 'playwright/pages/systemuser/SystemUserPage';
import { ClientDelegationPage } from 'playwright/pages/systemuser/ClientDelegation';
import { EnduserConnection } from 'playwright/api-requests/EnduserConnection';
import { cleanupSystemUser } from 'playwright/util/systemUserCleanup';
import {
  TenorTestData,
  type TenorPerson,
  type TenorDagligLederMedOrg,
} from 'playwright/tenor/TenorTestData';

// Leverandør er registrert infrastruktur (ikke Tenor). Eier-virksomheten hentes
// fra Tenor: daglig leder godkjenner, mens en kontaktperson (en vanlig
// rettighetshaver uten tilgangsstyrer-rettigheter) bare kan eskalere.
//
// NB: I Tenor har en AS enten en daglig leder ELLER en kontaktperson (KONT),
// aldri begge. Vi henter derfor en virksomhet med daglig leder og kobler en egen
// person til som kontaktperson via API.
const vendorOrgNumber = '312591332';

test.describe('Systembruker - Eskaler', () => {
  const tenor = new TenorTestData();
  const enduser = new EnduserConnection();

  let api: ApiRequests;
  let owner: {
    dagligLeder: TenorPerson;
    kontaktperson: TenorPerson;
    org: { orgnr: string; navn: string };
  };
  let name: string;
  let systemId: string;
  let externalRef: string;
  let response: { confirmUrl: string; id: string };
  let systemUserId: string;

  test.beforeEach(async () => {
    api = new ApiRequests();
    const [virksomhet, kontaktperson]: [TenorDagligLederMedOrg, TenorPerson] = await Promise.all([
      tenor.dagligLederMedOrg(),
      tenor.bosattMyndigPerson(),
    ]);
    owner = { dagligLeder: virksomhet.dagligLeder, kontaktperson, org: virksomhet.org };
    name = `Playwright-e2e-eskaler-${Date.now()}`;
    externalRef = TestdataApi.generateExternalRef();

    systemId = await test.step('Create system', async () => {
      return await api.createSystemInSystemregisterWithAccessPackages(
        vendorOrgNumber,
        name,
        [{ urn: 'urn:altinn:accesspackage:baerekraft' }],
        'https://example.com/',
        [
          { resource: [{ value: 'authentication-e2e-test', id: 'urn:altinn:resource' }] },
          { resource: [{ value: 'vegardtestressurs', id: 'urn:altinn:resource' }] },
        ],
      );
    });
    response = await test.step('Create system user request', async () => {
      return await api.postSystemuserRequest(
        vendorOrgNumber,
        externalRef,
        systemId,
        owner.org.orgnr,
        undefined,
        [
          { resource: [{ value: 'vegardtestressurs', id: 'urn:altinn:resource' }] },
          { resource: [{ value: 'authentication-e2e-test', id: 'urn:altinn:resource' }] },
        ],
        [{ urn: 'urn:altinn:accesspackage:baerekraft' }],
      );
    });

    // Kontaktpersonen kobles som en vanlig rettighetshaver (uten tilgangsstyrer-
    // rettigheter), slik at hen kan eskalere forespørselen, men ikke godkjenne.
    await test.step('Koble kontaktperson til virksomheten', async () => {
      await enduser.addConnection(owner.dagligLeder.pid, owner.org.orgnr, owner.kontaktperson.pid);
    });
  });

  test('Eskaler Systembrukerforespørsel som "vanlig" bruker og godkjenn som daglig leder', async ({
    page,
    login,
    systemUserPage,
    browser,
  }): Promise<void> => {
    await test.step('Login as regular user, select actor and escalate request', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(owner.kontaktperson.pid);
      await systemUserPage.escalateConfirmButton.click();
      await Promise.all([page.waitForLoadState('load'), systemUserPage.finish.click()]);
    });

    const managerContext = await browser.newContext();
    const managerPage = await managerContext.newPage();
    const managerLogin = new LoginPage(managerPage);
    const managerSystemUserPage = new SystemUserPage(managerPage);
    const managerClientDelegationPage = new ClientDelegationPage(managerPage);

    await test.step('Login as manager and choose reportee', async () => {
      await managerLogin.LoginToAccessManagement(owner.dagligLeder.pid);
      await managerLogin.selectMainUnitBySearching(owner.org.navn);
    });

    await test.step('Find and approve escalated request', async () => {
      await managerSystemUserPage.requestsMenuItem.click();
      await managerSystemUserPage.requestLink(response.id).click();
      await expect(managerClientDelegationPage.confirmButton).toBeVisible();
      await managerClientDelegationPage.confirmButton.click();
    });

    await test.step('Verify system user was created with proper rights', async () => {
      await managerClientDelegationPage.systemUserLink(name).click();
      systemUserId = new URL(managerPage.url()).pathname.split('/').pop()!;
      await expect(managerPage.getByRole('button', { name: 'Bærekraft' })).toBeVisible();
      await expect(managerPage.getByRole('button', { name: 'vegardendetilende' })).toBeVisible();
      await expect(
        managerPage.getByRole('button', { name: 'authentication-e2e-test' }),
      ).toBeVisible();
    });

    await managerContext.close();
  });

  test.afterEach(async () => {
    await cleanupSystemUser({
      vendorOrgNumber,
      ownerOrg: owner.org.orgnr,
      ownerPid: owner.dagligLeder.pid,
      systemUserId, // kan være undefined hvis testen feilet før den ble fanget
      systemId,
      externalRef,
      systemName: name,
    });
    try {
      await enduser.deleteConnection(owner.dagligLeder.pid, owner.org.orgnr, [
        owner.kontaktperson.pid,
      ]);
    } catch (error) {
      console.error('Cleanup: Failed to delete kontaktperson connection:', error);
    }
  });
});
