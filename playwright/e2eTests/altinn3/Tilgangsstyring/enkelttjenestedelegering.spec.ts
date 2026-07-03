import { test } from '../../../fixture/pomFixture';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';
import {
  TenorTestData,
  type TenorPerson,
  type TenorDagligLederMedOrg,
} from '../../../tenor/TenorTestData';
import { cleanupServiceDelegation, setupServiceDelegation } from '../../../util/delegationHelpers';

type TenorOrg = { orgnr: string; navn: string };

const service = 'bruno-correspondence';

test.describe('Enkelttjenestedelegering fra person til person og person til org', () => {
  const api = new EnduserConnection();
  const tenor = new TenorTestData();

  test.describe('Deleger enkelttjeneste til person', () => {
    let delegator: TenorPerson;
    let recipient: TenorPerson;

    test.beforeEach(async () => {
      // `delegator` logger inn og representerer seg selv, `recipient` mottar.
      [delegator, recipient] = await tenor.bosatteMyndigePersoner(2);
      await api.addConnection(delegator.pid, delegator.pid, recipient.pid);
    });

    test.afterEach(async () => {
      await cleanupServiceDelegation(
        api,
        { pid: delegator.pid, from: delegator.pid, to: recipient.pid },
        service,
      );
    });

    test('Deleger enkelttjeneste til person', async ({ login, accessManagementFrontPage }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg deg selv (${delegator.navn}) og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(delegator.navn);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.navn}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.navn);
      });

      await test.step(`Gi ${recipient.navn} fullmakt til enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.clickEnkelttjeneste(service);
        await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${recipient.navn} skal ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.navn);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.userCanDeleteEnkelttjeneste(service);
      });
    });
  });

  test.describe('Deleger enkelttjeneste til virksomhet', () => {
    let delegator: TenorPerson;
    let recipient: TenorOrg;

    test.beforeEach(async () => {
      [delegator, recipient] = await Promise.all([
        tenor.bosattMyndigPerson(),
        tenor.hentTilfeldigVirksomhet(),
      ]);
      await api.addConnection(delegator.pid, delegator.pid, recipient.orgnr);
    });

    test.afterEach(async () => {
      await cleanupServiceDelegation(
        api,
        { pid: delegator.pid, from: delegator.pid, to: recipient.orgnr },
        service,
      );
    });

    test('Deleger enkelttjeneste til virksomhet', async ({ login, accessManagementFrontPage }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg deg selv (${delegator.navn}) og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(delegator.navn);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.navn}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.navn);
      });

      await test.step(`Gi ${recipient.navn} fullmakt til enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.clickEnkelttjeneste(service);
        await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${recipient.navn} skal ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.navn);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.userCanDeleteEnkelttjeneste(service);
      });
    });
  });

  test.describe('Slett enkelttjenestedelegering hos person', () => {
    let delegator: TenorPerson;
    let recipient: TenorPerson;

    test.beforeEach(async () => {
      [delegator, recipient] = await tenor.bosatteMyndigePersoner(2);
      await setupServiceDelegation(
        api,
        { pid: delegator.pid, from: delegator.pid, to: recipient.pid },
        service,
      );
    });

    test.afterEach(async ({}, testInfo) => {
      await cleanupServiceDelegation(
        api,
        { pid: delegator.pid, from: delegator.pid, to: recipient.pid },
        service,
        { skipService: testInfo.status === 'passed' },
      );
    });

    test('Slett enkelttjenestedelegering hos person', async ({
      login,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg deg selv (${delegator.navn}) og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(delegator.navn);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.navn}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.navn);
      });

      await test.step(`Slett "${service}" for ${recipient.navn}`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickSlettEnkelttjeneste(service);
      });

      await test.step(`${recipient.navn} skal ikke ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.navn);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable(service);
      });
    });
  });

  test.describe('Slett enkelttjeneste hos virksomhet', () => {
    let delegator: TenorPerson;
    let recipient: TenorOrg;

    test.beforeEach(async () => {
      [delegator, recipient] = await Promise.all([
        tenor.bosattMyndigPerson(),
        tenor.hentTilfeldigVirksomhet(),
      ]);
      await setupServiceDelegation(
        api,
        { pid: delegator.pid, from: delegator.pid, to: recipient.orgnr },
        service,
      );
    });

    test.afterEach(async ({}, testInfo) => {
      await cleanupServiceDelegation(
        api,
        { pid: delegator.pid, from: delegator.pid, to: recipient.orgnr },
        service,
        { skipService: testInfo.status === 'passed' },
      );
    });

    test('Slett enkelttjeneste hos virksomhet', async ({ login, accessManagementFrontPage }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg deg selv (${delegator.navn}) og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(delegator.navn);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.navn}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.navn);
      });

      await test.step(`Slett "${service}" for ${recipient.navn}`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickSlettEnkelttjeneste(service);
      });

      await test.step(`${recipient.navn} skal ikke ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.navn);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable(service);
      });
    });
  });
});

