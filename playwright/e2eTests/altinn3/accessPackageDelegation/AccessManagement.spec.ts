import { env } from 'playwright/util/helper';
import { LoginPage } from 'playwright/pages/LoginPage';
import { test } from '../../../fixture/pomFixture';
import { AktorvalgHeader } from '../../../pages/AktorvalgHeader';

test.describe('Tilgangsstyring', () => {
  test('Tilgangsstyrer skal kunne delegere tilgangspakker de selv har', async ({
    page,
    accessManagementFrontPage,
  }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('Log in', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('70885100226');
    });

    await test.step('Velg org UNDERDANIG DYPSINDIG TIGER AS og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActor('UNDERDANIG DYPSINDIG TIGER AS');
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
    await test.step('Log in', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('64866402394');
    });

    await test.step('Velg org UNDERDANIG DYPSINDIG TIGER AS og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActor('UNDERDANIG DYPSINDIG TIGER AS');
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
    await test.step('Log in', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('70885100226');
    });

    await test.step('Velg org UNDERDANIG DYPSINDIG TIGER AS og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActor('UNDERDANIG DYPSINDIG TIGER AS');
    });

    await test.step('Gå til brukere-siden og velg deg selv', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expectOthersWithRightsListToBeVisible();
      await accessManagementFrontPage.clickUser('OVERFØLSOM KATT');
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
    await test.step('Log in', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('61868901372');
    });

    await test.step('Velg org UNDERDANIG DYPSINDIG TIGER AS og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActor('UNDERDANIG DYPSINDIG TIGER AS');
    });

    await test.step('Gå til brukere-siden', async () => {
      await accessManagementFrontPage.goToUsers();
    });

    await test.step('Brukeren skal ikke kunne gi fullmakt til seg selv', async () => {
      await accessManagementFrontPage.expectPowerOfAttorneyButtonToNotBeVisible();
    });
  });
});

test.skip('Testdata for Tilgangsstyring-testene', () => {
  test('legg til testdata 70885100226 OVERFØLSOM KATT', async ({
    page,
    accessManagementFrontPage,
  }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('Log in', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('12816699205');
    });

    await test.step('Velg org UNDERDANIG DYPSINDIG TIGER AS og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.goToInfoportal();
      await aktorvalgHeader.goToSelectActor('MORALSK KUNSTEVENTYR');
      await aktorvalgHeader.selectActor('UNDERDANIG DYPSINDIG TIGER AS');
    });

    await test.step('Gå til brukere-siden', async () => {
      await aktorvalgHeader.goToAccessManagement();
      await accessManagementFrontPage.goToUsers();
    });

    await test.step('Gi 70885100226 OVERFØLSOM KATT tilgangsstyrer-pakken', async () => {
      await accessManagementFrontPage.clickLeggTilBruker();
      await accessManagementFrontPage.addPerson('70885100226', 'KATT');
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.clickAccessAreaInPopup('Administrere tilganger');
      await accessManagementFrontPage.clickAccessPackageToDelegateIfVisible('Tilgangsstyrer');
    });

    await test.step('Gi 70885100226 OVERFØLSOM KATT Posttjenester-pakken', async () => {
      await accessManagementFrontPage.clickAccessAreaInPopup('Andre tjenesteytende næringer');
      await accessManagementFrontPage.clickAccessPackageToDelegateIfVisible('Posttjenester');
    });
  });

  test.skip('legg til testdata 64866402394 TRÅDLØS TELEFONNUMMER', async ({
    page,
    accessManagementFrontPage,
  }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('Log in', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('12816699205');
    });

    await test.step('Velg org UNDERDANIG DYPSINDIG TIGER AS og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.goToInfoportal();
      await aktorvalgHeader.goToSelectActor('MORALSK KUNSTEVENTYR');
      await aktorvalgHeader.selectActor('UNDERDANIG DYPSINDIG TIGER AS');
    });

    await test.step('Gå til brukere-siden', async () => {
      await aktorvalgHeader.goToAccessManagement();
      await accessManagementFrontPage.goToUsers();
    });

    await test.step('Gi 64866402394 TRÅDLØS TELEFONNUMMER KATT hovedadministrator-pakken', async () => {
      await accessManagementFrontPage.clickLeggTilBruker();
      await accessManagementFrontPage.addPerson('64866402394', 'TELEFONNUMMER');
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.clickAccessAreaInPopup('Administrere tilganger');
      await accessManagementFrontPage.clickAccessPackageToDelegateIfVisible('Hovedadministrator');
    });
  });
});
