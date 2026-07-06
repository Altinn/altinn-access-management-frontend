import { test } from '../../../fixture/pomFixture';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';
import type { Testperson, DagligLederMedOrg } from '../../../tenor/TenorTestData';
import {
  cleanupConnection,
  cleanupPackageDelegation,
  setupPackagesForUser,
} from '../../../util/delegationHelpers';

type Testorganisasjon = { orgnr: string; navn: string };

test.describe('tilgangspakkedelegering fra person til person og person til org', () => {
  const api = new EnduserConnection();

  test.describe('Legg til ny person hos deg selv', () => {
    let actor: Testperson;
    let target: Testperson;

    test.beforeEach(async ({ testData }) => {
      // To bosatte, myndige personer fra Tenor: `actor` logger inn og legger til `target`.
      [actor, target] = await testData.bosatteMyndigePersoner(2);

      testData.hovedenhetMedUnderenhet();
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
    let actor: Testperson;
    let target: Testorganisasjon;

    test.beforeEach(async ({ testData }) => {
      [actor, target] = await Promise.all([
        testData.bosattMyndigPerson(),
        testData.hentTilfeldigVirksomhet(),
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
    let actor: Testperson;
    let target: Testperson;
    const pkg = {
      urn: 'urn:altinn:accesspackage:innbygger-utdanning',
      name: 'Utdanning',
      area: 'Arbeidsliv, skole og utdanning',
    };

    test.beforeEach(async ({ testData: testData }) => {
      // `actor` delegerer (logger inn og representerer seg selv), `target` mottar.
      [actor, target] = await testData.bosatteMyndigePersoner(2);
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
    let actor: Testperson;
    let target: Testorganisasjon;
    const accessPackage = {
      urn: 'urn:altinn:accesspackage:innbygger-utdanning',
      name: 'Utdanning',
      area: 'Arbeidsliv, skole og utdanning',
    };

    test.beforeEach(async ({ testData }) => {
      [actor, target] = await Promise.all([
        testData.bosattMyndigPerson(),
        testData.hentTilfeldigVirksomhet(),
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
    let actor: Testperson;
    let target: Testperson;
    const accessPackage = {
      urn: 'urn:altinn:accesspackage:innbygger-samliv',
      name: 'Samliv',
      area: 'Familie og fritid',
    };

    test.beforeEach(async ({ testData }) => {
      [actor, target] = await testData.bosatteMyndigePersoner(2);
      await setupPackagesForUser(api, { pid: actor.pid, from: actor.pid, to: target.pid }, [
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
    let actor: Testperson;
    let target: Testorganisasjon;
    const accessPackage = {
      urn: 'urn:altinn:accesspackage:innbygger-samliv',
      name: 'Samliv',
      area: 'Familie og fritid',
    };

    test.beforeEach(async ({ testData }) => {
      [actor, target] = await Promise.all([
        testData.bosattMyndigPerson(),
        testData.hentTilfeldigVirksomhet(),
      ]);
      await setupPackagesForUser(api, { pid: actor.pid, from: actor.pid, to: target.orgnr }, [
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

  test.describe('Legg til ny person hos din org', () => {
    let actor: DagligLederMedOrg;
    let target: Testperson;

    test.beforeEach(async ({ testData }) => {
      // `actor` er daglig leder som representerer sin virksomhet; `target` legges til som bruker.
      [actor, target] = await Promise.all([
        testData.dagligLederMedOrg(),
        testData.bosattMyndigPerson(),
      ]);
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
    let actor: DagligLederMedOrg;
    let target: Testorganisasjon;

    test.beforeEach(async ({ testData }) => {
      actor = await testData.dagligLederMedOrg();
      // Ekskluder aktørens egen org så vi ikke delegerer til oss selv.
      target = await testData.hentTilfeldigVirksomhet({ ekskluder: [actor.org.orgnr] });
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
    let actor: DagligLederMedOrg;
    let target: Testperson;
    const pkg = {
      urn: 'urn:altinn:accesspackage:posttjenester',
      name: 'Posttjenester',
      area: 'Andre tjenesteytende næringer',
    };

    test.beforeEach(async ({ testData }) => {
      [actor, target] = await Promise.all([
        testData.dagligLederMedOrg(),
        testData.bosattMyndigPerson(),
      ]);
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
    let actor: DagligLederMedOrg;
    let target: Testorganisasjon;
    const pkg = {
      urn: 'urn:altinn:accesspackage:posttjenester',
      name: 'Posttjenester',
      area: 'Andre tjenesteytende næringer',
    };

    test.beforeEach(async ({ testData }) => {
      actor = await testData.dagligLederMedOrg();
      // Ekskluder aktørens egen org så vi ikke delegerer til oss selv.
      target = await testData.hentTilfeldigVirksomhet({ ekskluder: [actor.org.orgnr] });
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
    let actor: DagligLederMedOrg;
    let target: Testperson;
    const pkg = {
      urn: 'urn:altinn:accesspackage:posttjenester',
      name: 'Posttjenester',
      area: 'Andre tjenesteytende næringer',
    };

    test.beforeEach(async ({ testData }) => {
      [actor, target] = await Promise.all([
        testData.dagligLederMedOrg(),
        testData.bosattMyndigPerson(),
      ]);
      await setupPackagesForUser(
        api,
        { pid: actor.dagligLeder.pid, from: actor.org.orgnr, to: target.pid },
        [pkg.urn],
      );
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
    let actor: DagligLederMedOrg;
    let target: Testorganisasjon;
    const pkg = {
      urn: 'urn:altinn:accesspackage:posttjenester',
      name: 'Posttjenester',
      area: 'Andre tjenesteytende næringer',
    };

    test.beforeEach(async ({ testData }) => {
      actor = await testData.dagligLederMedOrg();
      // Ekskluder aktørens egen org så vi ikke delegerer til oss selv.
      target = await testData.hentTilfeldigVirksomhet({ ekskluder: [actor.org.orgnr] });
      await setupPackagesForUser(
        api,
        { pid: actor.dagligLeder.pid, from: actor.org.orgnr, to: target.orgnr },
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
