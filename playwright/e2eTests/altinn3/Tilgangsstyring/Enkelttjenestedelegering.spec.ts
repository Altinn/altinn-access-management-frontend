import { env } from 'playwright/util/helper';
import { LoginPage } from 'playwright/pages/LoginPage';
import { test } from '../../../fixture/pomFixture';
import { AktorvalgHeader } from '../../../pages/AktorvalgHeader';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';

test.describe.serial('Enkelttjenestedelegering fra person til person og person til org', () => {
  const api = new EnduserConnection();

  test.afterAll('slett testdata', async () => {
    await api.deleteConnection('09889499432', '09889499432', ['210530932']);
    await api.deleteConnection('03906197811', '03906197811', ['23854897845']);
    await api.deleteConnection('23813949784', '23813949784', ['313642291']);
    await api.deleteConnection('13894599892', '13894599892', ['50907400120']);
  });

  test('Deleger enkelttjeneste til person', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection('03906197811', '03906197811', '23854897845');
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement('03906197811');
    });

    await test.step('Velg deg selv (STRAFFET KOST) og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('STRAFFET KOST');
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
      await api.addConnection('23813949784', '23813949784', '313642291');
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement('23813949784');
    });

    await test.step('Velg org ORIENTAL TRAPP og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('ORIENTAL TRAPP');
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
      await api.addConnection('13894599892', '13894599892', '50907400120');
      await api.delegateSingleService(
        '13894599892',
        '13894599892',
        '50907400120',
        'bruno-correspondence',
      );
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement('13894599892');
    });

    await test.step('Velg deg selv (SØT KOMPETANSE) og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('SØT KOMPETANSE');
    });

    await test.step('Gå til brukere-siden og klikk på "VASSEN ERT"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('VASSEN ERT');
    });

    await test.step('slett "bruno-correspondence" for VASSEN ERT', async () => {
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
      await api.delegateSingleService(
        '09889499432',
        '09889499432',
        '210530932',
        'bruno-correspondence',
      );
    });

    await test.step('Logg inn', async () => {
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

test.describe.serial('Enkelttjenestedelegering fra org til person og org til org', () => {
  const api = new EnduserConnection();

  test.afterAll('slett testdata', async () => {
    await api.deleteConnection('05916597349', '313189503', ['17889574100']);
    await api.deleteConnection('16928599063', '312476932', ['313233383']);
    await api.deleteConnection('18846498989', '311716670', ['09893049719']);
    await api.deleteConnection('16815995930', '313707679', ['314021622']);
  });

  test('Deleger enkelttjeneste fra org til person', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection('05916597349', '313189503', '17889574100');
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement('05916597349');
    });

    await test.step('Velg org RYDDIG SUBJEKTIV TIGER AS og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('RYDDIG SUBJEKTIV TIGER AS');
    });

    await test.step('Gå til brukere-siden og klikk på "ANSVARSFULL REGLE"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('ANSVARSFULL REGLE');
    });

    await test.step('Gi ANSVARSFULL REGLE fullmakt til enkelttjenesten "bruno-correspondence"', async () => {
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.sokEtterEnkelttjeneste('bruno-correspondence');
      await accessManagementFrontPage.clickEnkelttjeneste('bruno-correspondence');
      await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
      await accessManagementFrontPage.LukkGiFullmaktVindu();
    });

    await test.step('ANSVARSFULL REGLE skal ha enkelttjenesten "bruno-correspondence"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('ANSVARSFULL REGLE');
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.expectUserToHaveEnkelttjeneste('bruno-correspondence');
    });
  });

  test('Deleger enkelttjeneste fra org til org', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection('16928599063', '312476932', '313233383');
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement('16928599063');
    });

    await test.step('Velg org FARLIG GJESTFRI TIGER AS og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('FARLIG GJESTFRI TIGER AS');
    });

    await test.step('Gå til brukere-siden og klikk på "RIK INNBRINGENDE TIGER AS"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('RIK INNBRINGENDE TIGER AS');
      await accessManagementFrontPage.clickUser('RIK INNBRINGENDE TIGER AS');
    });

    await test.step('Gi RIK INNBRINGENDE TIGER AS fullmakt til enkelttjenesten "bruno-correspondence"', async () => {
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.sokEtterEnkelttjeneste('bruno-correspondence');
      await accessManagementFrontPage.clickEnkelttjeneste('bruno-correspondence');
      await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
      await accessManagementFrontPage.LukkGiFullmaktVindu();
    });

    await test.step('RIK INNBRINGENDE TIGER AS skal ha enkelttjenesten "bruno-correspondence"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('RIK INNBRINGENDE TIGER AS');
      await accessManagementFrontPage.clickUser('RIK INNBRINGENDE TIGER AS');
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.expectUserToHaveEnkelttjeneste('bruno-correspondence');
    });
  });

  test('Slett enkelttjenestedelegering fra org til person', async ({
    page,
    accessManagementFrontPage,
  }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection('18846498989', '311716670', '09893049719');
      await api.delegateSingleService(
        '18846498989',
        '311716670',
        '09893049719',
        'bruno-correspondence',
      );
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement('18846498989');
    });

    await test.step('Velg deg selv (NÆR REALISTISK TIGER AS) og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('NÆR REALISTISK TIGER AS');
    });

    await test.step('Gå til brukere-siden og klikk på "ANSTENDIG PURRE"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('ANSTENDIG PURRE');
    });

    await test.step('slett "bruno-correspondence" for ANSTENDIG PURRE', async () => {
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickSlettEnkelttjeneste('bruno-correspondence');
    });

    await test.step('ANSTENDIG PURRE ikke skal ha enkelttjenesten "bruno-correspondence"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('ANSTENDIG PURRE');
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.sokEtterEnkelttjeneste('bruno-correspondence');
      await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable('bruno-correspondence');
    });
  });

  test('Slett enkelttjeneste fra org til org', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection('16815995930', '313707679', '314021622');
      await api.delegateSingleService(
        '16815995930',
        '313707679',
        '314021622',
        'bruno-correspondence',
      );
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement('16815995930');
    });

    await test.step('Velg deg org INNESLUTTET MOTLØS SKILPADDE og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('INNESLUTTET MOTLØS SKILPADDE');
    });

    await test.step('Gå til brukere-siden og klikk på "SKAMFULL KONKRET TIGER AS"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('SKAMFULL KONKRET TIGER AS');
      await accessManagementFrontPage.clickUser('SKAMFULL KONKRET TIGER AS');
    });

    await test.step('slett "bruno-correspondence" for SKAMFULL KONKRET TIGER AS', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('SKAMFULL KONKRET TIGER AS');
      await accessManagementFrontPage.clickUser('SKAMFULL KONKRET TIGER AS');
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickSlettEnkelttjeneste('bruno-correspondence');
    });

    await test.step('SKAMFULL KONKRET TIGER AS ikke skal ha enkelttjenesten "bruno-correspondence"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('SKAMFULL KONKRET TIGER AS');
      await accessManagementFrontPage.clickUser('SKAMFULL KONKRET TIGER AS');
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.sokEtterEnkelttjeneste('bruno-correspondence');
      await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable('bruno-correspondence');
    });
  });
});
