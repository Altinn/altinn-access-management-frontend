import { medTestbrukere, test } from '../../../fixture/pomFixture';

test.describe('tilgangspakkedelegering fra person til person og person til org', () => {
  test.describe('Legg til ny person hos deg selv', () => {
    const test = medTestbrukere({ actor: 'privatperson', target: 'privatperson' });

    test('Legg til ny person hos deg selv', async ({
      actor,
      target,
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg ${actor.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.name);
      });

      await test.step('Gå til brukere-siden og klikk "legg til bruker"', async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickLeggTilBruker();
      });

      await test.step(`Legg til personen ${target.pid} ${target.name}`, async () => {
        await accessManagementFrontPage.addPerson(target.pid, target.lastName);
      });

      await test.step(`${target.name} finnes i listen over brukere`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.name);
      });
    });

    test.afterEach(async ({ actor, target, api }) => {
      try {
        await api.connections.deleteConnection(actor.pid, actor.pid, [target.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Legg til ny virksomhet hos deg selv', () => {
    const test = medTestbrukere({ target: 'dagligLeder', actor: 'privatperson' });

    test('Legg til ny virksomhet hos deg selv', async ({
      actor,
      target,
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg ${actor.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.name);
      });

      await test.step('Gå til brukere-siden og klikk "legg til bruker"', async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickLeggTilBruker();
      });

      await test.step(`Legg til virksomheten ${target.orgNo} ${target.name}`, async () => {
        await accessManagementFrontPage.addOrg(target.orgNo);
      });

      await test.step(`${target.name} finnes i listen over brukere`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(target.name);
        await accessManagementFrontPage.clickUser(target.name);
      });
    });

    test.afterEach(async ({ actor, target, api }) => {
      try {
        await api.connections.deleteConnection(actor.pid, actor.pid, [target.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Deleger tilgangspakke til person', () => {
    const test = medTestbrukere({ actor: 'privatperson', target: 'privatperson' });
    const pkg = {
      urn: 'urn:altinn:accesspackage:innbygger-utdanning',
      name: 'Utdanning',
      area: 'Arbeidsliv, skole og utdanning',
    };

    test.beforeEach(async ({ actor, target, api }) => {
      try {
        await api.connections.deleteConnection(actor.pid, actor.pid, [target.pid]);
      } catch {
        /* ignore if nothing to clean */
      }
      await api.connections.addConnection(actor.pid, actor.pid, target.pid);
    });

    test('Deleger tilgangspakke til person', async ({
      actor,
      target,
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg ${actor.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${target.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.name);
      });

      await test.step(`Gi ${target.name} fullmakt til tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.clickGiFullmaktForTilgangspakke(pkg.name);
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${target.name} skal ha tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.name);
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.userCanDeletePackage(pkg.name);
      });
    });

    test.afterEach(async ({ actor, target, api }) => {
      try {
        await api.connections.deleteConnection(actor.pid, actor.pid, [target.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Deleger tilgangspakke til virksomhet', () => {
    const test = medTestbrukere({ target: 'dagligLeder', actor: 'privatperson' });
    const pkg = {
      urn: 'urn:altinn:accesspackage:innbygger-utdanning',
      name: 'Utdanning',
      area: 'Arbeidsliv, skole og utdanning',
    };

    test.beforeEach(async ({ actor, target, api }) => {
      try {
        await api.connections.deleteConnection(actor.pid, actor.pid, [target.orgNo]);
      } catch {
        /* ignore if nothing to clean */
      }
      await api.connections.addConnection(actor.pid, actor.pid, target.orgNo);
    });

    test('Deleger tilgangspakke til virksomhet', async ({
      actor,
      target,
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg ${actor.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${target.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(target.name);
        await accessManagementFrontPage.clickUser(target.name);
      });

      await test.step(`Gi ${target.name} fullmakt til tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.clickGiFullmaktForTilgangspakke(pkg.name);
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${target.name} skal ha tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(target.name);
        await accessManagementFrontPage.clickUser(target.name);
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.userCanDeletePackage(pkg.name);
      });
    });

    test.afterEach(async ({ actor, target, api }) => {
      try {
        await api.connections.deleteConnection(actor.pid, actor.pid, [target.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Slett tilgangspakke hos person', () => {
    const test = medTestbrukere({ actor: 'privatperson', target: 'privatperson' });
    const pkg = {
      urn: 'urn:altinn:accesspackage:innbygger-samliv',
      name: 'Samliv',
      area: 'Familie og fritid',
    };

    test.beforeEach(async ({ actor, target, api }) => {
      await api.connections.addConnectionAndPackagesToUser(actor.pid, actor.pid, target.pid, [
        pkg.urn,
      ]);
    });

    test('Slett tilgangspakke hos person', async ({
      actor,
      target,
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg ${actor.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${target.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.name);
      });

      await test.step(`Slett "${pkg.name}" fullmakten for ${target.name}`, async () => {
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.clickSlettFullmaktForTilgangspakke(pkg.name);
      });

      await test.step(`${target.name} ikke skal ha tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.name);
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(pkg.name);
      });
    });

    test.afterEach(async ({ actor, target, api }, testInfo) => {
      if (testInfo.status === 'passed') return;

      try {
        await api.connections.deleteAccessPackageDelegation(
          actor.pid,
          actor.pid,
          target.pid,
          pkg.urn,
        );
      } catch (error) {
        console.error('Cleanup: Failed to delete access package delegation:', error);
      }
      try {
        await api.connections.deleteConnection(actor.pid, actor.pid, [target.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Slett tilgangspakke hos virksomhet', () => {
    const test = medTestbrukere({ target: 'dagligLeder', actor: 'privatperson' });
    const pkg = {
      urn: 'urn:altinn:accesspackage:innbygger-samliv',
      name: 'Samliv',
      area: 'Familie og fritid',
    };

    test.beforeEach(async ({ actor, target, api }) => {
      await api.connections.addConnectionAndPackagesToUser(actor.pid, actor.pid, target.orgNo, [
        pkg.urn,
      ]);
    });

    test('Slett tilgangspakke hos virksomhet', async ({
      actor,
      target,
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg ${actor.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${target.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(target.name);
        await accessManagementFrontPage.clickUser(target.name);
      });

      await test.step(`Slett "${pkg.name}" fullmakten for ${target.name}`, async () => {
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.clickSlettFullmaktForTilgangspakke(pkg.name);
      });

      await test.step(`${target.name} ikke skal ha tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(target.name);
        await accessManagementFrontPage.clickUser(target.name);
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(pkg.name);
      });
    });

    test.afterEach(async ({ actor, target, api }, testInfo) => {
      if (testInfo.status === 'passed') return;

      try {
        await api.connections.deleteAccessPackageDelegation(
          actor.pid,
          actor.pid,
          target.orgNo,
          pkg.urn,
        );
      } catch (error) {
        console.error('Cleanup: Failed to delete access package delegation:', error);
      }
      try {
        await api.connections.deleteConnection(actor.pid, actor.pid, [target.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });
});

test.describe('tilgangspakkedelegering fra org til person og org til org', () => {
  test.describe('Legg til ny person hos din org', () => {
    const test = medTestbrukere({ actor: 'dagligLeder', target: 'privatperson' });

    test('Legg til ny person hos din org', async ({
      actor,
      target,
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg org ${actor.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.name);
      });

      await test.step('Gå til brukere-siden og klikk "legg til bruker"', async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickLeggTilBruker();
      });

      await test.step(`Legg til personen ${target.pid} ${target.name}`, async () => {
        await accessManagementFrontPage.addPerson(target.pid, target.lastName);
      });

      await test.step(`${target.name} finnes i listen over brukere`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.name);
      });
    });

    test.afterEach(async ({ actor, target, api }) => {
      try {
        await api.connections.deleteConnection(actor.pid, actor.orgNo, [target.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Legg til ny virksomhet hos din org', () => {
    const test = medTestbrukere({ actor: 'dagligLeder', target: 'dagligLeder' });

    test('Legg til ny virksomhet hos din org', async ({
      actor,
      target,
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg org ${actor.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.name);
      });

      await test.step('Gå til brukere-siden og klikk "legg til bruker"', async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickLeggTilBruker();
      });

      await test.step(`Legg til virksomheten ${target.orgNo} ${target.name}`, async () => {
        await accessManagementFrontPage.addOrg(target.orgNo);
      });

      await test.step(`${target.name} finnes i listen over brukere`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(target.name);
        await accessManagementFrontPage.clickUser(target.name);
      });
    });

    test.afterEach(async ({ actor, target, api }) => {
      try {
        await api.connections.deleteConnection(actor.pid, actor.orgNo, [target.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Deleger tilgangspakke til person', () => {
    const test = medTestbrukere({ actor: 'dagligLeder', target: 'privatperson' });
    const pkg = {
      urn: 'urn:altinn:accesspackage:posttjenester',
      name: 'Posttjenester',
      area: 'Andre tjenesteytende næringer',
    };

    test.beforeEach(async ({ actor, target, api }) => {
      try {
        await api.connections.deleteConnection(actor.pid, actor.orgNo, [target.pid]);
      } catch {
        /* ignore if nothing to clean */
      }
      await api.connections.addConnection(actor.pid, actor.orgNo, target.pid);
    });

    test('Deleger tilgangspakke til person', async ({
      actor,
      target,
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg org ${actor.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${target.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.name);
      });

      await test.step(`Gi ${target.name} fullmakt til tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.clickGiFullmaktForTilgangspakke(pkg.name);
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${target.name} skal ha tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.name);
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.userCanDeletePackage(pkg.name);
      });
    });

    test.afterEach(async ({ actor, target, api }) => {
      try {
        await api.connections.deleteConnection(actor.pid, actor.orgNo, [target.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Deleger tilgangspakke til virksomhet', () => {
    const test = medTestbrukere({ actor: 'dagligLeder', target: 'dagligLeder' });
    const pkg = {
      urn: 'urn:altinn:accesspackage:posttjenester',
      name: 'Posttjenester',
      area: 'Andre tjenesteytende næringer',
    };

    test.beforeEach(async ({ actor, target, api }) => {
      try {
        await api.connections.deleteConnection(actor.pid, actor.orgNo, [target.orgNo]);
      } catch {
        /* ignore if nothing to clean */
      }
      await api.connections.addConnection(actor.pid, actor.orgNo, target.orgNo);
    });

    test('Deleger tilgangspakke til virksomhet', async ({
      actor,
      target,
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg org ${actor.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${target.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(target.name);
        await accessManagementFrontPage.clickUser(target.name);
      });

      await test.step(`Gi ${target.name} fullmakt til tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.clickGiFullmaktForTilgangspakke(pkg.name);
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${target.name} skal ha tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(target.name);
        await accessManagementFrontPage.clickUser(target.name);
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.userCanDeletePackage(pkg.name);
      });
    });

    test.afterEach(async ({ actor, target, api }) => {
      try {
        await api.connections.deleteConnection(actor.pid, actor.orgNo, [target.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Slett tilgangspakke hos person', () => {
    const test = medTestbrukere({ actor: 'dagligLeder', target: 'privatperson' });
    const pkg = {
      urn: 'urn:altinn:accesspackage:posttjenester',
      name: 'Posttjenester',
      area: 'Andre tjenesteytende næringer',
    };

    test.beforeEach(async ({ actor, target, api }) => {
      await api.connections.addConnectionAndPackagesToUser(actor.pid, actor.orgNo, target.pid, [
        pkg.urn,
      ]);
    });

    test('Slett tilgangspakke hos person', async ({
      actor,
      target,
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg org ${actor.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${target.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.name);
      });

      await test.step(`Slett tilgangspakken "${pkg.name}" for ${target.name}`, async () => {
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.clickSlettFullmaktForTilgangspakke(pkg.name);
      });

      await test.step(`${target.name} ikke skal ha tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(target.name);
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(pkg.name);
      });
    });

    test.afterEach(async ({ actor, target, api }, testInfo) => {
      if (testInfo.status === 'passed') return;

      try {
        await api.connections.deleteAccessPackageDelegation(
          actor.pid,
          actor.orgNo,
          target.pid,
          pkg.urn,
        );
      } catch (error) {
        console.error('Cleanup: Failed to delete access package delegation:', error);
      }
      try {
        await api.connections.deleteConnection(actor.pid, actor.orgNo, [target.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Slett tilgangspakke hos virksomhet', () => {
    const test = medTestbrukere({ actor: 'dagligLeder', target: 'dagligLeder' });
    const pkg = {
      urn: 'urn:altinn:accesspackage:posttjenester',
      name: 'Posttjenester',
      area: 'Andre tjenesteytende næringer',
    };

    test.beforeEach(async ({ actor, target, api }) => {
      await api.connections.addConnectionAndPackagesToUser(actor.pid, actor.orgNo, target.orgNo, [
        pkg.urn,
      ]);
    });

    test('Slett tilgangspakke hos virksomhet', async ({
      actor,
      target,
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg org ${actor.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${target.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(target.name);
        await accessManagementFrontPage.clickUser(target.name);
      });

      await test.step(`Slett "${pkg.name}" fullmakten for ${target.name}`, async () => {
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.clickSlettFullmaktForTilgangspakke(pkg.name);
      });

      await test.step(`${target.name} ikke skal ha tilgangspakken "${pkg.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(target.name);
        await accessManagementFrontPage.clickUser(target.name);
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.goToArea(pkg.area);
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(pkg.name);
      });
    });

    test.afterEach(async ({ actor, target, api }, testInfo) => {
      if (testInfo.status === 'passed') return;

      try {
        await api.connections.deleteAccessPackageDelegation(
          actor.pid,
          actor.orgNo,
          target.orgNo,
          pkg.urn,
        );
      } catch (error) {
        console.error('Cleanup: Failed to delete access package delegation:', error);
      }
      try {
        await api.connections.deleteConnection(actor.pid, actor.orgNo, [target.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });
});
