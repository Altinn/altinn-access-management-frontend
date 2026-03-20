import { env } from 'playwright/util/helper';
import { LoginPage } from 'playwright/pages/LoginPage';
import { test } from '../../../fixture/pomFixture';
import { AktorvalgHeader } from '../../../pages/AktorvalgHeader';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';

test.describe('Enkelttjenestedelegering fra person til person og person til org', () => {
  const api = new EnduserConnection();

  test.afterAll('slett testdata', async () => {
    await api.deleteConnection('09889499432', '09889499432', [
      '23854897845',
      '313642291',
      '50907400120',
      '210530932',
    ]);
  });

  test('Deleger enkelttjeneste til person', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection('09889499432', '09889499432', '23854897845');
    });

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('09889499432');
    });

    await test.step('Velg deg selv (KOMPLEKS BØNNE) og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('KOMPLEKS BØNNE');
    });

    await test.step('Gå til brukere-siden og klikk på "KONSERVATIV FATTIGMANNSKOST"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('KONSERVATIV FATTIGMANNSKOST');
    });

    await test.step('Gi KONSERVATIV FATTIGMANNSKOST fullmakt til enkelttjenesten "bruno-correspondence"', async () => {
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.sokEtterEnkelttjeneste('bruno-correspondence');
      await accessManagementFrontPage.clickEnkelttjeneste('bruno-correspondence');
      await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
      await accessManagementFrontPage.LukkGiFullmaktVindu();
    });

    await test.step('KONSERVATIV FATTIGMANNSKOST skal ha enkelttjenesten "bruno-correspondence"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('KONSERVATIV FATTIGMANNSKOST');
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.expectUserToHaveEnkelttjeneste('bruno-correspondence');
    });
  });

  test('Deleger enkelttjeneste til virksomhet', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection('09889499432', '09889499432', '313642291');
    });

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('09889499432');
    });

    await test.step('Velg org KOMPLEKS BØNNE og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('KOMPLEKS BØNNE');
    });

    await test.step('Gå til brukere-siden og klikk på "OVERFLØDIG SOLID TIGER AS"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('OVERFLØDIG SOLID TIGER AS');
      await accessManagementFrontPage.clickUser('OVERFLØDIG SOLID TIGER AS');
    });

    await test.step('Gi OVERFLØDIG SOLID TIGER AS fullmakt til enkelttjenesten "bruno-correspondence"', async () => {
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.sokEtterEnkelttjeneste('bruno-correspondence');
      await accessManagementFrontPage.clickEnkelttjeneste('bruno-correspondence');
      await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
      await accessManagementFrontPage.LukkGiFullmaktVindu();
    });

    await test.step('OVERFLØDIG SOLID TIGER AS skal ha enkelttjenesten "bruno-correspondence"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('OVERFLØDIG SOLID TIGER AS');
      await accessManagementFrontPage.clickUser('OVERFLØDIG SOLID TIGER AS');
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.expectUserToHaveEnkelttjeneste('bruno-correspondence');
    });
  });

  test('Slett enkelttjenestedelegering hos person', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.deleteConnection('09889499432', '09889499432', ['50907400120']);
      await api.addConnection('09889499432', '09889499432', '50907400120');
    });

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('09889499432');
    });

    await test.step('Velg deg selv (KOMPLEKS BØNNE) og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('KOMPLEKS BØNNE');
    });

    await test.step('Gå til brukere-siden og klikk på "VASSEN ERT"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('VASSEN ERT');
    });

    await test.step('Gi VASSEN ERT fullmakt til enkelttjenesten "bruno-correspondence"', async () => {
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.sokEtterEnkelttjeneste('bruno-correspondence');
      await accessManagementFrontPage.clickEnkelttjeneste('bruno-correspondence');
      await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
      await accessManagementFrontPage.LukkGiFullmaktVindu();
    });

    await test.step('slett "bruno-correspondence" for VASSEN ERT', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('VASSEN ERT');
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickSlettEnkelttjeneste('bruno-correspondence');
    });

    await test.step('VASSEN ERT ikke skal ha enkelttjenesten "bruno-correspondence"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('VASSEN ERT');
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.sokEtterEnkelttjeneste('bruno-correspondence');
      await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable('bruno-correspondence');
    });
  });

  test('Slett enkelttjeneste hos virksomhet', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection('09889499432', '09889499432', '210530932');
    });

    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('09889499432');
    });

    await test.step('Velg deg selv (KOMPLEKS BØNNE) og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('KOMPLEKS BØNNE');
    });

    await test.step('Gå til brukere-siden og klikk på "TYDELIG VIS TIGER AS"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('TYDELIG VIS TIGER AS');
      await accessManagementFrontPage.clickUser('TYDELIG VIS TIGER AS');
    });

    await test.step('Gi TYDELIG VIS TIGER AS fullmakt til enkelttjenesten "bruno-correspondence"', async () => {
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.sokEtterEnkelttjeneste('bruno-correspondence');
      await accessManagementFrontPage.clickEnkelttjeneste('bruno-correspondence');
      await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
      await accessManagementFrontPage.LukkGiFullmaktVindu();
    });

    await test.step('slett "bruno-correspondence" for TYDELIG VIS TIGER AS', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('TYDELIG VIS TIGER AS');
      await accessManagementFrontPage.clickUser('TYDELIG VIS TIGER AS');
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickSlettEnkelttjeneste('bruno-correspondence');
    });

    await test.step('TYDELIG VIS TIGER AS ikke skal ha enkelttjenesten "bruno-correspondence"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('TYDELIG VIS TIGER AS');
      await accessManagementFrontPage.clickUser('TYDELIG VIS TIGER AS');
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.sokEtterEnkelttjeneste('bruno-correspondence');
      await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable('bruno-correspondence');
    });
  });
});
