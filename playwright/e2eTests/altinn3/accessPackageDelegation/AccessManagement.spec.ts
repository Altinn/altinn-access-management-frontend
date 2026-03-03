import { env } from 'playwright/util/helper';
import { LoginPage } from 'playwright/pages/LoginPage';
import { test } from '../../../fixture/pomFixture';
import { AktorvalgHeader } from '../../../pages/AktorvalgHeader';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';
import { access } from 'fs';
import { AccessManagementFrontPage } from '../../../pages/AccessManagementFrontPage';

test.describe('Tilgangsstyring', () => {
  const api = new EnduserConnection();
  test.afterAll(async () => {
    await api.deleteConnectionPerson('12816699205', '314138910', [
      '70885100226',
      '64866402394',
      '15843346194',
      '22907997719',
    ]);
  });

  test('Tilgangsstyrer skal kunne delegere tilgangspakker de selv har', async ({
    page,
    accessManagementFrontPage,
  }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    await test.step('sett opp testdata', async () => {
      await api.addConnectionAndPackagesToPerson('12816699205', '314138910', '70885100226', [
        'urn:altinn:accesspackage:tilgangsstyrer',
        'urn:altinn:accesspackage:posttjenester',
        'urn:altinn:accesspackage:byggesoknad',
      ]);
    });

    await test.step('Log in', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('70885100226');
    });

    await test.step('Velg org UNDERDANIG DYPSINDIG TIGER AS og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('UNDERDANIG DYPSINDIG TIGER AS');
    });

    await test.step('Gå til brukere og velg bruker "Iherdig Litteratur"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expectOthersWithRightsListToBeVisible();
      await accessManagementFrontPage.clickUser('Iherdig Litteratur');
    });

    await test.step('Klikk "Gi fullmakt"', async () => {
      await accessManagementFrontPage.clickGiFullmakt();
    });

    await test.step('Brukeren skal kunne til å gi fullmakt til "Tilgangsstyrer"', async () => {
      await accessManagementFrontPage.goToArea('Administrere tilganger');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Tilgangsstyrer');
    });

    await test.step('Brukeren skal kunne til å gi fullmakt til "Posttjenester"', async () => {
      await accessManagementFrontPage.goToArea('Andre tjenesteytende næringer');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Posttjenester');
    });
  });

  test('Hovedadministrator skal kunne delegere nesten alle tilgangspakker', async ({
    page,
    accessManagementFrontPage,
  }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    await test.step('sett opp testdata', async () => {
      await api.addConnectionAndPackagesToPerson('12816699205', '314138910', '64866402394', [
        'urn:altinn:accesspackage:hovedadministrator',
      ]);
    });

    await test.step('Log in', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('64866402394');
    });

    await test.step('Velg org UNDERDANIG DYPSINDIG TIGER AS og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('UNDERDANIG DYPSINDIG TIGER AS');
    });

    await test.step('Gå til brukere og velg deg selv', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expectOthersWithRightsListToBeVisible();
      await accessManagementFrontPage.clickUser('TRÅDLØS TELEFONNUMMER');
    });

    await test.step('Klikk "Gi fullmakt"', async () => {
      await accessManagementFrontPage.clickGiFullmakt();
    });

    await test.step('Brukeren skal kunne til å gi fullmakt til "Administrere tilganger"-pakker', async () => {
      await accessManagementFrontPage.goToArea('Administrere tilganger');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Tilgangsstyrer');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable(
        'Maskinporten administrator',
      );
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Klientadministrator');
    });

    await test.step('Brukeren skal kunne til å gi fullmakt til "Andre tjenesteytende næringer"-pakker', async () => {
      await accessManagementFrontPage.goToArea('Andre tjenesteytende næringer');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable(
        'Finansiering og forsikring',
      );
      await accessManagementFrontPage.expectAccessPackageToBeDelegable(
        'Informasjon og kommunikasjon',
      );
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Posttjenester');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Annen tjenesteyting');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Elektronisk kommunikasjon');
    });

    await test.step('Brukeren skal kunne til å gi fullmakt til "Bygg, anlegg og eiendom"-pakker', async () => {
      await accessManagementFrontPage.goToArea('Bygg, anlegg og eiendom');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Motta nabo- og planvarsel');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Byggesøknad');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Plansak');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Utleie av eiendom');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Eiendomsmegler');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Tinglysing eiendom');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable(
        'Oppføring av bygg og anlegg',
      );
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Kjøp og salg av eiendom');
    });

    await test.step('Brukeren skal kunne til å gi fullmakt til "Energi, vann, avløp og avfall"-pakker', async () => {
      await accessManagementFrontPage.goToArea('Energi, vann, avløp og avfall');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Damp- og varmtvann');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable(
        'Utvinning av råolje, naturgass og kull',
      );
      await accessManagementFrontPage.expectAccessPackageToBeDelegable(
        'Avfall - samle inn, behandle, bruke og gjenvinne',
      );
      await accessManagementFrontPage.expectAccessPackageToBeDelegable(
        'Miljørydding - rensing og lignende virksomhet',
      );
      await accessManagementFrontPage.expectAccessPackageToBeDelegable(
        'Vann - ta ut fra kilde, rense og distribuere',
      );
      await accessManagementFrontPage.expectAccessPackageToBeDelegable(
        'Elektrisitet - produsere, overføre og distribuere',
      );
      await accessManagementFrontPage.expectAccessPackageToBeDelegable(
        'Oppføring av bygg og anlegg',
      );
      await accessManagementFrontPage.expectAccessPackageToBeDelegable(
        'Samle opp og behandle avløpsvann',
      );
    });

    await test.step('Noen pakker skal ikke kunne delegeres', async () => {
      await accessManagementFrontPage.expectAccessPackageToNotBeDelegable(
        'Konkursbo administrator',
      );
      await accessManagementFrontPage.expectAccessPackageToNotBeDelegable(
        'Eksplisitt tjenestedelegering',
      );
      await accessManagementFrontPage.goToArea('Fullmakter for regnskapsfører');
      await accessManagementFrontPage.expectAccessPackageToNotBeDelegable('Regnskapsfører lønn');
      await accessManagementFrontPage.expectAccessPackageToNotBeDelegable(
        'Regnskapsfører med signeringsrettighet',
      );
      await accessManagementFrontPage.expectAccessPackageToNotBeDelegable(
        'Regnskapsfører uten signeringsrettighet',
      );
      await accessManagementFrontPage.goToArea('Fullmakter for revisor');
      await accessManagementFrontPage.expectAccessPackageToNotBeDelegable('Ansvarlig revisor');
      await accessManagementFrontPage.expectAccessPackageToNotBeDelegable('Revisormedarbeider');
    });
  });

  test('Vanlig bruker skal ikke kunne delegere pakker de selv ikke har tilgang til', async ({
    page,
    accessManagementFrontPage,
  }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    await test.step('sett opp testdata', async () => {
      await api.addConnectionAndPackagesToPerson('12816699205', '314138910', '15843346194', [
        'urn:altinn:accesspackage:tilgangsstyrer',
        'urn:altinn:accesspackage:byggesoknad',
      ]);
    });

    await test.step('Log in', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('15843346194');
    });

    await test.step('Velg org UNDERDANIG DYPSINDIG TIGER AS og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('UNDERDANIG DYPSINDIG TIGER AS');
    });

    await test.step('Gå til brukere-siden og velg deg selv', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expectOthersWithRightsListToBeVisible();
      await accessManagementFrontPage.clickUser('DYREBAR MIDDAG');
    });

    await test.step('User should not be able to give power of attorney to themselves', async () => {
      await accessManagementFrontPage.expectPowerOfAttorneyButtonToNotBeVisible();
    });
  });

  test('Standard bruker skal kun kunne se seg selv på brukere-siden', async ({
    page,
    accessManagementFrontPage,
  }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    await test.step('sett opp testdata', async () => {
      await api.addConnectionAndPackagesToPerson('12816699205', '314138910', '22907997719', [
        'urn:altinn:accesspackage:byggesoknad',
      ]);
    });

    await test.step('Log in', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('22907997719');
    });

    await test.step('Velg org UNDERDANIG DYPSINDIG TIGER AS og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('UNDERDANIG DYPSINDIG TIGER AS');
    });

    await test.step('Gå til brukere-siden', async () => {
      await accessManagementFrontPage.goToUsers();
    });

    await test.step('Brukeren skal ikke kunne gi fullmakt til seg selv', async () => {
      await accessManagementFrontPage.expectPowerOfAttorneyButtonToNotBeVisible();
    });
  });
});

