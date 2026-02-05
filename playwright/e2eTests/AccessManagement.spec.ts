import { env } from 'playwright/util/helper';
import { LoginPage } from 'playwright/pages/LoginPage';
import { test } from './../fixture/pomFixture';
import { AktorvalgHeader } from '../pages/AktorvalgHeader';
import { access } from 'fs';
import { AccessManagementFrontPage } from '../pages/AccessManagementFrontPage';

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

    await test.step('Select actor UNDERDANIG DYPSINDIG TIGER AS and go to the users page', async () => {
      await aktorvalgHeader.goToInfoportal();
      await aktorvalgHeader.goToSelectActor('OVERFØLSOM KATT');
      await aktorvalgHeader.selectActor('UNDERDANIG DYPSINDIG TIGER AS');
    });

    await test.step('go to the users page and select user "Iherdig Litteratur"', async () => {
      await aktorvalgHeader.goToAccessManagement();
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expectOthersWithRightsListToBeVisible();
      await accessManagementFrontPage.clickUser('Iherdig Litteratur');
    });

    await test.step('Click "give new power of attourney"', async () => {
      await accessManagementFrontPage.clickGiFullmakt();
    });

    await test.step('User should be able to give power of attourney for "Access Manager"', async () => {
      await accessManagementFrontPage.GoToArea('Administrere tilganger');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Tilgangsstyrer');
    });

    await test.step('User should be able to give power of attourney for "Postal Services"', async () => {
      await accessManagementFrontPage.GoToArea('Andre tjenesteytende næringer');
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

    await test.step('Select actor UNDERDANIG DYPSINDIG TIGER AS and go to the users page', async () => {
      await aktorvalgHeader.goToInfoportal();
      await aktorvalgHeader.goToSelectActor('TRÅDLØS TELEFONNUMMER');
      await aktorvalgHeader.selectActor('UNDERDANIG DYPSINDIG TIGER AS');
    });

    await test.step('go to the users page and a user', async () => {
      await aktorvalgHeader.goToAccessManagement();
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expectOthersWithRightsListToBeVisible();
      await accessManagementFrontPage.clickUser('TRÅDLØS TELEFONNUMMER');
    });

    await test.step('Click "give new power of attourney"', async () => {
      await accessManagementFrontPage.clickGiFullmakt();
    });

    await test.step('User should be able to give power of attourney for "Manage access" packages', async () => {
      await accessManagementFrontPage.GoToArea('Administrere tilganger');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Tilgangsstyrer');
      await accessManagementFrontPage.expectAccessPackageToBeDelegable(
        'Maskinporten administrator',
      );
      await accessManagementFrontPage.expectAccessPackageToBeDelegable('Klientadministrator');
    });

    await test.step('User should be able to give power of attourney for "Other service industries" packages', async () => {
      await accessManagementFrontPage.GoToArea('Andre tjenesteytende næringer');
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

    await test.step('User should be able to give power of attourney for "Bygg, anlegg og eiendom" packages', async () => {
      await accessManagementFrontPage.GoToArea('Bygg, anlegg og eiendom');
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

    await test.step('User should be able to give power of attourney for "Energi, vann, avløp og avfall" packages', async () => {
      await accessManagementFrontPage.GoToArea('Energi, vann, avløp og avfall');
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

    await test.step('User should not be able to delegate certain access packages', async () => {
      await accessManagementFrontPage.expectAccessPackageToNotBeDelegable(
        'Konkursbo administrator',
      );
      await accessManagementFrontPage.expectAccessPackageToNotBeDelegable(
        'Eksplisitt tjenestedelegering',
      );
      await accessManagementFrontPage.GoToArea('Fullmakter for regnskapsfører');
      await accessManagementFrontPage.expectAccessPackageToNotBeDelegable('Regnskapsfører lønn');
      await accessManagementFrontPage.expectAccessPackageToNotBeDelegable(
        'Regnskapsfører med signeringsrettighet',
      );
      await accessManagementFrontPage.expectAccessPackageToNotBeDelegable(
        'Regnskapsfører uten signeringsrettighet',
      );
      await accessManagementFrontPage.GoToArea('Fullmakter for revisor');
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

    await test.step('Select actor UNDERDANIG DYPSINDIG TIGER AS and go to the users page', async () => {
      await aktorvalgHeader.goToInfoportal();
      await aktorvalgHeader.goToSelectActor('OVERFØLSOM KATT');
      await aktorvalgHeader.selectActor('UNDERDANIG DYPSINDIG TIGER AS');
    });

    await test.step('go to the users page and select yourself', async () => {
      await aktorvalgHeader.goToAccessManagement();
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expectOthersWithRightsListToBeVisible();
      await accessManagementFrontPage.clickUser('OVERFØLSOM KATT');
    });

    await test.step('User should not be able to give power of attourney to themselves', async () => {
      await accessManagementFrontPage.expectPowerOfAttourneyButtonToNotBeVisible();
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

    await test.step('Select actor UNDERDANIG DYPSINDIG TIGER AS and go to the users page', async () => {
      await aktorvalgHeader.goToInfoportal();
      await aktorvalgHeader.goToSelectActor('RELEVANT ANDAKT');
      await aktorvalgHeader.selectActor('UNDERDANIG DYPSINDIG TIGER AS');
    });

    await test.step('go to the users page', async () => {
      await aktorvalgHeader.goToAccessManagement();
      await accessManagementFrontPage.goToUsers();
    });

    await test.step('User should not be able to give power of attourney to themselves', async () => {
      await accessManagementFrontPage.expectPowerOfAttourneyButtonToNotBeVisible();
    });

    await test.step('select yourself', async () => {
      await accessManagementFrontPage.clickUser('RELEVANT ANDAKT');
    });
  });
});