test.describe('Enkelttjenestedelegering fra org til person og org til org', () => {
  const api = new EnduserConnection();
  const tenor = new TenorTestData();

  test.describe('Deleger enkelttjeneste fra org til person', () => {
    let delegator: TenorDagligLederMedOrg;
    let recipient: TenorPerson;

    test.beforeEach(async () => {
      [delegator, recipient] = await Promise.all([
        tenor.dagligLederMedOrg(),
        tenor.bosattMyndigPerson(),
      ]);
      await api.addConnection(delegator.dagligLeder.pid, delegator.org.orgnr, recipient.pid);
    });

    test.afterEach(async () => {
      await cleanupServiceDelegation(
        api,
        { pid: delegator.dagligLeder.pid, from: delegator.org.orgnr, to: recipient.pid },
        service,
      );
    });

    test('Deleger enkelttjeneste fra org til person', async ({
      login,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.dagligLeder.pid);
      });

      await test.step(`Velg org ${delegator.org.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(delegator.org.navn);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.navn}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.navn);
      });

      await test.step(`Gi ${recipient.navn} fullmakt til enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.clickEnkelttjeneste(service);
        await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${recipient.navn} skal ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.navn);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.userCanDeleteEnkelttjeneste(service);
      });
    });
  });

  test.describe('Deleger enkelttjeneste fra org til org', () => {
    let delegator: TenorDagligLederMedOrg;
    let recipient: TenorOrg;

    test.beforeEach(async () => {
      delegator = await tenor.dagligLederMedOrg();
      // Ekskluder aktørens egen org så vi ikke delegerer til oss selv.
      recipient = await tenor.hentTilfeldigVirksomhet({ ekskluder: [delegator.org.orgnr] });
      await api.addConnection(delegator.dagligLeder.pid, delegator.org.orgnr, recipient.orgnr);
    });

    test.afterEach(async () => {
      await cleanupServiceDelegation(
        api,
        { pid: delegator.dagligLeder.pid, from: delegator.org.orgnr, to: recipient.orgnr },
        service,
      );
    });

    test('Deleger enkelttjeneste fra org til org', async ({ login, accessManagementFrontPage }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.dagligLeder.pid);
      });

      await test.step(`Velg org ${delegator.org.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(delegator.org.navn);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.navn}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.navn);
      });

      await test.step(`Gi ${recipient.navn} fullmakt til enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.clickEnkelttjeneste(service);
        await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${recipient.navn} skal ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.navn);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.userCanDeleteEnkelttjeneste(service);
      });
    });
  });

  test.describe('Slett enkelttjenestedelegering fra org til person', () => {
    let delegator: TenorDagligLederMedOrg;
    let recipient: TenorPerson;

    test.beforeEach(async () => {
      [delegator, recipient] = await Promise.all([
        tenor.dagligLederMedOrg(),
        tenor.bosattMyndigPerson(),
      ]);
      await setupServiceDelegation(
        api,
        { pid: delegator.dagligLeder.pid, from: delegator.org.orgnr, to: recipient.pid },
        service,
      );
    });

    test.afterEach(async ({}, testInfo) => {
      await cleanupServiceDelegation(
        api,
        { pid: delegator.dagligLeder.pid, from: delegator.org.orgnr, to: recipient.pid },
        service,
        { skipService: testInfo.status === 'passed' },
      );
    });

    test('Slett enkelttjenestedelegering fra org til person', async ({
      login,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.dagligLeder.pid);
      });

      await test.step(`Velg org ${delegator.org.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(delegator.org.navn);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.navn}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.navn);
      });

      await test.step(`Slett "${service}" for ${recipient.navn}`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickSlettEnkelttjeneste(service);
      });

      await test.step(`${recipient.navn} skal ikke ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.navn);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable(service);
      });
    });
  });

  test.describe('Slett enkelttjeneste fra org til org', () => {
    let delegator: TenorDagligLederMedOrg;
    let recipient: TenorOrg;

    test.beforeEach(async () => {
      delegator = await tenor.dagligLederMedOrg();
      recipient = await tenor.hentTilfeldigVirksomhet({ ekskluder: [delegator.org.orgnr] });
      await setupServiceDelegation(
        api,
        { pid: delegator.dagligLeder.pid, from: delegator.org.orgnr, to: recipient.orgnr },
        service,
      );
    });

    test.afterEach(async ({}, testInfo) => {
      await cleanupServiceDelegation(
        api,
        { pid: delegator.dagligLeder.pid, from: delegator.org.orgnr, to: recipient.orgnr },
        service,
        { skipService: testInfo.status === 'passed' },
      );
    });

    test('Slett enkelttjeneste fra org til org', async ({ login, accessManagementFrontPage }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.dagligLeder.pid);
      });

      await test.step(`Velg org ${delegator.org.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(delegator.org.navn);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.navn}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.navn);
      });

      await test.step(`Slett "${service}" for ${recipient.navn}`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickSlettEnkelttjeneste(service);
      });

      await test.step(`${recipient.navn} skal ikke ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.navn);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable(service);
      });
    });
  });
});
