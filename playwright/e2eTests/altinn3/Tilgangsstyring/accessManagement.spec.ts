import { test } from '../../../fixture/pomFixture';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';
import {
  TenorTestData,
  type TenorPerson,
  type TenorDagligLederMedOrg,
  type TenorHovedenhetMedUnderenhet,
} from '../../../tenor/TenorTestData';

type TenorOrg = { orgnr: string; navn: string };

const service = 'bruno-correspondence';

test.describe('Tilgangsstyring', () => {
  const api = new EnduserConnection();
  const tenor = new TenorTestData();

  test.describe('Tilgangsstyrer skal kunne delegere tilgangspakker de selv har', () => {
    let org: TenorDagligLederMedOrg;
    let tilgangsstyrer: TenorPerson;
    let recipient: TenorPerson;
    const packages = [
      'urn:altinn:accesspackage:tilgangsstyrer',
      'urn:altinn:accesspackage:posttjenester',
      'urn:altinn:accesspackage:byggesoknad',
    ];

    test.beforeEach(async () => {
      // Daglig leder gir `tilgangsstyrer` rollen + pakkene, og kobler en egen
      // `recipient` til virksomheten. `tilgangsstyrer` logger inn, representerer
      // virksomheten og skal kunne delegere pakkene sine videre til `recipient`
      // (man kan ikke gi fullmakt til seg selv, derfor en separat mottaker).
      org = await tenor.dagligLederMedOrg();
      [tilgangsstyrer, recipient] = await tenor.bosatteMyndigePersoner(2);
      await api.addConnectionAndPackagesToUser(
        org.dagligLeder.pid,
        org.org.orgnr,
        tilgangsstyrer.pid,
        packages,
      );
      await api.addConnection(org.dagligLeder.pid, org.org.orgnr, recipient.pid);
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(org.dagligLeder.pid, org.org.orgnr, [
          tilgangsstyrer.pid,
          recipient.pid,
        ]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Tilgangsstyrer skal kunne delegere tilgangspakker de selv har', async ({
      login,
      accessManagementFrontPage,
    }) => {
      await test.step('Log in', async () => {
        await login.LoginToAccessManagement(tilgangsstyrer.pid);
      });

      await test.step(`Velg org ${org.org.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(org.org.navn);
      });

      await test.step(`Gå til brukere og velg mottaker "${recipient.navn}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expectOthersWithRightsListToBeVisible();
        await accessManagementFrontPage.clickUser(recipient.navn);
      });

      await test.step('Klikk "Gi fullmakt"', async () => {
        await accessManagementFrontPage.clickGiFullmakt();
      });

      await test.step('Skal kunne gi fullmakt til "Tilgangsstyrer"', async () => {
        await accessManagementFrontPage.goToArea('Administrere tilganger');
        await accessManagementFrontPage.expectAccessPackageToBeDelegable('Tilgangsstyrer');
      });

      await test.step('Skal kunne gi fullmakt til "Posttjenester"', async () => {
        await accessManagementFrontPage.goToArea('Andre tjenesteytende næringer');
        await accessManagementFrontPage.expectAccessPackageToBeDelegable('Posttjenester');
      });
    });
  });

  test.describe('Hovedadministrator skal kunne delegere nesten alle tilgangspakker', () => {
    let org: TenorDagligLederMedOrg;
    let user: TenorPerson;
    const packages = ['urn:altinn:accesspackage:hovedadministrator'];

    test.beforeEach(async () => {
      [org, user] = await Promise.all([tenor.dagligLederMedOrg(), tenor.bosattMyndigPerson()]);
      await api.addConnectionAndPackagesToUser(
        org.dagligLeder.pid,
        org.org.orgnr,
        user.pid,
        packages,
      );
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(org.dagligLeder.pid, org.org.orgnr, [user.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Hovedadministrator skal kunne delegere nesten alle tilgangspakker', async ({
      login,
      accessManagementFrontPage,
    }) => {
      await test.step('Log in', async () => {
        await login.LoginToAccessManagement(user.pid);
      });

      await test.step(`Velg org ${org.org.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(org.org.navn);
      });

      await test.step('Gå til brukere og velg deg selv', async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expectOthersWithRightsListToBeVisible();
        await accessManagementFrontPage.clickUser(user.navn);
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
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(
          'Elektronisk kommunikasjon',
        );
      });

      await test.step('Brukeren skal kunne til å gi fullmakt til "Bygg, anlegg og eiendom"-pakker', async () => {
        await accessManagementFrontPage.goToArea('Bygg, anlegg og eiendom');
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(
          'Motta nabo- og planvarsel',
        );
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
      });
    });
  });

  test.describe('Vanlig bruker skal ikke kunne delegere pakker de selv ikke har tilgang til', () => {
    let org: TenorDagligLederMedOrg;
    let user: TenorPerson;
    const packages = [
      'urn:altinn:accesspackage:tilgangsstyrer',
      'urn:altinn:accesspackage:byggesoknad',
    ];

    test.beforeEach(async () => {
      [org, user] = await Promise.all([tenor.dagligLederMedOrg(), tenor.bosattMyndigPerson()]);
      await api.addConnectionAndPackagesToUser(
        org.dagligLeder.pid,
        org.org.orgnr,
        user.pid,
        packages,
      );
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(org.dagligLeder.pid, org.org.orgnr, [user.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Vanlig bruker skal ikke kunne delegere pakker de selv ikke har tilgang til', async ({
      login,
      accessManagementFrontPage,
    }) => {
      await test.step('Log in', async () => {
        await login.LoginToAccessManagement(user.pid);
      });

      await test.step(`Velg org ${org.org.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(org.org.navn);
      });

      await test.step('Gå til brukere-siden og velg deg selv', async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expectOthersWithRightsListToBeVisible();
        await accessManagementFrontPage.clickUser(user.navn);
      });

      await test.step('User should not be able to give power of attorney to themselves', async () => {
        await accessManagementFrontPage.expectPowerOfAttorneyButtonToNotBeVisible();
      });
    });
  });

  test.describe('Standard bruker skal kun kunne se deg selv på brukere-siden', () => {
    let org: TenorDagligLederMedOrg;
    let user: TenorPerson;
    const packages = ['urn:altinn:accesspackage:byggesoknad'];

    test.beforeEach(async () => {
      [org, user] = await Promise.all([tenor.dagligLederMedOrg(), tenor.bosattMyndigPerson()]);
      await api.addConnectionAndPackagesToUser(
        org.dagligLeder.pid,
        org.org.orgnr,
        user.pid,
        packages,
      );
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(org.dagligLeder.pid, org.org.orgnr, [user.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Standard bruker skal kun kunne se deg selv på brukere-siden', async ({
      login,
      accessManagementFrontPage,
    }) => {
      await test.step('Log in', async () => {
        await login.LoginToAccessManagement(user.pid);
      });

      await test.step(`Velg org ${org.org.navn} og gå til tilgangsstyring`, async () => {
        await login.selectMainUnitBySearching(org.org.navn);
      });

      await test.step('Gå til brukere-siden', async () => {
        await accessManagementFrontPage.goToUsers();
      });

      await test.step('Brukeren skal ikke kunne gi fullmakt til deg selv', async () => {
        await accessManagementFrontPage.expectPowerOfAttorneyButtonToNotBeVisible();
      });
    });
  });
});

