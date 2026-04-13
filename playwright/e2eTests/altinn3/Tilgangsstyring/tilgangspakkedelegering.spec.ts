import { env } from 'playwright/util/helper';
import { LoginPage } from 'playwright/pages/LoginPage';
import { test } from '../../../fixture/pomFixture';
import { AktorvalgHeader } from '../../../pages/AktorvalgHeader';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';

test.describe.serial('tilgangspakkedelegering fra person til person og person til org', () => {
  const api = new EnduserConnection();

  test.afterAll('slett testdata', async () => {
    await api.deleteConnection('25928698737', '25928698737', ['313435482']);
    await api.deleteConnection('01837396103', '01837396103', ['52858201748']);
    await api.deleteConnection('29868198034', '29868198034', ['210638962']);
    await api.deleteConnection('08857499981', '08857499981', ['22911648052']);
    await api.deleteConnection('15855499484', '15855499484', ['313904490']);
    await api.deleteConnection('26917699703', '26917699703', ['43818900555']);
  });

  test('Legg til ny person hos deg selv', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('01837396103');
    });

    await test.step('Velg org DRIFTIG KATEGORI og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('DRIFTIG KATEGORI');
    });

    await test.step('Gå til brukere-siden og klikk "legg til bruker"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickLeggTilBruker();
    });

    await test.step('Legg til personen 52858201748 MEMORERENDE KOMPOSISJON', async () => {
      await accessManagementFrontPage.addPerson('52858201748', 'KOMPOSISJON');
    });

    await test.step('210638962 finnes i listen over brukere', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('MEMORERENDE KOMPOSISJON');
    });
  });

  test('Legg til ny virksomhet hos deg selv', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('29868198034');
    });

    await test.step('Velg org PRESIS KONKLUSJON og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('PRESIS KONKLUSJON');
    });

    await test.step('Gå til brukere-siden og klikk "legg til bruker"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickLeggTilBruker();
    });

    await test.step('Legg til virksomheten 210638962 EKTE FANTASIFULL KATT HIMMEL', async () => {
      await accessManagementFrontPage.addOrg('210638962');
    });

    await test.step('210638962 finnes i listen over brukere', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('EKTE FANTASIFULL KATT HIMMEL');
      await accessManagementFrontPage.clickUser('EKTE FANTASIFULL KATT HIMMEL');
    });
  });

  test('Deleger tilgangspakke til person', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.deleteConnection('08857499981', '08857499981', ['22911648052']);
      await api.addConnection('08857499981', '08857499981', '22911648052');
    });

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('08857499981');
    });

    await test.step('Velg deg selv (UROMANTISK BRINGE) og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('UROMANTISK BRINGE');
    });

    await test.step('Gå til brukere-siden og klikk på "LETT ANKEL"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('LETT ANKEL');
    });

    await test.step('Gi LETT ANKEL fullmakt til tilgangspakken "Utdanning"', async () => {
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.goToArea('Arbeidsliv, skole og utdanning');
      await accessManagementFrontPage.clickGiFullmaktForTilgangspakke('Utdanning');
      await accessManagementFrontPage.LukkGiFullmaktVindu();
    });

    await test.step('LETT ANKEL skal ha tilgangspakken "Utdanning"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('LETT ANKEL');
      await accessManagementFrontPage.goToArea('Arbeidsliv, skole og utdanning');
      await accessManagementFrontPage.expectUserToHavePackage('Utdanning');
    });
  });

  test('Deleger tilgangspakke til virksomhet', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection('15855499484', '15855499484', '313904490');
    });

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('15855499484');
    });

    await test.step('Velg org HANDLEKRAFTIG BRØK og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('HANDLEKRAFTIG BRØK');
    });

    await test.step('Gå til brukere-siden og klikk på "OPPLYST KVART TIGER AS"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('OPPLYST KVART TIGER AS');
      await accessManagementFrontPage.clickUser('OPPLYST KVART TIGER AS');
    });

    await test.step('Gi OPPLYST KVART TIGER AS fullmakt til tilgangspakken "Utdanning"', async () => {
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.goToArea('Arbeidsliv, skole og utdanning');
      await accessManagementFrontPage.clickGiFullmaktForTilgangspakke('Utdanning');
      await accessManagementFrontPage.LukkGiFullmaktVindu();
    });

    await test.step('OPPLYST KVART TIGER AS skal ha tilgangspakken "Utdanning"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('OPPLYST KVART TIGER AS');
      await accessManagementFrontPage.clickUser('OPPLYST KVART TIGER AS');
      await accessManagementFrontPage.goToArea('Arbeidsliv, skole og utdanning');
      await accessManagementFrontPage.expectUserToHavePackage('Utdanning');
    });
  });

  test('Slett tilgangspakke hos person', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnectionAndPackagesToUser('26917699703', '26917699703', '43818900555', [
        'urn:altinn:accesspackage:innbygger-samliv',
      ]);
    });

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('26917699703');
    });

    await test.step('Velg deg selv (GRÅ BLANDING) og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('GRÅ BLANDING');
    });

    await test.step('Gå til brukere-siden og klikk på "OPPSTEMT DRAGE"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('OPPSTEMT DRAGE');
    });

    await test.step('Slett "Samliv" fullmakten for OPPSTEMT DRAGE', async () => {
      await accessManagementFrontPage.goToArea('Familie og fritid');
      await accessManagementFrontPage.clickSlettFullmaktForTilgangspakke('Samliv');
    });

    await test.step('OPPSTEMT DRAGE ikke skal ha tilgangspakken "Samliv"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('OPPSTEMT DRAGE');
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.goToArea('Familie og fritid');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Samliv');
    });
  });

  test('Slett tilgangspakke hos virksomhet', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnectionAndPackagesToUser('25928698737', '25928698737', '313435482', [
        'urn:altinn:accesspackage:innbygger-samliv',
      ]);
    });

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('25928698737');
    });

    await test.step('Velg org KONGE FASTTELEFON og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('KONGE FASTTELEFON');
    });

    await test.step('Gå til brukere-siden og klikk på "GILD SPESIELL TIGER AS"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('GILD SPESIELL TIGER AS');
      await accessManagementFrontPage.clickUser('GILD SPESIELL TIGER AS');
    });

    await test.step('Slett "Samliv" fullmakten for GILD SPESIELL TIGER AS', async () => {
      await accessManagementFrontPage.goToArea('Familie og fritid');
      await accessManagementFrontPage.clickSlettFullmaktForTilgangspakke('Samliv');
    });

    await test.step('GILD SPESIELL TIGER AS ikke skal ha tilgangspakken "Samliv"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('GILD SPESIELL TIGER AS');
      await accessManagementFrontPage.clickUser('GILD SPESIELL TIGER AS');
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.goToArea('Familie og fritid');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Samliv');
    });
  });
});

