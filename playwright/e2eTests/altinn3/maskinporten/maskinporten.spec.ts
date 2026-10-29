import { expect, test } from '../../../fixture/pomFixture';
import type { MaskinportenApiRequests } from '../../../api-requests/MaskinportenApiRequests';
import { loadTestdata } from '../../../util/testdata';

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
 *
 * In `oversikt`, `konsument` adds `virksomhet` as its own supplier, which is what
 * makes it appear under `virksomhet`'s Konsumenter tab. In `utenTilgang`, `bruker`
 * may represent the organisation but is not Maskinporten administrator.
 */
const ACTORS = loadTestdata('maskinporten');

/**
 * An API that is delegable in BOTH at23 and tt02.
 *
 * Not every resource the scope search returns can be delegated — a fair number
 * are absent from the access-management database and answer 400 "The resource is
 * invalid" (AM-00027). This one was verified working in both environments.
 */
const API = { id: 'altinn_automation_test_lv4', title: 'Automation test - innloggingsnivå 4' };

test.describe('Maskinporten-administrasjon', () => {
  /**
   * Removes one specific supplier link, ignoring "it was not there anyway".
   *
   * Deliberately narrow: these organisations are shared with other tests and
   * with manual testers, so a test only ever clears the one connection it is
   * about to create.
   */
  const removeSupplierIfPresent = async (
    maskinporten: MaskinportenApiRequests,
    pid: string,
    orgNo: string,
    supplierOrgNo: string,
  ) => {
    try {
      await maskinporten.removeSupplier(pid, orgNo, supplierOrgNo);
    } catch {
      /* not present — nothing to clean */
    }
  };

  test.describe('oversikt', () => {
    const { virksomhet, konsument } = ACTORS.oversikt;

    test.beforeEach(async ({ api }) => {
      await removeSupplierIfPresent(
        api.maskinporten,
        konsument.pid,
        konsument.orgNo,
        virksomhet.orgNo,
      );
      await api.maskinporten.addSupplier(konsument.pid, konsument.orgNo, virksomhet.orgNo);
    });

    test('leverandør- og konsumentfanen viser riktig innhold', async ({
      maskinportenPage,
      login,
    }) => {
      await test.step(`Logg inn som ${virksomhet.name} og åpne maskinportenadministrasjon`, async () => {
        await login.LoginToAccessManagement(virksomhet.pid);
        await login.selectActor(virksomhet.name);
        await maskinportenPage.goToMaskinporten();
        await maskinportenPage.verifyPaaMaskinporten();
      });

      await test.step('Leverandørfanen er tom', async () => {
        await expect(maskinportenPage.ingenLeverandoererTekst).toBeVisible();
      });

      await test.step(`Konsumentfanen viser ${konsument.name}`, async () => {
        await maskinportenPage.goToKonsumenterFane();
        await expect(maskinportenPage.connectionRad(konsument.name)).toBeVisible();
      });
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.maskinporten.removeSupplier(konsument.pid, konsument.orgNo, virksomhet.orgNo);
      } catch (error) {
        console.error('Cleanup: Failed to remove consumer relationship:', error);
      }
    });
  });

  test.describe('legg til leverandør', () => {
    const { virksomhet, leverandoer } = ACTORS.leggTilLeverandoer;

    test.beforeEach(async ({ api }) => {
      await removeSupplierIfPresent(
        api.maskinporten,
        virksomhet.pid,
        virksomhet.orgNo,
        leverandoer.orgNo,
      );
    });

    test('legg til en leverandør', async ({ maskinportenPage, login }) => {
      await test.step(`Logg inn som ${virksomhet.name} og åpne maskinportenadministrasjon`, async () => {
        await login.LoginToAccessManagement(virksomhet.pid);
        await login.selectActor(virksomhet.name);
        await maskinportenPage.goToMaskinporten();
      });

      await test.step('Virksomheten har ingen leverandører fra før', async () => {
        await expect(maskinportenPage.ingenLeverandoererTekst).toBeVisible();
      });

      await test.step(`Legg til ${leverandoer.name} som leverandør`, async () => {
        await maskinportenPage.leggTilLeverandoer(leverandoer.orgNo);
      });

      await test.step('Leverandøren er lagt til og vises i oversikten', async () => {
        // Adding navigates straight to the new supplier's own page.
        await expect(maskinportenPage.slettLeverandoerKnapp).toBeVisible();
        await maskinportenPage.goToMaskinporten();
        await expect(maskinportenPage.connectionRad(leverandoer.name)).toBeVisible();
      });
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.maskinporten.removeSupplier(virksomhet.pid, virksomhet.orgNo, leverandoer.orgNo);
      } catch (error) {
        console.error('Cleanup: Failed to remove supplier:', error);
      }
    });
  });

  test.describe('gi leverandør fullmakt til et API', () => {
    const { virksomhet, leverandoer } = ACTORS.giApiFullmakt;

    test.beforeEach(async ({ api }) => {
      await removeSupplierIfPresent(
        api.maskinporten,
        virksomhet.pid,
        virksomhet.orgNo,
        leverandoer.orgNo,
      );
      await api.maskinporten.addSupplier(virksomhet.pid, virksomhet.orgNo, leverandoer.orgNo);
    });

    test('gi og fjern fullmakt til et API', async ({ maskinportenPage, login, api }) => {
      await test.step(`Logg inn som ${virksomhet.name} og åpne leverandøren`, async () => {
        await login.LoginToAccessManagement(virksomhet.pid);
        await login.selectActor(virksomhet.name);
        await maskinportenPage.goToMaskinporten();
        await maskinportenPage.aapneLeverandoer(leverandoer.name);
      });

      await test.step(`Gi fullmakt til ${API.title}`, async () => {
        await maskinportenPage.giFullmaktTilApi(API.title);
      });

      await test.step('API-et vises i listen over delegerte fullmakter', async () => {
        await expect(maskinportenPage.delegerteApiOverskrift(1)).toBeVisible();
        await expect(maskinportenPage.delegertApi(API.title)).toBeVisible();
      });

      await test.step('Fullmakten er faktisk lagret hos leverandøren', async () => {
        const resources = await api.maskinporten.getSupplierResources(
          virksomhet.pid,
          virksomhet.orgNo,
          leverandoer.orgNo,
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
        const resources = await api.maskinporten.getSupplierResources(
          virksomhet.pid,
          virksomhet.orgNo,
          leverandoer.orgNo,
        );
        expect(resources).toHaveLength(0);
      });
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.maskinporten.removeSupplier(virksomhet.pid, virksomhet.orgNo, leverandoer.orgNo);
      } catch (error) {
        console.error('Cleanup: Failed to remove supplier:', error);
      }
    });
  });

  test.describe('slett leverandør', () => {
    const { virksomhet, leverandoer } = ACTORS.slettLeverandoer;

    test.beforeEach(async ({ api }) => {
      await removeSupplierIfPresent(
        api.maskinporten,
        virksomhet.pid,
        virksomhet.orgNo,
        leverandoer.orgNo,
      );
      await api.maskinporten.addSupplier(virksomhet.pid, virksomhet.orgNo, leverandoer.orgNo);
    });

    test('slett en leverandør', async ({ maskinportenPage, login }) => {
      await test.step(`Logg inn som ${virksomhet.name} og åpne maskinportenadministrasjon`, async () => {
        await login.LoginToAccessManagement(virksomhet.pid);
        await login.selectActor(virksomhet.name);
        await maskinportenPage.goToMaskinporten();
      });

      await test.step(`Åpne leverandøren ${leverandoer.name}`, async () => {
        await expect(maskinportenPage.connectionRad(leverandoer.name)).toBeVisible();
        await maskinportenPage.aapneLeverandoer(leverandoer.name);
      });

      await test.step('Slett leverandøren', async () => {
        await maskinportenPage.slettLeverandoer();
      });

      await test.step('Leverandøren er borte fra oversikten', async () => {
        await expect(maskinportenPage.ingenLeverandoererTekst).toBeVisible();
        await expect(maskinportenPage.connectionRad(leverandoer.name)).toBeHidden();
      });
    });

    test.afterEach(async ({ api }, testInfo) => {
      if (testInfo.status === 'passed') return;

      try {
        await api.maskinporten.removeSupplier(virksomhet.pid, virksomhet.orgNo, leverandoer.orgNo);
      } catch (error) {
        console.error('Cleanup: Failed to remove supplier:', error);
      }
    });
  });

  test.describe('bruker uten tilgang', () => {
    const { virksomhet, bruker } = ACTORS.utenTilgang;

    test.beforeEach(async ({ api }) => {
      // Make `bruker` a plain right-holder: able to represent the organisation,
      // but not a Maskinporten administrator.
      await api.connections.addConnection(virksomhet.pid, virksomhet.orgNo, bruker.pid);
    });

    test('bruker uten maskinportenrettighet kommer ikke inn på siden', async ({
      maskinportenPage,
      login,
    }) => {
      await test.step(`Logg inn som ${bruker.pid} og velg ${virksomhet.name}`, async () => {
        await login.LoginToAccessManagement(bruker.pid);
        await login.selectActor(virksomhet.name);
      });

      await test.step('Menyvalget for maskinportenadministrasjon vises ikke', async () => {
        await expect(maskinportenPage.sidebar.maskinporten).toBeHidden();
      });

      await test.step('Direkte navigering sender brukeren til forsiden', async () => {
        await maskinportenPage.goToMaskinportenViaUrl();
        // Assert where the user ended up, not just that the page is absent —
        // a bare toBeHidden() would also pass mid-load or on an error page.
        await expect(maskinportenPage.page).toHaveURL(maskinportenPage.landingssideUrl);
        await expect(maskinportenPage.landingssideOverskrift).toBeVisible();
        await expect(maskinportenPage.pageHeading).toBeHidden();
      });
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.connections.deleteConnection(virksomhet.pid, virksomhet.orgNo, [bruker.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });
});
