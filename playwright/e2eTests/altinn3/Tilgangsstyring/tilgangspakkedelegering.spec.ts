import { test } from '../../../fixture/pomFixture';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';
import {
  TenorTestData,
  type TenorPerson,
  type TenorDagligLederMedOrg,
} from '../../../tenor/TenorTestData';
import { cleanupConnection, cleanupPackageDelegation } from '../../../util/delegationCleanup';

type TenorOrg = { orgnr: string; navn: string };

test.describe('tilgangspakkedelegering fra person til person og person til org', () => {
  const api = new EnduserConnection();
  const tenor = new TenorTestData();

  test.describe('Legg til ny person hos deg selv', () => {
    let actor: TenorPerson;
    let target: TenorPerson;

    test.beforeEach(async () => {
      // To bosatte, myndige personer fra Tenor: `actor` logger inn og legger til `target`.
      [actor, target] = await tenor.bosatteMyndigePersoner(2);
    });

    test('Legg til ny person hos deg selv', async ({ login, accessManagementFrontPage }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg ${actor.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(actor.navn);
      });

      await test.step('Gå til brukere-siden og klikk "legg til bruker"', async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickLeggTilBruker();
      });

      await test.step(`Legg til personen ${target.navn}`, async () => {
        await accessManagementFrontPage.addPerson(target.pid, target.etternavn);
      });

      await test.step(`${target.navn} finnes i listen over brukere`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
      });
    });

    test.afterEach(async () => {
      await cleanupConnection(api, { pid: actor.pid, from: actor.pid, to: target.pid });
    });
  });

  test.describe('Legg til ny virksomhet hos deg selv', () => {
    let actor: TenorPerson;
    let target: TenorOrg;

    test.beforeEach(async () => {
      [actor, target] = await Promise.all([
        tenor.bosattMyndigPerson(),
        tenor.hentTilfeldigVirksomhet(),
      ]);
    });

    test('Legg til ny virksomhet hos deg selv', async ({ login, accessManagementFrontPage }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg ${actor.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(actor.navn);
      });

      await test.step('Gå til brukere-siden og klikk "legg til bruker"', async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickLeggTilBruker();
      });

      await test.step(`Legg til virksomheten ${target.navn}`, async () => {
        await accessManagementFrontPage.addOrg(target.orgnr);
      });

      await test.step(`${target.navn} finnes i listen over brukere`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
      });
    });

    test.afterEach(async () => {
      await cleanupConnection(api, { pid: actor.pid, from: actor.pid, to: target.orgnr });
    });
  });

  test.describe('Deleger tilgangspakke til person', () => {
    let actor: TenorPerson;
    let target: TenorPerson;
    const pkg = {
      urn: 'urn:altinn:accesspackage:innbygger-utdanning',
      name: 'Utdanning',
      area: 'Arbeidsliv, skole og utdanning',
    };

    test.beforeEach(async () => {
      // `actor` delegerer (logger inn og representerer seg selv), `target` mottar.
      [actor, target] = await tenor.bosatteMyndigePersoner(2);
      await api.addConnection(actor.pid, actor.pid, target.pid);
    });

    test('Deleger tilgangspakke til person', async ({ login, accessManagementFrontPage }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg ${actor.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(actor.navn);
      });

      await test.step(`Gå til brukere-siden og klikk på "${target.navn}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
      });

      await test.step(`Gi ${target.navn} fullmakt til tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.clickGiFullmaktForTilgangspakke(pkg.name);
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${target.navn} skal ha tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.userCanDeletePackage(pkg.name);
      });
    });

    test.afterEach(async () => {
      await cleanupConnection(api, { pid: actor.pid, from: actor.pid, to: target.pid });
    });
  });

  test.describe('Deleger tilgangspakke til virksomhet', () => {
    let actor: TenorPerson;
    let target: TenorOrg;
    const accessPackage = {
      urn: 'urn:altinn:accesspackage:innbygger-utdanning',
      name: 'Utdanning',
      area: 'Arbeidsliv, skole og utdanning',
    };

    test.beforeEach(async () => {
      [actor, target] = await Promise.all([
        tenor.bosattMyndigPerson(),
        tenor.hentTilfeldigVirksomhet(),
      ]);
      await api.addConnection(actor.pid, actor.pid, target.orgnr);
    });

    test('Deleger tilgangspakke til virksomhet', async ({ login, accessManagementFrontPage }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg ${actor.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(actor.navn);
      });

      await test.step(`Gå til brukere-siden og klikk på "${target.navn}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
      });

      await test.step(`Gi ${target.navn} fullmakt til tilgangspakken "${accessPackage.name}"`, async () => {
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.goToArea(accessPackage.area);
        await accessManagementFrontPage.clickGiFullmaktForTilgangspakke(accessPackage.name);
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${target.navn} skal ha tilgangspakken "${accessPackage.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
        await accessManagementFrontPage.goToArea(accessPackage.area);
        await accessManagementFrontPage.userCanDeletePackage(accessPackage.name);
      });
    });

    test.afterEach(async () => {
      await cleanupConnection(api, { pid: actor.pid, from: actor.pid, to: target.orgnr });
    });
  });

  test.describe('Slett tilgangspakke hos person', () => {
    let actor: TenorPerson;
    let target: TenorPerson;
    const accessPackage = {
      urn: 'urn:altinn:accesspackage:innbygger-samliv',
      name: 'Samliv',
      area: 'Familie og fritid',
    };

    test.beforeEach(async () => {
      [actor, target] = await tenor.bosatteMyndigePersoner(2);
      await api.addConnectionAndPackagesToUser(actor.pid, actor.pid, target.pid, [
        accessPackage.urn,
      ]);
    });

    test('Slett tilgangspakke hos person', async ({ login, accessManagementFrontPage }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg ${actor.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(actor.navn);
      });

      await test.step(`Gå til brukere-siden og klikk på "${target.navn}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
      });

      await test.step(`Slett "${accessPackage.name}" fullmakten for ${target.navn}`, async () => {
        await accessManagementFrontPage.goToArea(accessPackage.area);
        await accessManagementFrontPage.clickSlettFullmaktForTilgangspakke(accessPackage.name);
      });

      await test.step(`${target.navn} ikke skal ha tilgangspakken "${accessPackage.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.goToArea(accessPackage.area);
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(accessPackage.name);
      });
    });

    test.afterEach(async ({}, testInfo) => {
      await cleanupPackageDelegation(
        api,
        { pid: actor.pid, from: actor.pid, to: target.pid },
        accessPackage.urn,
        { skipPackage: testInfo.status === 'passed' },
      );
    });
  });

  test.describe('Slett tilgangspakke hos virksomhet', () => {
    let actor: TenorPerson;
    let target: TenorOrg;
    const accessPackage = {
      urn: 'urn:altinn:accesspackage:innbygger-samliv',
      name: 'Samliv',
      area: 'Familie og fritid',
    };

    test.beforeEach(async () => {
      [actor, target] = await Promise.all([
        tenor.bosattMyndigPerson(),
        tenor.hentTilfeldigVirksomhet(),
      ]);
      await api.addConnectionAndPackagesToUser(actor.pid, actor.pid, target.orgnr, [
        accessPackage.urn,
      ]);
    });

    test('Slett tilgangspakke hos virksomhet', async ({ login, accessManagementFrontPage }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg ${actor.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(actor.navn);
      });

      await test.step(`Gå til brukere-siden og klikk på "${target.navn}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
      });

      await test.step(`Slett "${accessPackage.name}" fullmakten for ${target.navn}`, async () => {
        await accessManagementFrontPage.goToArea(accessPackage.area);
        await accessManagementFrontPage.clickSlettFullmaktForTilgangspakke(accessPackage.name);
      });

      await test.step(`${target.navn} ikke skal ha tilgangspakken "${accessPackage.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.goToArea(accessPackage.area);
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(accessPackage.name);
      });
    });

    test.afterEach(async ({}, testInfo) => {
      await cleanupPackageDelegation(
        api,
        { pid: actor.pid, from: actor.pid, to: target.orgnr },
        accessPackage.urn,
        { skipPackage: testInfo.status === 'passed' },
      );
    });
  });
});

test.describe('tilgangspakkedelegering fra org til person og org til org', () => {
  const api = new EnduserConnection();
  const tenor = new TenorTestData();

  test.describe('Legg til ny person hos din org', () => {
    let actor: TenorDagligLederMedOrg;
    let target: TenorPerson;

    test.beforeEach(async () => {
      // `actor` er daglig leder som representerer sin virksomhet; `target` legges til som bruker.
      [actor, target] = await Promise.all([tenor.dagligLederMedOrg(), tenor.bosattMyndigPerson()]);
    });

    test('Legg til ny person hos din org', async ({ login, accessManagementFrontPage }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.dagligLeder.pid);
      });

      await test.step(`Velg org ${actor.org.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(actor.org.navn);
      });

      await test.step('Gå til brukere-siden og klikk "legg til bruker"', async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickLeggTilBruker();
      });

      await test.step(`Legg til personen ${target.navn}`, async () => {
        await accessManagementFrontPage.addPerson(target.pid, target.etternavn);
      });

      await test.step(`${target.navn} finnes i listen over brukere`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
      });
    });

    test.afterEach(async () => {
      await cleanupConnection(api, {
        pid: actor.dagligLeder.pid,
        from: actor.org.orgnr,
        to: target.pid,
      });
    });
  });

  test.describe('Legg til ny virksomhet hos din org', () => {
    let actor: TenorDagligLederMedOrg;
    let target: TenorOrg;

    test.beforeEach(async () => {
      actor = await tenor.dagligLederMedOrg();
      // Ekskluder aktørens egen org så vi ikke delegerer til oss selv.
      target = await tenor.hentTilfeldigVirksomhet({ ekskluder: [actor.org.orgnr] });
    });

    test('Legg til ny virksomhet hos din org', async ({ login, accessManagementFrontPage }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.dagligLeder.pid);
      });

      await test.step(`Velg org ${actor.org.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(actor.org.navn);
      });

      await test.step('Gå til brukere-siden og klikk "legg til bruker"', async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickLeggTilBruker();
      });

      await test.step(`Legg til virksomheten ${target.navn}`, async () => {
        await accessManagementFrontPage.addOrg(target.orgnr);
      });

      await test.step(`${target.navn} finnes i listen over brukere`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
      });
    });

    test.afterEach(async () => {
      await cleanupConnection(api, {
        pid: actor.dagligLeder.pid,
        from: actor.org.orgnr,
        to: target.orgnr,
      });
    });
  });

  test.describe('Deleger tilgangspakke til person', () => {
    let actor: TenorDagligLederMedOrg;
    let target: TenorPerson;
    const pkg = {
      urn: 'urn:altinn:accesspackage:posttjenester',
      name: 'Posttjenester',
      area: 'Andre tjenesteytende næringer',
    };

    test.beforeEach(async () => {
      [actor, target] = await Promise.all([tenor.dagligLederMedOrg(), tenor.bosattMyndigPerson()]);
      await api.addConnection(actor.dagligLeder.pid, actor.org.orgnr, target.pid);
    });

    test('Deleger tilgangspakke til person', async ({ login, accessManagementFrontPage }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.dagligLeder.pid);
      });

      await test.step(`Velg org ${actor.org.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(actor.org.navn);
      });

      await test.step(`Gå til brukere-siden og klikk på "${target.navn}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
      });

      await test.step(`Gi ${target.navn} fullmakt til tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.clickGiFullmaktForTilgangspakke(pkg.name);
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${target.navn} skal ha tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.userCanDeletePackage(pkg.name);
      });
    });

    test.afterEach(async () => {
      await cleanupConnection(api, {
        pid: actor.dagligLeder.pid,
        from: actor.org.orgnr,
        to: target.pid,
      });
    });
  });

  test.describe('Deleger tilgangspakke til virksomhet', () => {
    let actor: TenorDagligLederMedOrg;
    let target: TenorOrg;
    const pkg = {
      urn: 'urn:altinn:accesspackage:posttjenester',
      name: 'Posttjenester',
      area: 'Andre tjenesteytende næringer',
    };

    test.beforeEach(async () => {
      actor = await tenor.dagligLederMedOrg();
      // Ekskluder aktørens egen org så vi ikke delegerer til oss selv.
      target = await tenor.hentTilfeldigVirksomhet({ ekskluder: [actor.org.orgnr] });
      await api.addConnection(actor.dagligLeder.pid, actor.org.orgnr, target.orgnr);
    });

    test('Deleger tilgangspakke til virksomhet', async ({ login, accessManagementFrontPage }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.dagligLeder.pid);
      });

      await test.step(`Velg org ${actor.org.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(actor.org.navn);
      });

      await test.step(`Gå til brukere-siden og klikk på "${target.navn}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
      });

      await test.step(`Gi ${target.navn} fullmakt til tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.clickGiFullmaktForTilgangspakke(pkg.name);
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${target.navn} skal ha tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.userCanDeletePackage(pkg.name);
      });
    });

    test.afterEach(async () => {
      await cleanupConnection(api, {
        pid: actor.dagligLeder.pid,
        from: actor.org.orgnr,
        to: target.orgnr,
      });
    });
  });

  test.describe('Slett tilgangspakke hos person', () => {
    let actor: TenorDagligLederMedOrg;
    let target: TenorPerson;
    const pkg = {
      urn: 'urn:altinn:accesspackage:posttjenester',
      name: 'Posttjenester',
      area: 'Andre tjenesteytende næringer',
    };

    test.beforeEach(async () => {
      [actor, target] = await Promise.all([tenor.dagligLederMedOrg(), tenor.bosattMyndigPerson()]);
      await api.addConnectionAndPackagesToUser(actor.dagligLeder.pid, actor.org.orgnr, target.pid, [
        pkg.urn,
      ]);
    });

    test('Slett tilgangspakke hos person', async ({ login, accessManagementFrontPage }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.dagligLeder.pid);
      });

      await test.step(`Velg org ${actor.org.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(actor.org.navn);
      });

      await test.step(`Gå til brukere-siden og klikk på "${target.navn}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
      });

      await test.step(`Slett tilgangspakken "${pkg.name}" for ${target.navn}`, async () => {
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.clickSlettFullmaktForTilgangspakke(pkg.name);
      });

      await test.step(`${target.navn} ikke skal ha tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(pkg.name);
      });
    });

    test.afterEach(async ({}, testInfo) => {
      await cleanupPackageDelegation(
        api,
        { pid: actor.dagligLeder.pid, from: actor.org.orgnr, to: target.pid },
        pkg.urn,
        { skipPackage: testInfo.status === 'passed' },
      );
    });
  });

  test.describe('Slett tilgangspakke hos virksomhet', () => {
    let actor: TenorDagligLederMedOrg;
    let target: TenorOrg;
    const pkg = {
      urn: 'urn:altinn:accesspackage:posttjenester',
      name: 'Posttjenester',
      area: 'Andre tjenesteytende næringer',
    };

    test.beforeEach(async () => {
      actor = await tenor.dagligLederMedOrg();
      // Ekskluder aktørens egen org så vi ikke delegerer til oss selv.
      target = await tenor.hentTilfeldigVirksomhet({ ekskluder: [actor.org.orgnr] });
      await api.addConnectionAndPackagesToUser(
        actor.dagligLeder.pid,
        actor.org.orgnr,
        target.orgnr,
        [pkg.urn],
      );
    });

    test('Slett tilgangspakke hos virksomhet', async ({ login, accessManagementFrontPage }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.dagligLeder.pid);
      });

      await test.step(`Velg org ${actor.org.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(actor.org.navn);
      });

      await test.step(`Gå til brukere-siden og klikk på "${target.navn}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
      });

      await test.step(`Slett "${pkg.name}" fullmakten for ${target.navn}`, async () => {
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.clickSlettFullmaktForTilgangspakke(pkg.name);
      });

      await test.step(`${target.navn} ikke skal ha tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.navn);
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(pkg.name);
      });
    });

    test.afterEach(async ({}, testInfo) => {
      await cleanupPackageDelegation(
        api,
        { pid: actor.dagligLeder.pid, from: actor.org.orgnr, to: target.orgnr },
        pkg.urn,
        { skipPackage: testInfo.status === 'passed' },
      );
    });
  });
});