test.describe.serial('tilgangspakkedelegering fra org til person og org til org', () => {
  const api = new EnduserConnection();

  test.afterAll('slett testdata', async () => {
    await api.deleteConnection('19858798917', '310945552', ['41926701744']);
    await api.deleteConnection('28839195259', '312841150', ['212209562']);
    await api.deleteConnection('15857698093', '310394955', ['26832047936']);
    await api.deleteConnection('08904899020', '310977756', ['312188198']);
    await api.deleteConnection('20826696746', '313500640', ['18894799990']);
    await api.deleteConnection('04833348529', '312738147', ['312861305']);
  });

  test('Legg til ny person hos din org', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('19858798917');
    });

    await test.step('Velg org HARDHUDET REDELIG TIGER AS og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('HARDHUDET REDELIG TIGER AS');
    });

    await test.step('Gå til brukere-siden og klikk "legg til bruker"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickLeggTilBruker();
    });

    await test.step('Legg til personen 41926701744 OMSORGSFULL APRIKOS', async () => {
      await accessManagementFrontPage.addPerson('41926701744', 'APRIKOS');
    });

    await test.step('41926701744 OMSORGSFULL APRIKOS finnes i listen over brukere', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('OMSORGSFULL APRIKOS');
    });
  });

  test('Legg til ny virksomhet hos din org', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('28839195259');
    });

    await test.step('Velg org UPRESIS DISTINGVERT KATT INNSJØ og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('UPRESIS DISTINGVERT KATT INNSJØ');
    });

    await test.step('Gå til brukere-siden og klikk "legg til bruker"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickLeggTilBruker();
    });

    await test.step('Legg til virksomheten 212209562 ALLSIDIG SIGEN TIGER AS', async () => {
      await accessManagementFrontPage.addOrg('212209562');
    });

    await test.step('210638962 finnes i listen over brukere', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('ALLSIDIG SIGEN TIGER AS');
      await accessManagementFrontPage.clickUser('ALLSIDIG SIGEN TIGER AS');
    });
  });

  test('Deleger tilgangspakke til person', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection('15857698093', '310394955', '26832047936');
    });

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('15857698093');
    });

    await test.step('Velg org STØYFRI SIVILISERT APE og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('STØYFRI SIVILISERT APE');
    });

    await test.step('Gå til brukere-siden og klikk på "UFØLSOM BADERING"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('UFØLSOM BADERING');
    });

    await test.step('Gi UFØLSOM BADERING fullmakt til tilgangspakken "Posttjenester"', async () => {
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.goToArea('Andre tjenesteytende næringer');
      await accessManagementFrontPage.clickGiFullmaktForTilgangspakke('Posttjenester');
      await accessManagementFrontPage.LukkGiFullmaktVindu();
    });

    await test.step('UFØLSOM BADERING skal ha tilgangspakken "Posttjenester"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('UFØLSOM BADERING');
      await accessManagementFrontPage.goToArea('Andre tjenesteytende næringer');
      await accessManagementFrontPage.expectUserToHavePackage('Posttjenester');
    });
  });

  test('Deleger tilgangspakke til virksomhet', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection('08904899020', '310977756', '312188198');
    });

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('08904899020');
    });

    await test.step('Velg org TREG HELDIG STRUTS LTD og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('TREG HELDIG STRUTS LTD');
    });

    await test.step('Gå til brukere-siden og klikk på "EVENTYRLIG PUSLETE TIGER AS"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('EVENTYRLIG PUSLETE TIGER AS');
      await accessManagementFrontPage.clickUser('EVENTYRLIG PUSLETE TIGER AS');
    });

    await test.step('Gi EVENTYRLIG PUSLETE TIGER AS fullmakt til tilgangspakken "Posttjenester"', async () => {
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.goToArea('Andre tjenesteytende næringer');
      await accessManagementFrontPage.clickGiFullmaktForTilgangspakke('Posttjenester');
      await accessManagementFrontPage.LukkGiFullmaktVindu();
    });

    await test.step('EVENTYRLIG PUSLETE TIGER AS skal ha tilgangspakken "Posttjenester"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('EVENTYRLIG PUSLETE TIGER AS');
      await accessManagementFrontPage.clickUser('EVENTYRLIG PUSLETE TIGER AS');
      await accessManagementFrontPage.goToArea('Andre tjenesteytende næringer');
      await accessManagementFrontPage.expectUserToHavePackage('Posttjenester');
    });
  });

  test('Slett tilgangspakke hos person', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnectionAndPackagesToUser('20826696746', '313500640', '18894799990', [
        'urn:altinn:accesspackage:posttjenester',
      ]);
    });

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('20826696746');
    });

    await test.step('Velg deg org SKY UKLAR TIGER AS og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('SKY UKLAR TIGER AS');
    });

    await test.step('Gå til brukere-siden og klikk på "UTROLIG KLØVER"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('UTROLIG KLØVER');
    });

    await test.step('Slett tilgangspakken "Posttjenester" for UTROLIG KLØVER', async () => {
      await accessManagementFrontPage.goToArea('Andre tjenesteytende næringer');
      await accessManagementFrontPage.clickSlettFullmaktForTilgangspakke('Posttjenester');
    });

    await test.step('UTROLIG KLØVER ikke skal ha tilgangspakken "Posttjenester"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('UTROLIG KLØVER');
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.goToArea('Andre tjenesteytende næringer');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Posttjenester');
    });
  });

  test('Slett tilgangspakke hos virksomhet', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnectionAndPackagesToUser('04833348529', '312738147', '312861305', [
        'urn:altinn:accesspackage:posttjenester',
      ]);
    });

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('04833348529');
    });

    await test.step('Velg org RESERVERT RING KATT PERIODE og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('RESERVERT RING KATT PERIODE');
    });

    await test.step('Gå til brukere-siden og klikk på "GRATIS RØD APE"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('GRATIS RØD APE');
      await accessManagementFrontPage.clickUser('GRATIS RØD APE');
    });

    await test.step('Slett "Posttjenester" fullmakten for GRATIS RØD APE', async () => {
      await accessManagementFrontPage.goToArea('Andre tjenesteytende næringer');
      await accessManagementFrontPage.clickSlettFullmaktForTilgangspakke('Posttjenester');
    });

    await test.step('GRATIS RØD APE ikke skal ha tilgangspakken "Posttjenester"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('GRATIS RØD APE');
      await accessManagementFrontPage.clickUser('GRATIS RØD APE');
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.goToArea('Andre tjenesteytende næringer');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Posttjenester');
    });
  });
});
