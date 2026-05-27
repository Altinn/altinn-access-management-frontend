import { test } from '../../../fixture/pomFixture';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';

test.describe('tilgangspakkedelegering fra person til person og person til org', () => {
  const api = new EnduserConnection();

  test.describe('Legg til ny person hos deg selv', () => {
    const actor = { pid: '01837396103', name: 'DRIFTIG KATEGORI' };
    const target = { pid: '52858201748', lastName: 'KOMPOSISJON', name: 'MEMORERENDE KOMPOSISJON' };

    test('Legg til ny person hos deg selv', async ({
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

    test.afterEach(async () => {
      try {
        await api.deleteConnection(actor.pid, actor.pid, [target.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Legg til ny virksomhet hos deg selv', () => {
    const actor = { pid: '29868198034', name: 'PRESIS KONKLUSJON' };
    const target = { org: '210638962', name: 'EKTE FANTASIFULL KATT HIMMEL' };

    test('Legg til ny virksomhet hos deg selv', async ({
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

      await test.step(`Legg til virksomheten ${target.org} ${target.name}`, async () => {
        await accessManagementFrontPage.addOrg(target.org);
      });

      await test.step(`${target.name} finnes i listen over brukere`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(target.name);
        await accessManagementFrontPage.clickUser(target.name);
      });
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(actor.pid, actor.pid, [target.org]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Deleger tilgangspakke til person', () => {
    const actor = { pid: '08857499981', name: 'UROMANTISK BRINGE' };
    const target = { pid: '22911648052', name: 'LETT ANKEL' };
    const pkg = {
      urn: 'urn:altinn:accesspackage:innbygger-utdanning',
      name: 'Utdanning',
      area: 'Arbeidsliv, skole og utdanning',
    };

    test('Deleger tilgangspakke til person', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('sett opp testdata', async () => {
        try {
          await api.deleteConnection(actor.pid, actor.pid, [target.pid]);
        } catch {
          /* ignore if nothing to clean */
        }
        await api.addConnection(actor.pid, actor.pid, target.pid);
      });

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

    test.afterEach(async () => {
      try {
        await api.deleteConnection(actor.pid, actor.pid, [target.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Deleger tilgangspakke til virksomhet', () => {
    const actor = { pid: '15855499484', name: 'HANDLEKRAFTIG BRØK' };
    const target = { org: '313904490', name: 'OPPLYST KVART TIGER AS' };
    const pkg = {
      urn: 'urn:altinn:accesspackage:innbygger-utdanning',
      name: 'Utdanning',
      area: 'Arbeidsliv, skole og utdanning',
    };

    test('Deleger tilgangspakke til virksomhet', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('sett opp testdata', async () => {
        try {
          await api.deleteConnection(actor.pid, actor.pid, [target.org]);
        } catch {
          /* ignore if nothing to clean */
        }
        await api.addConnection(actor.pid, actor.pid, target.org);
      });

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

    test.afterEach(async () => {
      try {
        await api.deleteConnection(actor.pid, actor.pid, [target.org]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Slett tilgangspakke hos person', () => {
    const actor = { pid: '26917699703', name: 'GRÅ BLANDING' };
    const target = { pid: '43818900555', name: 'OPPSTEMT DRAGE' };
    const pkg = {
      urn: 'urn:altinn:accesspackage:innbygger-samliv',
      name: 'Samliv',
      area: 'Familie og fritid',
    };

    test('Slett tilgangspakke hos person', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('sett opp testdata', async () => {
        await api.addConnectionAndPackagesToUser(actor.pid, actor.pid, target.pid, [pkg.urn]);
      });

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

    test.afterEach(async ({}, testInfo) => {
      if (testInfo.status === 'passed') return;

      try {
        await api.deleteAccessPackageDelegation(actor.pid, actor.pid, target.pid, pkg.urn);
      } catch (error) {
        console.error('Cleanup: Failed to delete access package delegation:', error);
      }
      try {
        await api.deleteConnection(actor.pid, actor.pid, [target.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Slett tilgangspakke hos virksomhet', () => {
    const actor = { pid: '25928698737', name: 'KONGE FASTTELEFON' };
    const target = { org: '313567613', name: 'SKY MOTSTANDSDYKTIG TIGER AS' };
    const pkg = {
      urn: 'urn:altinn:accesspackage:innbygger-samliv',
      name: 'Samliv',
      area: 'Familie og fritid',
    };

    test('Slett tilgangspakke hos virksomhet', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('sett opp testdata', async () => {
        await api.addConnectionAndPackagesToUser(actor.pid, actor.pid, target.org, [pkg.urn]);
      });

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

    test.afterEach(async ({}, testInfo) => {
      if (testInfo.status === 'passed') return;

      try {
        await api.deleteAccessPackageDelegation(actor.pid, actor.pid, target.org, pkg.urn);
      } catch (error) {
        console.error('Cleanup: Failed to delete access package delegation:', error);
      }
      try {
        await api.deleteConnection(actor.pid, actor.pid, [target.org]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });
});

test.describe('tilgangspakkedelegering fra org til person og org til org', () => {
  const api = new EnduserConnection();

  test.describe('Legg til ny person hos din org', () => {
    const actor = { pid: '19858798917', org: '310945552', orgName: 'HARDHUDET REDELIG TIGER AS' };
    const target = { pid: '41926701744', lastName: 'APRIKOS', name: 'OMSORGSFULL APRIKOS' };

    test('Legg til ny person hos din org', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg org ${actor.orgName} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.orgName);
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

    test.afterEach(async () => {
      try {
        await api.deleteConnection(actor.pid, actor.org, [target.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Legg til ny virksomhet hos din org', () => {
    const actor = {
      pid: '28839195259',
      org: '312841150',
      orgName: 'UPRESIS DISTINGVERT KATT INNSJØ',
    };
    const target = { org: '212209562', name: 'ALLSIDIG SIGEN TIGER AS' };

    test('Legg til ny virksomhet hos din org', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg org ${actor.orgName} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.orgName);
      });

      await test.step('Gå til brukere-siden og klikk "legg til bruker"', async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickLeggTilBruker();
      });

      await test.step(`Legg til virksomheten ${target.org} ${target.name}`, async () => {
        await accessManagementFrontPage.addOrg(target.org);
      });

      await test.step(`${target.name} finnes i listen over brukere`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(target.name);
        await accessManagementFrontPage.clickUser(target.name);
      });
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(actor.pid, actor.org, [target.org]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Deleger tilgangspakke til person', () => {
    const actor = { pid: '15857698093', org: '310394955', orgName: 'STØYFRI SIVILISERT APE' };
    const target = { pid: '26832047936', name: 'UFØLSOM BADERING' };
    const pkg = {
      urn: 'urn:altinn:accesspackage:posttjenester',
      name: 'Posttjenester',
      area: 'Andre tjenesteytende næringer',
    };

    test('Deleger tilgangspakke til person', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('sett opp testdata', async () => {
        try {
          await api.deleteConnection(actor.pid, actor.org, [target.pid]);
        } catch {
          /* ignore if nothing to clean */
        }
        await api.addConnection(actor.pid, actor.org, target.pid);
      });

      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg org ${actor.orgName} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.orgName);
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

    test.afterEach(async () => {
      try {
        await api.deleteConnection(actor.pid, actor.org, [target.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Deleger tilgangspakke til virksomhet', () => {
    const actor = { pid: '08904899020', org: '310977756', orgName: 'TREG HELDIG STRUTS LTD' };
    const target = { org: '312188198', name: 'EVENTYRLIG PUSLETE TIGER AS' };
    const pkg = {
      urn: 'urn:altinn:accesspackage:posttjenester',
      name: 'Posttjenester',
      area: 'Andre tjenesteytende næringer',
    };

    test('Deleger tilgangspakke til virksomhet', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('sett opp testdata', async () => {
        try {
          await api.deleteConnection(actor.pid, actor.org, [target.org]);
        } catch {
          /* ignore if nothing to clean */
        }
        await api.addConnection(actor.pid, actor.org, target.org);
      });

      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg org ${actor.orgName} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.orgName);
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

    test.afterEach(async () => {
      try {
        await api.deleteConnection(actor.pid, actor.org, [target.org]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Slett tilgangspakke hos person', () => {
    const actor = { pid: '20826696746', org: '313500640', orgName: 'SKY UKLAR TIGER AS' };
    const target = { pid: '18894799990', name: 'UTROLIG KLØVER' };
    const pkg = {
      urn: 'urn:altinn:accesspackage:posttjenester',
      name: 'Posttjenester',
      area: 'Andre tjenesteytende næringer',
    };

    test('Slett tilgangspakke hos person', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('sett opp testdata', async () => {
        await api.addConnectionAndPackagesToUser(actor.pid, actor.org, target.pid, [pkg.urn]);
      });

      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg org ${actor.orgName} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.orgName);
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

    test.afterEach(async ({}, testInfo) => {
      if (testInfo.status === 'passed') return;

      try {
        await api.deleteAccessPackageDelegation(actor.pid, actor.org, target.pid, pkg.urn);
      } catch (error) {
        console.error('Cleanup: Failed to delete access package delegation:', error);
      }
      try {
        await api.deleteConnection(actor.pid, actor.org, [target.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('Slett tilgangspakke hos virksomhet', () => {
    const actor = { pid: '04833348529', org: '312738147', orgName: 'RESERVERT RING KATT PERIODE' };
    const target = { org: '312861305', name: 'GRATIS RØD APE' };
    const pkg = {
      urn: 'urn:altinn:accesspackage:posttjenester',
      name: 'Posttjenester',
      area: 'Andre tjenesteytende næringer',
    };

    test('Slett tilgangspakke hos virksomhet', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('sett opp testdata', async () => {
        await api.addConnectionAndPackagesToUser(actor.pid, actor.org, target.org, [pkg.urn]);
      });

      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(actor.pid);
      });

      await test.step(`Velg org ${actor.orgName} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.orgName);
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

    test.afterEach(async ({}, testInfo) => {
      if (testInfo.status === 'passed') return;

      try {
        await api.deleteAccessPackageDelegation(actor.pid, actor.org, target.org, pkg.urn);
      } catch (error) {
        console.error('Cleanup: Failed to delete access package delegation:', error);
      }
      try {
        await api.deleteConnection(actor.pid, actor.org, [target.org]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });
});
