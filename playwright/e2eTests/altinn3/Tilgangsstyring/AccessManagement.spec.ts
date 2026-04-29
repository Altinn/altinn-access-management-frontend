import { env } from 'playwright/util/helper';
import { LoginPage } from 'playwright/pages/LoginPage';
import { test } from '../../../fixture/pomFixture';
import { AktorvalgHeader } from '../../../pages/AktorvalgHeader';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';

test.describe.serial('Tilgangsstyring', () => {
  const api = new EnduserConnection();
  const MANAGER_PID = '12816699205';
  const ORG_NO = '314138910';
  const ORG_NAME = 'UNDERDANIG DYPSINDIG TIGER AS';

  const tilgangsstyrer = { pid: '70885100226', name: 'Iherdig Litteratur' };
  const hovedadmin = { pid: '64866402394', name: 'TRÅDLØS TELEFONNUMMER' };
  const vanligBruker = { pid: '15843346194', name: 'DYREBAR MIDDAG' };
  const standardBruker = { pid: '22907997719' };

  test.afterAll(async () => {
    try {
      await api.deleteConnection(MANAGER_PID, ORG_NO, [
        tilgangsstyrer.pid,
        hovedadmin.pid,
        vanligBruker.pid,
        standardBruker.pid,
      ]);
    } catch (e) {
      console.error('Cleanup: deleteConnection feilet:', e);
    }
  });

  test('Tilgangsstyrer skal kunne delegere tilgangspakker de selv har', async ({
    page,
    accessManagementFrontPage,
  }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    await test.step('sett opp testdata', async () => {
      await api.addConnectionAndPackagesToUser(MANAGER_PID, ORG_NO, tilgangsstyrer.pid, [
        'urn:altinn:accesspackage:tilgangsstyrer',
        'urn:altinn:accesspackage:posttjenester',
        'urn:altinn:accesspackage:byggesoknad',
      ]);
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(tilgangsstyrer.pid);
    });

    await test.step(`Velg org ${ORG_NAME} og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(ORG_NAME);
    });

    await test.step('Gå til brukere og velg bruker "Iherdig Litteratur"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expectOthersWithRightsListToBeVisible();
      await accessManagementFrontPage.clickUser(tilgangsstyrer.name);
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
      await api.addConnectionAndPackagesToUser(MANAGER_PID, ORG_NO, hovedadmin.pid, [
        'urn:altinn:accesspackage:hovedadministrator',
      ]);
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(hovedadmin.pid);
    });

    await test.step(`Velg org ${ORG_NAME} og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(ORG_NAME);
    });

    await test.step('Gå til brukere og velg deg selv', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expectOthersWithRightsListToBeVisible();
      await accessManagementFrontPage.clickUser(hovedadmin.name);
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
      await api.addConnectionAndPackagesToUser(MANAGER_PID, ORG_NO, vanligBruker.pid, [
        'urn:altinn:accesspackage:tilgangsstyrer',
        'urn:altinn:accesspackage:byggesoknad',
      ]);
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(vanligBruker.pid);
    });

    await test.step(`Velg org ${ORG_NAME} og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(ORG_NAME);
    });

    await test.step('Gå til brukere-siden og velg deg selv', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expectOthersWithRightsListToBeVisible();
      await accessManagementFrontPage.clickUser(vanligBruker.name);
    });

    await test.step('Brukeren skal ikke kunne gi fullmakt til seg selv', async () => {
      await accessManagementFrontPage.expectPowerOfAttorneyButtonToNotBeVisible();
    });
  });

  test('Standard bruker skal kun kunne se deg selv på brukere-siden', async ({
    page,
    accessManagementFrontPage,
  }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    await test.step('sett opp testdata', async () => {
      await api.addConnectionAndPackagesToUser(MANAGER_PID, ORG_NO, standardBruker.pid, [
        'urn:altinn:accesspackage:byggesoknad',
      ]);
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(standardBruker.pid);
    });

    await test.step(`Velg org ${ORG_NAME} og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(ORG_NAME);
    });

    await test.step('Gå til brukere-siden', async () => {
      await accessManagementFrontPage.goToUsers();
    });

    await test.step('Brukeren skal ikke kunne gi fullmakt til deg selv', async () => {
      await accessManagementFrontPage.expectPowerOfAttorneyButtonToNotBeVisible();
    });
  });
});
