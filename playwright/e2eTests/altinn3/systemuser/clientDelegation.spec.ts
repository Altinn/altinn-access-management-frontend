import { test, expect } from '../../../fixture/pomFixture';

import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
import { pickVendorOrg } from 'playwright/util/systemVendors';
import { TestdataApi } from 'playwright/util/TestdataApi';
import { cleanupSystemUser } from 'playwright/util/systemUserCleanup';
import {
  TenorTestData,
  type TenorFacilitatorMedKlienter,
  type TenorOrgRef,
} from 'playwright/tenor/TenorTestData';

// Leverandøren roteres over en liste (pickVendorOrg) — en hvilken som helst
// virksomhet kan opptre som systemleverandør. Facilitator-virksomheten og dens
// klienter hentes fra Tenor.
const vendorOrgNumber = pickVendorOrg();

test.describe('Delegering av klienter til Systembruker', () => {
  const tenor = new TenorTestData();
  let api: ApiRequests;

  test.beforeEach(() => {
    api = new ApiRequests();
  });

  // NB: Bevisst hardkodet facilitator. Denne testen delegerer ALLE klienter med
  // ett klikk (addAllCustomers), så facilitatoren må ha få klienter. En revisor
  // fra Tenor har typisk svært mange klienter (ingen med <=10 blant kandidatene),
  // og «deleger alle» ville da blitt tregt. Vi beholder derfor en kjent revisor
  // med få klienter her. De to andre rollene bruker Tenor.
  test.describe('Ansvarlig revisor', () => {
    const role = 'revisor';
    const accessPackageApiName = 'ansvarlig-revisor';
    const accessPackageDisplayName = 'Ansvarlig revisor';

    const user = {
      pid: '07875898560',
      org: '314251768',
      name: 'KUNST STERK MINK ANS',
    };

    let name: string;
    let systemId: string;
    let externalRef: string;
    let response: { confirmUrl: string };

    test.beforeEach(async () => {
      name = `Playwright-e2e-${role}-${Date.now()}`;
      externalRef = TestdataApi.generateExternalRef();

      systemId = await test.step('Create system with access packages', async () => {
        return await api.createSystemInSystemregisterWithAccessPackages(vendorOrgNumber, name);
      });

      response = await test.step('Create client delegation agent request', async () => {
        return await api.postClientDelegationAgentRequest(
          vendorOrgNumber,
          systemId,
          accessPackageApiName,
          user.org,
          externalRef,
        );
      });
    });

    test('Ansvarlig revisor - add all customers with one click', async ({
      page,
      login,
      accessManagementFrontPage,
      clientDelegationPage,
    }) => {
      await test.step('Approve system user request', async () => {
        await page.goto(response.confirmUrl);
        await login.loginNotChoosingActor(user.pid);
        await clientDelegationPage.confirmAndCreateSystemUser(accessPackageDisplayName);
        await expect(login.loginButton).toBeVisible();
      });

      await test.step('Login and navigate to system user', async () => {
        await login.LoginToAccessManagement(user.pid);
        await login.selectMainUnitBySearching(user.name);

        await accessManagementFrontPage.systemUserMenuLink.click();

        await expect(clientDelegationPage.systemUserLink(name)).toBeVisible();
        await clientDelegationPage.systemUserLink(name).click();
      });

      await test.step('Open system user and delegate all customers with one click', async () => {
        await clientDelegationPage.openSystemUser(accessPackageDisplayName);
        await clientDelegationPage.addAllCustomers();
        await clientDelegationPage.confirmAndCloseButton.click();
      });

      // Agent-systembruker med tilordnede klienter må slettes i UI (API-sletting feiler).
      await test.step('Cleanup: Delete system user', async () => {
        await clientDelegationPage.deleteSystemUser(name);
      });
    });

    test.afterEach(async () => {
      await cleanupSystemUser({
        vendorOrgNumber,
        ownerOrg: user.org,
        ownerPid: user.pid,
        systemName: name,
      });
    });
  });

  test.describe('Regnskapsfører', () => {
    const role = 'regnskapsfoerer';
    const accessPackageApiName = 'regnskapsforer-lonn';
    const accessPackageDisplayName = 'Regnskapsfører lønn';

    let facilitator: TenorFacilitatorMedKlienter;
    let customer: TenorOrgRef;
    let name: string;
    let systemId: string;
    let externalRef: string;
    let response: { confirmUrl: string };

    test.beforeEach(async () => {
      facilitator = await tenor.facilitatorMedKlienter(role);
      customer = facilitator.klienter[0];
      name = `Playwright-e2e-${role}-${Date.now()}`;
      externalRef = TestdataApi.generateExternalRef();

      systemId = await test.step('Create system with access packages', async () => {
        return await api.createSystemInSystemregisterWithAccessPackages(vendorOrgNumber, name);
      });

      response = await test.step('Create client delegation agent request', async () => {
        return await api.postClientDelegationAgentRequest(
          vendorOrgNumber,
          systemId,
          accessPackageApiName,
          facilitator.org.orgnr,
          externalRef,
        );
      });
    });

    test('Regnskapsfører', async ({
      page,
      login,
      accessManagementFrontPage,
      clientDelegationPage,
    }) => {
      await test.step('Approve system user request', async () => {
        await page.goto(response.confirmUrl);
        await login.loginNotChoosingActor(facilitator.dagligLeder.pid);
        await clientDelegationPage.confirmAndCreateSystemUser(accessPackageDisplayName);
        await expect(login.loginButton).toBeVisible();
      });

      await test.step('Login and navigate to system user', async () => {
        await login.LoginToAccessManagement(facilitator.dagligLeder.pid);
        await login.selectMainUnitBySearching(facilitator.org.navn);

        await accessManagementFrontPage.systemUserMenuLink.click();

        await expect(clientDelegationPage.systemUserLink(name)).toBeVisible();
        await clientDelegationPage.systemUserLink(name).click();
      });

      await test.step(`Open system user and delegate customer ${customer.navn}`, async () => {
        await clientDelegationPage.openSystemUser(accessPackageDisplayName);
        await clientDelegationPage.addCustomer(customer.navn, customer.navn, customer.orgnr);
      });

      await test.step('Cleanup: Delete system user', async () => {
        await clientDelegationPage.deleteSystemUser(name);
      });
    });

    test.afterEach(async () => {
      await cleanupSystemUser({
        vendorOrgNumber,
        ownerOrg: facilitator.org.orgnr,
        ownerPid: facilitator.dagligLeder.pid,
        systemName: name,
      });
    });
  });

  test.describe('Forretningsfører', () => {
    const role = 'forretningsfoerer';
    const accessPackageApiName = 'forretningsforer-eiendom';
    const accessPackageDisplayName = 'Forretningsforer eiendom';

    // forretningsforer-eiendom kan kun delegeres for eiendomsklienter (BRL/ESEK),
    // så vi henter en forretningsfører med en slik klient.
    let facilitator: { dagligLeder: { pid: string }; org: TenorOrgRef; klient: TenorOrgRef };
    let name: string;
    let systemId: string;
    let externalRef: string;
    let response: { confirmUrl: string };

    test.beforeEach(async () => {
      facilitator = await tenor.forretningsfoererMedEiendomsklient();
      name = `Playwright-e2e-${role}-${Date.now()}`;
      externalRef = TestdataApi.generateExternalRef();

      systemId = await test.step('Create system with access packages', async () => {
        return await api.createSystemInSystemregisterWithAccessPackages(vendorOrgNumber, name);
      });

      response = await test.step('Create client delegation agent request', async () => {
        return await api.postClientDelegationAgentRequest(
          vendorOrgNumber,
          systemId,
          accessPackageApiName,
          facilitator.org.orgnr,
          externalRef,
        );
      });
    });

    test('Forretningsfører', async ({
      page,
      login,
      accessManagementFrontPage,
      clientDelegationPage,
    }) => {
      await test.step('Approve system user request', async () => {
        await page.goto(response.confirmUrl);
        await login.loginNotChoosingActor(facilitator.dagligLeder.pid);
        await clientDelegationPage.confirmAndCreateSystemUser(accessPackageDisplayName);
        await expect(login.loginButton).toBeVisible();
      });

      await test.step('Login and navigate to system user', async () => {
        await login.LoginToAccessManagement(facilitator.dagligLeder.pid);
        await login.selectMainUnitBySearching(facilitator.org.navn);

        await accessManagementFrontPage.systemUserMenuLink.click();

        await expect(clientDelegationPage.systemUserLink(name)).toBeVisible();
        await clientDelegationPage.systemUserLink(name).click();
      });

      await test.step(`Open system user and delegate customer ${facilitator.klient.navn}`, async () => {
        await clientDelegationPage.openSystemUser(accessPackageDisplayName);
        await clientDelegationPage.addCustomer(
          facilitator.klient.navn,
          facilitator.klient.navn,
          facilitator.klient.orgnr,
        );
      });

      await test.step('Cleanup: Delete system user', async () => {
        await clientDelegationPage.deleteSystemUser(name);
      });
    });

    test.afterEach(async () => {
      await cleanupSystemUser({
        vendorOrgNumber,
        ownerOrg: facilitator.org.orgnr,
        ownerPid: facilitator.dagligLeder.pid,
        systemName: name,
      });
    });
  });
});