test.describe('over- og underenheter', () => {
  const api = new EnduserConnection();
  const tenor = new TenorTestData();

  test.describe('Virksomhet skal se tilgangspakke fra hoved- og underenhet under «fullmakter hos andre»', () => {
    let delegator: TenorHovedenhetMedUnderenhet;
    let recipient: TenorDagligLederMedOrg;

    test.beforeEach(async () => {
      [delegator, recipient] = await Promise.all([
        tenor.hovedenhetMedUnderenhet(),
        tenor.dagligLederMedOrg(),
      ]);
      // Hovedenheten delegerer Byggesøknad til mottakervirksomheten; delegasjonen
      // vises hos både hoved- og underenheten i mottakerens «fullmakter hos andre».
      await api.addConnectionAndPackagesToUser(
        delegator.dagligLeder.pid,
        delegator.hovedenhet.orgnr,
        recipient.org.orgnr,
        ['urn:altinn:accesspackage:byggesoknad'],
      );
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(delegator.dagligLeder.pid, delegator.hovedenhet.orgnr, [
          recipient.org.orgnr,
        ]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Virksomhet skal se tilgangspakke fra hoved- og underenhet under «fullmakter hos andre»', async ({
      accessManagementFrontPage,
      login,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(recipient.dagligLeder.pid);
      });

      await test.step(`Velg ${recipient.org.navn} og gå til fullmakter hos andre`, async () => {
        await login.selectMainUnitBySearching(recipient.org.navn);
        await accessManagementFrontPage.goToFullmakterHosAndre();
      });

      await test.step(`Velg hovedenhet ${delegator.hovedenhet.navn} i lista over fullmakter hos andre`, async () => {
        await accessManagementFrontPage.expandOrg(delegator.hovedenhet.navn);
        await accessManagementFrontPage.clickUser(delegator.hovedenhet.navn);
      });

      await test.step(`Skal ha tilgangspakken Byggesøknad hos hovedenheten`, async () => {
        await accessManagementFrontPage.goToArea('Bygg, anlegg og eiendom');
        await accessManagementFrontPage.userCanDeletePackage('Byggesøknad');
      });

      await test.step(`Gå tilbake til fullmakter hos andre og velg underenhet ${delegator.underenhet.navn}`, async () => {
        await accessManagementFrontPage.goToFullmakterHosAndre();
        await accessManagementFrontPage.expandOrg(delegator.underenhet.navn);
        await accessManagementFrontPage.clickUser(delegator.underenhet.navn, 1);
      });

      await test.step(`Skal ha tilgangspakken Byggesøknad hos underenheten`, async () => {
        await accessManagementFrontPage.goToArea('Bygg, anlegg og eiendom');
        await accessManagementFrontPage.expectUserToHavePackage('Byggesøknad');
      });
    });
  });

  test.describe('Hoved- og underenhet skal kunne se virksomhet de har delegert tilgangspakke til', () => {
    let delegator: TenorHovedenhetMedUnderenhet;
    let recipientOrg: TenorOrg;

    test.beforeEach(async () => {
      [delegator, recipientOrg] = await Promise.all([
        tenor.hovedenhetMedUnderenhet(),
        tenor.hentTilfeldigVirksomhet(),
      ]);
      // Hovedenheten delegerer Byggesøknad til virksomhet B. Delegasjonen er
      // synlig både hos hovedenheten (direkte, slettbar) og hos underenheten
      // (arvet). En delegasjon gjort FRA underenheten vises derimot ikke hos
      // hovedenheten, så vi delegerer fra hovedenheten.
      await api.addConnectionAndPackagesToUser(
        delegator.dagligLeder.pid,
        delegator.hovedenhet.orgnr,
        recipientOrg.orgnr,
        ['urn:altinn:accesspackage:byggesoknad'],
      );
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(delegator.dagligLeder.pid, delegator.hovedenhet.orgnr, [
          recipientOrg.orgnr,
        ]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Hoved- og underenhet skal kunne se virksomhet de har delegert tilgangspakke til', async ({
      accessManagementFrontPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.dagligLeder.pid);
      });

      await test.step(`Velg underenhet ${delegator.underenhet.navn} og gå til brukere`, async () => {
        await aktorvalgHeader.selectSubOrgFromHeaderMenu(delegator.underenhet.navn);
        await accessManagementFrontPage.goToUsers();
      });

      await test.step(`Velg ${recipientOrg.navn} i lista over brukere`, async () => {
        await accessManagementFrontPage.expandOrg(recipientOrg.navn);
        await accessManagementFrontPage.clickUser(recipientOrg.navn);
      });

      await test.step(`${recipientOrg.navn} skal ha tilgangspakken Byggesøknad hos underenheten`, async () => {
        await accessManagementFrontPage.goToArea('Bygg, anlegg og eiendom');
        await accessManagementFrontPage.expectUserToHavePackage('Byggesøknad');
      });

      await test.step(`Velg hovedenhet ${delegator.hovedenhet.navn} og gå til brukere`, async () => {
        await aktorvalgHeader.goToSelectActor(delegator.hovedenhet.navn);
        await aktorvalgHeader.selectActorFromHeaderMenu(delegator.hovedenhet.navn);
        await accessManagementFrontPage.goToUsers();
      });

      await test.step(`Velg ${recipientOrg.navn} i lista over brukere`, async () => {
        await accessManagementFrontPage.expandOrg(recipientOrg.navn);
        await accessManagementFrontPage.clickUser(recipientOrg.navn);
      });

      await test.step(`${recipientOrg.navn} skal ha tilgangspakken Byggesøknad hos hovedenheten`, async () => {
        await accessManagementFrontPage.goToArea('Bygg, anlegg og eiendom');
        await accessManagementFrontPage.userCanDeletePackage('Byggesøknad');
      });
    });
  });

  test.describe('Virksomhet skal se enkelttjeneste fra hoved- og underenhet under «fullmakter hos andre»', () => {
    let delegator: TenorHovedenhetMedUnderenhet;
    let recipient: TenorDagligLederMedOrg;

    test.beforeEach(async () => {
      [delegator, recipient] = await Promise.all([
        tenor.hovedenhetMedUnderenhet(),
        tenor.dagligLederMedOrg(),
      ]);
      // Hovedenheten delegerer enkelttjenesten til mottakervirksomheten; vises hos
      // både hoved- og underenheten i mottakerens «fullmakter hos andre».
      await api.addConnection(
        delegator.dagligLeder.pid,
        delegator.hovedenhet.orgnr,
        recipient.org.orgnr,
      );
      await api.delegateSingleService(
        delegator.dagligLeder.pid,
        delegator.hovedenhet.orgnr,
        recipient.org.orgnr,
        service,
      );
    });

    test.afterEach(async () => {
      try {
        await api.deleteSingleServiceDelegation(
          delegator.dagligLeder.pid,
          delegator.hovedenhet.orgnr,
          recipient.org.orgnr,
          service,
        );
      } catch (error) {
        console.error('Cleanup: Failed to delete single service delegation:', error);
      }
      try {
        await api.deleteConnection(delegator.dagligLeder.pid, delegator.hovedenhet.orgnr, [
          recipient.org.orgnr,
        ]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Virksomhet skal se enkelttjeneste fra hoved- og underenhet under «fullmakter hos andre»', async ({
      accessManagementFrontPage,
      login,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(recipient.dagligLeder.pid);
      });

      await test.step(`Velg ${recipient.org.navn} og gå til fullmakter hos andre`, async () => {
        await login.selectMainUnitBySearching(recipient.org.navn);
        await accessManagementFrontPage.goToFullmakterHosAndre();
      });

      await test.step(`Velg hovedenhet ${delegator.hovedenhet.navn} i lista over fullmakter hos andre`, async () => {
        await accessManagementFrontPage.expandOrg(delegator.hovedenhet.navn);
        await accessManagementFrontPage.clickUser(delegator.hovedenhet.navn);
      });

      await test.step(`Skal ha enkelttjenesten ${service} hos hovedenheten`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.userCanDeleteEnkelttjeneste(service);
      });

      await test.step(`Gå tilbake til fullmakter hos andre og velg underenhet ${delegator.underenhet.navn}`, async () => {
        await accessManagementFrontPage.goToFullmakterHosAndre();
        await accessManagementFrontPage.expandOrg(delegator.underenhet.navn);
        await accessManagementFrontPage.clickUser(delegator.underenhet.navn, 1);
      });

      await test.step(`Skal ha enkelttjenesten ${service} hos underenheten`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.expectUserToHaveEnkelttjeneste(service);
      });
    });
  });

  test.describe('Hoved- og underenhet skal kunne se virksomhet de har delegert enkelttjeneste til', () => {
    let delegator: TenorHovedenhetMedUnderenhet;
    let recipientOrg: TenorOrg;

    test.beforeEach(async () => {
      [delegator, recipientOrg] = await Promise.all([
        tenor.hovedenhetMedUnderenhet(),
        tenor.hentTilfeldigVirksomhet(),
      ]);
      // Hovedenheten delegerer enkelttjenesten til B; synlig både hos hoved- og underenhet.
      await api.addConnection(
        delegator.dagligLeder.pid,
        delegator.hovedenhet.orgnr,
        recipientOrg.orgnr,
      );
      await api.delegateSingleService(
        delegator.dagligLeder.pid,
        delegator.hovedenhet.orgnr,
        recipientOrg.orgnr,
        service,
      );
    });

    test.afterEach(async () => {
      try {
        await api.deleteSingleServiceDelegation(
          delegator.dagligLeder.pid,
          delegator.hovedenhet.orgnr,
          recipientOrg.orgnr,
          service,
        );
      } catch (error) {
        console.error('Cleanup: Failed to delete single service delegation:', error);
      }
      try {
        await api.deleteConnection(delegator.dagligLeder.pid, delegator.hovedenhet.orgnr, [
          recipientOrg.orgnr,
        ]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Hoved- og underenhet skal kunne se virksomhet de har delegert enkelttjeneste til', async ({
      accessManagementFrontPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.dagligLeder.pid);
      });

      await test.step(`Velg underenhet ${delegator.underenhet.navn} og gå til brukere`, async () => {
        await aktorvalgHeader.selectSubOrgFromHeaderMenu(delegator.underenhet.navn);
        await accessManagementFrontPage.goToUsers();
      });

      await test.step(`Velg ${recipientOrg.navn} i lista over brukere`, async () => {
        await accessManagementFrontPage.expandOrg(recipientOrg.navn);
        await accessManagementFrontPage.clickUser(recipientOrg.navn);
      });

      await test.step(`${recipientOrg.navn} skal ha enkelttjenesten ${service} hos underenheten`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.userCanDeleteEnkelttjeneste(service);
      });

      await test.step(`Velg hovedenhet ${delegator.hovedenhet.navn} og gå til brukere`, async () => {
        await aktorvalgHeader.goToSelectActor(delegator.hovedenhet.navn);
        await aktorvalgHeader.selectActorFromHeaderMenu(delegator.hovedenhet.navn);
        await accessManagementFrontPage.goToUsers();
      });

      await test.step(`Velg ${recipientOrg.navn} i lista over brukere`, async () => {
        await accessManagementFrontPage.expandOrg(recipientOrg.navn);
        await accessManagementFrontPage.clickUser(recipientOrg.navn);
      });

      await test.step(`${recipientOrg.navn} skal ha enkelttjenesten ${service} hos hovedenheten`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.userCanDeleteEnkelttjeneste(service);
      });
    });
  });
});
