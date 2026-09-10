import { expect, test } from '../../../fixture/pomFixture';
import { MaskinportenApiRequests } from '../../../api-requests/MaskinportenApiRequests';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';

/**
 * Maskinporten-administrasjon — leverandører, konsumenter og API-fullmakter.
 *
 * Naming: `virksomhet` is always the organisation under test — the one being
 * administered, whose daglig leder logs in. The other party is named for its
 * role in that test: `leverandoer` receives API access from it, `konsument` has
 * given API access to it.
 *
 * Each describe block has its OWN `virksomhet`, because the tests add and remove
 * suppliers on it and the suite runs fully parallel.
 *
 * Daglig leder is already Maskinporten administrator (`GET
 * user/isMaskinportenAdmin` returns true), so no access package needs delegating
 * in setup. To source replacements, `yarn tenor:virksomhet --env <env>` prints an
 * organisation with its daglig leder; prefer one with no existing suppliers.
 */
const ACTORS = {
  oversikt: {
    virksomhet: { pid: '27849297746', org: '310343439', orgName: 'UFORNUFTIG VIRTUELL PUMA' },
    // Adds `virksomhet` as its own supplier, which is what makes it appear under
    // `virksomhet`'s Konsumenter tab.
    konsument: { pid: '22907797000', org: '312281325', orgName: 'DOGMATISK ANONYM TIGER AS' },
  },
  leggTilLeverandoer: {
    virksomhet: { pid: '01906499998', org: '314241878', orgName: 'ETTERPÅKLOK USENSUELL TIGER AS' },
    leverandoer: { org: '312281325', orgName: 'DOGMATISK ANONYM TIGER AS' },
  },
  slettLeverandoer: {
    virksomhet: { pid: '20855398150', org: '314318277', orgName: 'SLAKK KJEMPENDE MINK ANS' },
    leverandoer: { org: '312281325', orgName: 'DOGMATISK ANONYM TIGER AS' },
  },
  giApiFullmakt: {
    virksomhet: { pid: '12897599595', org: '312810336', orgName: 'EKSTRA KONKRET PUMA' },
    leverandoer: { org: '312281325', orgName: 'DOGMATISK ANONYM TIGER AS' },
  },
  utenTilgang: {
    virksomhet: { pid: '22877497392', org: '314239458', orgName: 'BEVISST KNUSLETE TIGER AS' },
    // A plain right-holder: may represent the organisation, but is not
    // Maskinporten administrator.
    bruker: { pid: '14871748749' },
  },
};

/**
 * An API that is delegable in BOTH at23 and tt02.
 *
 * Not every resource the scope search returns can be delegated — a fair number
 * are absent from the access-management database and answer 400 "The resource is
 * invalid" (AM-00027). This one was verified working in both environments.
 */
const API = { id: 'altinn_automation_test_lv4', title: 'Automation test - innloggingsnivå 4' };

