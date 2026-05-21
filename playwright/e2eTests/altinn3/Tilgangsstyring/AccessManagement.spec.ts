import { LoginPage } from 'playwright/pages/LoginPage';
import { test } from '../../../fixture/pomFixture';
import { AktorvalgHeader } from '../../../pages/AktorvalgHeader';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';

test.describe.serial('Tilgangsstyring', () => {
  const api = new EnduserConnection();
  test.afterAll(async () => {
    await api.deleteConnection('12816699205', '314138910', [
      '70885100226',
      '64866402394',
      '15843346194',
      '22907997719',
      '313435482',
      '313904490',
    ]);
  });

  test('Tilgangsstyrer skal kunne delegere tilgangspakker de selv har', async ({
    page,
    accessManagementFrontPage,
  }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    await test.step('sett opp testdata', async () => {
      await api.addConnectionAndPackagesToUser('12816699205', '314138910', '70885100226', [
        'urn:altinn:accesspackage:tilgangsstyrer',
        'urn:altinn:accesspackage:posttjenester',
        'urn:altinn:accesspackage:byggesoknad',
      ]);
    });

    await test.step('Log in', async () => {
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
      await api.addConnectionAndPackagesToUser('12816699205', '314138910', '64866402394', [
        'urn:altinn:accesspackage:hovedadministrator',
      ]);
    });

    await test.step('Log in', async () => {
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
      await api.addConnectionAndPackagesToUser('12816699205', '314138910', '15843346194', [
        'urn:altinn:accesspackage:tilgangsstyrer',
        'urn:altinn:accesspackage:byggesoknad',
      ]);
    });

    await test.step('Log in', async () => {
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

  test('Standard bruker skal kun kunne se deg selv på brukere-siden', async ({
    page,
    accessManagementFrontPage,
  }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    await test.step('sett opp testdata', async () => {
      await api.addConnectionAndPackagesToUser('12816699205', '314138910', '22907997719', [
        'urn:altinn:accesspackage:byggesoknad',
      ]);
    });

    await test.step('Log in', async () => {
      await login.LoginToAccessManagement('22907997719');
    });

    await test.step('Velg org UNDERDANIG DYPSINDIG TIGER AS og gå til tilgangsstyring', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('UNDERDANIG DYPSINDIG TIGER AS');
    });

    await test.step('Gå til brukere-siden', async () => {
      await accessManagementFrontPage.goToUsers();
    });

    await test.step('Brukeren skal ikke kunne gi fullmakt til deg selv', async () => {
      await accessManagementFrontPage.expectPowerOfAttorneyButtonToNotBeVisible();
    });
  });
});

test.describe('over- og underenheter', () => {
  const api = new EnduserConnection();

  test.beforeAll('sett opp testdata', async () => {
    await api.addConnectionAndPackagesToUser('25916799929', '313819566', '313244555', [
      'urn:altinn:accesspackage:byggesoknad',
    ]);
    await api.addConnection('26888197213', '310959502', '312791404');
    await api.delegateSingleService(
      '26888197213',
      '310959502',
      '312791404',
      'bruno-correspondence',
    );
  });

  test('Virksomhet skal kunne se tilgangspakker hos hoved- og underenhet som delegerte dem', async ({
    page,
    accessManagementFrontPage,
    login,
    aktorvalgHeader,
  }) => {
    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement('30847798242');
    });

    await test.step('Se at hovedenhet og underenhet for SMISKENDE UMODEN TIGER AS er klikkbare i aktørlista', async () => {
      await aktorvalgHeader.orgExistsInAktorvalg('SMISKENDE UMODEN TIGER AS');
      await aktorvalgHeader.subOrgExistsInAktorvalg('SMISKENDE UMODEN TIGER AS');
    });

    await test.step('Velg hovedenhet KONSERVATIV USELVISK KATT KLINKEKULE og gå til fullmakter hos andre', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('KONSERVATIV USELVISK KATT KLINKEKULE');
      await accessManagementFrontPage.goToFullmakterHosAndre();
    });

    await test.step('Velg hovedenhet SMISKENDE UMODEN TIGER AS i lista over fullmakter hos andre', async () => {
      await accessManagementFrontPage.expandOrg('SMISKENDE UMODEN TIGER AS');
      await accessManagementFrontPage.clickUser('SMISKENDE UMODEN TIGER AS');
    });

    await test.step('KONSERVATIV USELVISK KATT KLINKEKULE skal ha tilgangspakken Byggesøknad hos hovedenheten', async () => {
      await accessManagementFrontPage.goToArea('Bygg, anlegg og eiendom');
      await accessManagementFrontPage.userCanDeletePackage('Byggesøknad');
    });

    await test.step('Gå tilbake til fullmakter hos andre og velg underenhet SMISKENDE UMODEN TIGER AS', async () => {
      await accessManagementFrontPage.goToFullmakterHosAndre();
      await accessManagementFrontPage.expandOrg('SMISKENDE UMODEN TIGER AS');
      await accessManagementFrontPage.clickUser('SMISKENDE UMODEN TIGER AS', 1);
    });

    await test.step('KONSERVATIV USELVISK KATT KLINKEKULE skal ha tilgangspakken Byggesøknad hos underenheten', async () => {
      await accessManagementFrontPage.goToArea('Bygg, anlegg og eiendom');
      await accessManagementFrontPage.expectUserToHavePackage('Byggesøknad');
    });
  });

  test('Virksomhet skal kunne se enkelttjenester hos hoved- og underenhet som delegerte dem', async ({
    page,
    accessManagementFrontPage,
    login,
    aktorvalgHeader,
  }) => {
    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement('16906997766');
    });

    await test.step('Se at hovedenhet og underenhet for RIKTIG AUTENTISK APE er klikkbare i aktørlista', async () => {
      await aktorvalgHeader.orgExistsInAktorvalg('RIKTIG AUTENTISK APE');
      await aktorvalgHeader.subOrgExistsInAktorvalg('RIKTIG AUTENTISK APE');
    });

    await test.step('Velg hovedenhet FORMBAR GENIERKLÆRT TIGER AS og gå til fullmakter hos andre', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('FORMBAR GENIERKLÆRT TIGER AS');
      await accessManagementFrontPage.goToFullmakterHosAndre();
    });

    await test.step('Velg hovedenhet RIKTIG AUTENTISK APE i lista over fullmakter hos andre', async () => {
      await accessManagementFrontPage.expandOrg('RIKTIG AUTENTISK APE');
      await accessManagementFrontPage.clickUser('RIKTIG AUTENTISK APE');
    });

    await test.step('FORMBAR GENIERKLÆRT TIGER AS skal ha enkelttjenesten bruno-correspondence hos hovedenheten', async () => {
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.userCanDeleteEnkelttjeneste('bruno-correspondence');
    });

    await test.step('Gå tilbake til fullmakter hos andre og velg underenhet RIKTIG AUTENTISK APE', async () => {
      await accessManagementFrontPage.goToFullmakterHosAndre();
      await accessManagementFrontPage.expandOrg('RIKTIG AUTENTISK APE');
      await accessManagementFrontPage.clickUser('RIKTIG AUTENTISK APE', 1);
    });

    await test.step('FORMBAR GENIERKLÆRT TIGER AS skal ha enkelttjenesten bruno-correspondence hos underenheten', async () => {
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.expectUserToHaveEnkelttjeneste('bruno-correspondence');
    });
  });

  test('Underenhet A som delegerte tilgangspakke til Virksomhet B skal kunne se Virksomhet B i brukerlista si', async ({
    page,
    accessManagementFrontPage,
    login,
    aktorvalgHeader,
  }) => {
    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement('25916799929');
    });

    await test.step('Velg underenhet SMISKENDE UMODEN TIGER AS og gå til fullmakter hos andre', async () => {
      await aktorvalgHeader.selectSubOrgFromHeaderMenu('SMISKENDE UMODEN TIGER AS');
      await accessManagementFrontPage.goToUsers();
    });

    await test.step('Velg KONSERVATIV USELVISK KATT KLINKEKULE i lista over brukere', async () => {
      await accessManagementFrontPage.expandOrg('KONSERVATIV USELVISK KATT KLINKEKULE');
      await accessManagementFrontPage.clickUser('KONSERVATIV USELVISK KATT KLINKEKULE');
    });

    await test.step('KONSERVATIV USELVISK KATT KLINKEKULE skal ha tilgangspakken Byggesøknad hos underenheten', async () => {
      await accessManagementFrontPage.goToArea('Bygg, anlegg og eiendom');
      await accessManagementFrontPage.expectUserToHavePackage('Byggesøknad');
    });

    await test.step('Velg hovedenhet KONSERVATIV USELVISK KATT KLINKEKULE og gå til fullmakter hos andre', async () => {
      await aktorvalgHeader.goToSelectActor('SMISKENDE UMODEN TIGER AS');
      await aktorvalgHeader.selectActorFromHeaderMenu('SMISKENDE UMODEN TIGER AS');
      await accessManagementFrontPage.goToUsers();
    });

    await test.step('Velg KONSERVATIV USELVISK KATT KLINKEKULE i lista over brukere', async () => {
      await accessManagementFrontPage.expandOrg('KONSERVATIV USELVISK KATT KLINKEKULE');
      await accessManagementFrontPage.clickUser('KONSERVATIV USELVISK KATT KLINKEKULE');
    });

    await test.step('KONSERVATIV USELVISK KATT KLINKEKULE skal ha tilgangspakken Byggesøknad hos hovedenheten', async () => {
      await accessManagementFrontPage.goToArea('Bygg, anlegg og eiendom');
      await accessManagementFrontPage.userCanDeletePackage('Byggesøknad');
    });
  });

  test('Underenhet A som delegerte enkelttjeneste til Virksomhet B skal kunne se Virksomhet B i brukerlista si', async ({
    page,
    accessManagementFrontPage,
    login,
    aktorvalgHeader,
  }) => {
    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement('26888197213');
    });

    await test.step('Velg underenhet RIKTIG AUTENTISK APE og gå til fullmakter hos andre', async () => {
      await aktorvalgHeader.selectSubOrgFromHeaderMenu('RIKTIG AUTENTISK APE');
      await accessManagementFrontPage.goToUsers();
    });

    await test.step('Velg FORMBAR GENIERKLÆRT TIGER AS i lista over brukere', async () => {
      await accessManagementFrontPage.expandOrg('FORMBAR GENIERKLÆRT TIGER AS');
      await accessManagementFrontPage.clickUser('FORMBAR GENIERKLÆRT TIGER AS');
    });

    await test.step('FORMBAR GENIERKLÆRT TIGER AS skal ha enkelttjenesten bruno-correspondence hos underenheten', async () => {
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.userCanDeleteEnkelttjeneste('bruno-correspondence');
    });

    await test.step('Velg hovedenhet RIKTIG AUTENTISK APE og gå til fullmakter hos andre', async () => {
      await aktorvalgHeader.goToSelectActor('RIKTIG AUTENTISK APE');
      await aktorvalgHeader.selectActorFromHeaderMenu('RIKTIG AUTENTISK APE');
      await accessManagementFrontPage.goToUsers();
    });

    await test.step('Velg FORMBAR GENIERKLÆRT TIGER AS i lista over brukere', async () => {
      await accessManagementFrontPage.expandOrg('FORMBAR GENIERKLÆRT TIGER AS');
      await accessManagementFrontPage.clickUser('FORMBAR GENIERKLÆRT TIGER AS');
    });

    await test.step('FORMBAR GENIERKLÆRT TIGER AS skal ha enkelttjenesten bruno-correspondence hos hovedenheten', async () => {
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.userCanDeleteEnkelttjeneste('bruno-correspondence');
    });
  });
});