test.describe('Representer seg selv og legg til ny bruker/virksomhet via GUI', async () => {
  const api = new EnduserConnection();
  test.afterAll('slett testdata', async () => {
    await api.deleteConnectionPerson('25928698737', '25928698737', [
      '210638962',
      '52858201748',
      '22911648052',
    ]);
    console.log('slettet testdata');
  });
  test('Legg til ny person hos seg selv', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    test.step('Logg inn', async () => {
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

    test.step('Legg til personen 52858201748 MEMORERENDE KOMPOSISJON', async () => {
      await accessManagementFrontPage.addPerson('52858201748', 'KOMPOSISJON');
    });

    test.step('210638962 finnes i listen over brukere', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser('MEMORERENDE KOMPOSISJON');
    });
  });

  test('Legg til ny virksomhet hos seg selv', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    test.step('Logg inn', async () => {
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

    test.step('Legg til virksomheten 210638962 EKTE FANTASIFULL KATT HIMMEL', async () => {
      await accessManagementFrontPage.addOrg('210638962');
    });

    test.step('210638962 finnes i listen over brukere', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg('EKTE FANTASIFULL KATT HIMMEL');
      await accessManagementFrontPage.clickUser('EKTE FANTASIFULL KATT HIMMEL');
    });
  });

  test('Deleger tilgangspakke til person', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    test.step('sett opp testdata', async () => {
      api.addConnectionPerson('25928698737', '25928698737', '22911648052');
    });

    test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('25928698737');
    });

    await test.step('Velg org KONGE FASTTELEFON og gå til tilgangsstyring', async () => {
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
    test.step('sett opp testdata', async () => {
      api.addConnectionPerson('25928698737', '25928698737', '313904490');
    });

    test.step('Logg inn', async () => {
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
      await accessManagementFrontPage.clickUser('OPPLYST KVART TIGER AS');
      await accessManagementFrontPage.goToArea('Arbeidsliv, skole og utdanning');
      await accessManagementFrontPage.expectUserToHavePackage('Utdanning');
    });
  });
});