test.describe('Maskinporten-administrasjon', () => {
  const api = new MaskinportenApiRequests();

  test.describe('oversikt', () => {
    const { virksomhet, konsument } = ACTORS.oversikt;

    test.beforeEach(async () => {
      await api.removeAllSuppliers(virksomhet.pid, virksomhet.org);
      await api.addSupplier(konsument.pid, konsument.org, virksomhet.org);
    });

    test('leverandør- og konsumentfanen viser riktig innhold', async ({
      maskinportenPage,
      login,
    }) => {
      await test.step(`Logg inn som ${virksomhet.orgName} og åpne maskinportenadministrasjon`, async () => {
        await login.LoginToAccessManagement(virksomhet.pid);
        await login.selectMainUnitBySearching(virksomhet.orgName);
        await maskinportenPage.goToMaskinporten();
        await maskinportenPage.verifyPaaMaskinporten();
      });

      await test.step('Leverandørfanen er tom', async () => {
        await expect(maskinportenPage.ingenLeverandoererTekst).toBeVisible();
      });

      await test.step(`Konsumentfanen viser ${konsument.orgName}`, async () => {
        await maskinportenPage.goToKonsumenterFane();
        await expect(maskinportenPage.connectionRad(konsument.orgName)).toBeVisible();
      });
    });

    test.afterEach(async () => {
      try {
        await api.removeSupplier(konsument.pid, konsument.org, virksomhet.org);
      } catch (error) {
        console.error('Cleanup: Failed to remove consumer relationship:', error);
      }
    });
  });

  test.describe('legg til leverandør', () => {
    const { virksomhet, leverandoer } = ACTORS.leggTilLeverandoer;

    test.beforeEach(async () => {
      await api.removeAllSuppliers(virksomhet.pid, virksomhet.org);
    });

    test('legg til en leverandør', async ({ maskinportenPage, login }) => {
      await test.step(`Logg inn som ${virksomhet.orgName} og åpne maskinportenadministrasjon`, async () => {
        await login.LoginToAccessManagement(virksomhet.pid);
        await login.selectMainUnitBySearching(virksomhet.orgName);
        await maskinportenPage.goToMaskinporten();
      });

      await test.step('Virksomheten har ingen leverandører fra før', async () => {
        await expect(maskinportenPage.ingenLeverandoererTekst).toBeVisible();
      });

      await test.step(`Legg til ${leverandoer.orgName} som leverandør`, async () => {
        await maskinportenPage.leggTilLeverandoer(leverandoer.org);
      });

      await test.step('Leverandøren er lagt til og vises i oversikten', async () => {
        // Adding navigates straight to the new supplier's own page.
        await expect(maskinportenPage.slettLeverandoerKnapp).toBeVisible();
        await maskinportenPage.goToMaskinporten();
        await expect(maskinportenPage.connectionRad(leverandoer.orgName)).toBeVisible();
      });
    });

    test.afterEach(async () => {
      try {
        await api.removeAllSuppliers(virksomhet.pid, virksomhet.org);
      } catch (error) {
        console.error('Cleanup: Failed to remove suppliers:', error);
      }
    });
  });

  test.describe('gi leverandør fullmakt til et API', () => {
    const { virksomhet, leverandoer } = ACTORS.giApiFullmakt;

    test.beforeEach(async () => {
      await api.removeAllSuppliers(virksomhet.pid, virksomhet.org);
      await api.addSupplier(virksomhet.pid, virksomhet.org, leverandoer.org);
    });

    test('gi og fjern fullmakt til et API', async ({ maskinportenPage, login }) => {
      await test.step(`Logg inn som ${virksomhet.orgName} og åpne leverandøren`, async () => {
        await login.LoginToAccessManagement(virksomhet.pid);
        await login.selectMainUnitBySearching(virksomhet.orgName);
        await maskinportenPage.goToMaskinporten();
        await maskinportenPage.aapneLeverandoer(leverandoer.orgName);
      });

      await test.step(`Gi fullmakt til ${API.title}`, async () => {
        await maskinportenPage.giFullmaktTilApi(API.title);
      });

      await test.step('API-et vises i listen over delegerte fullmakter', async () => {
        await expect(maskinportenPage.delegerteApiOverskrift(1)).toBeVisible();
        await expect(maskinportenPage.delegertApi(API.title).first()).toBeVisible();
      });

      await test.step('Fullmakten er faktisk lagret hos leverandøren', async () => {
        const resources = await api.getSupplierResources(
          virksomhet.pid,
          virksomhet.org,
          leverandoer.org,
        );
        expect(resources.length).toBeGreaterThan(0);
      });

      await test.step(`Fjern fullmakten til ${API.title}`, async () => {
        await maskinportenPage.slettApiFullmakt(API.title);
      });

      await test.step('API-et er borte fra listen', async () => {
        await expect(maskinportenPage.slettApiFullmaktKnapp(API.title)).toBeHidden();
        await expect(maskinportenPage.ingenDelegerteApiTekst).toBeVisible();
      });

      await test.step('og fullmakten er fjernet hos leverandøren', async () => {
        const resources = await api.getSupplierResources(
          virksomhet.pid,
          virksomhet.org,
          leverandoer.org,
        );
        expect(resources).toHaveLength(0);
      });
    });

    test.afterEach(async () => {
      try {
        await api.removeAllSuppliers(virksomhet.pid, virksomhet.org);
      } catch (error) {
        console.error('Cleanup: Failed to remove suppliers:', error);
      }
    });
  });

  test.describe('slett leverandør', () => {
    const { virksomhet, leverandoer } = ACTORS.slettLeverandoer;

    test.beforeEach(async () => {
      await api.removeAllSuppliers(virksomhet.pid, virksomhet.org);
      await api.addSupplier(virksomhet.pid, virksomhet.org, leverandoer.org);
    });

    test('slett en leverandør', async ({ maskinportenPage, login }) => {
      await test.step(`Logg inn som ${virksomhet.orgName} og åpne maskinportenadministrasjon`, async () => {
        await login.LoginToAccessManagement(virksomhet.pid);
        await login.selectMainUnitBySearching(virksomhet.orgName);
        await maskinportenPage.goToMaskinporten();
      });

      await test.step(`Åpne leverandøren ${leverandoer.orgName}`, async () => {
        await expect(maskinportenPage.connectionRad(leverandoer.orgName)).toBeVisible();
        await maskinportenPage.aapneLeverandoer(leverandoer.orgName);
      });

      await test.step('Slett leverandøren', async () => {
        await maskinportenPage.slettLeverandoer();
      });

      await test.step('Leverandøren er borte fra oversikten', async () => {
        await expect(maskinportenPage.ingenLeverandoererTekst).toBeVisible();
        await expect(maskinportenPage.connectionRad(leverandoer.orgName)).toBeHidden();
      });
    });

    test.afterEach(async ({}, testInfo) => {
      if (testInfo.status === 'passed') return;

      try {
        await api.removeAllSuppliers(virksomhet.pid, virksomhet.org);
      } catch (error) {
        console.error('Cleanup: Failed to remove suppliers:', error);
      }
    });
  });

  test.describe('bruker uten tilgang', () => {
    const { virksomhet, bruker } = ACTORS.utenTilgang;
    const connections = new EnduserConnection();

    test.beforeEach(async () => {
      // Make `bruker` a plain right-holder: able to represent the organisation,
      // but not a Maskinporten administrator.
      await connections.addConnection(virksomhet.pid, virksomhet.org, bruker.pid);
    });

    test('bruker uten maskinportenrettighet kommer ikke inn på siden', async ({
      maskinportenPage,
      login,
    }) => {
      await test.step(`Logg inn som ${bruker.pid} og velg ${virksomhet.orgName}`, async () => {
        await login.LoginToAccessManagement(bruker.pid);
        await login.selectMainUnitBySearching(virksomhet.orgName);
      });

      await test.step('Menyvalget for maskinportenadministrasjon vises ikke', async () => {
        await expect(maskinportenPage.sidebar.maskinporten).toBeHidden();
      });

      await test.step('Direkte navigering sender brukeren bort fra siden', async () => {
        await maskinportenPage.goToMaskinportenViaUrl();
        await expect(maskinportenPage.pageHeading).toBeHidden();
        await expect(maskinportenPage.leverandoererFane).toBeHidden();
      });
    });

    test.afterEach(async () => {
      try {
        await connections.deleteConnection(virksomhet.pid, virksomhet.org, [bruker.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });
});
