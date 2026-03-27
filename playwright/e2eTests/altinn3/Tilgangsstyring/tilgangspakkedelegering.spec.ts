import { env } from 'playwright/util/helper';
import { LoginPage } from 'playwright/pages/LoginPage';
import { test } from '../../../fixture/pomFixture';
import { AktorvalgHeader } from '../../../pages/AktorvalgHeader';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';

test.describe('tilgangspakkedelegering fra person til person og person til org', () => {
  const api = new EnduserConnection();

  test.afterAll('slett testdata', async () => {
    await api.deleteConnection('25928698737', '25928698737', [
      '210638962',
      '52858201748',
      '22911648052',
      '313904490',
      '43818900555',
      '313435482',
    ]);
  });

  test('Legg til ny person hos deg selv', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('25928698737');
    });

    await test.step('Velg org KONGE FASTTELEFON og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('KONGE FASTTELEFON');
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
      await login.LoginToAccessManagement('25928698737');
    });

    await test.step('Velg org KONGE FASTTELEFON og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('KONGE FASTTELEFON');
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
      await api.addConnection('25928698737', '25928698737', '22911648052');
    });

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('25928698737');
    });

    await test.step('Velg deg selv (KONGE FASTTELEFON) og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('KONGE FASTTELEFON');
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
      await api.addConnection('25928698737', '25928698737', '313904490');
    });

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('25928698737');
    });

    await test.step('Velg org KONGE FASTTELEFON og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('KONGE FASTTELEFON');
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
      await api.addConnectionAndPackagesToUser('25928698737', '25928698737', '43818900555', [
        'urn:altinn:accesspackage:innbygger-samliv',
      ]);
    });

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('25928698737');
    });

    await test.step('Velg deg selv (KONGE FASTTELEFON) og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('KONGE FASTTELEFON');
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
