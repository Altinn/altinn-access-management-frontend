import { expect, test } from '../../../fixture/pomFixture';
import { loadTestdata } from '../../../util/testdata';

/**
 * Fullmaktsoversikt — oversikt over tilgangspakker og hvem som har fullmakt.
 *
 * `virksomhet` is the organisation under test, whose daglig leder logs in.
 * `mottaker` is the person receiving a package, and `bruker` a person who is only
 * a right-holder — connected to the organisation, but without the package.
 *
 * Each describe block has its OWN `virksomhet`: these tests delegate and revoke
 * packages on it, and the suite runs fully parallel.
 *
 * To source replacements: `yarn tenor facilitator-orgnr --env <env> --dagl` for
 * organisations with their daglig leder, `yarn tenor personer --env <env>` for
 * people.
 */
const TESTDATA = loadTestdata('fullmakter');

const PAKKE = { urn: 'urn:altinn:accesspackage:posttjenester', navn: 'Posttjenester' };

test.describe('Fullmaktsoversikt', () => {
  test.describe('oversikt', () => {
    const {
      organisasjoner: [virksomhet],
    } = TESTDATA.oversikt;

    // No setup: the overview lists every access package regardless of what has
    // been delegated, and nothing here asserts on a recipient.
    test('oversikten viser tilgangspakker og nedlastingsvalg', async ({
      fullmaktsoversiktPage,
      login,
    }) => {
      await test.step(`Logg inn som ${virksomhet.name} og åpne fullmaktsoversikten`, async () => {
        await login.LoginToAccessManagement(virksomhet.pid);
        await login.selectActor(virksomhet.name);
        await fullmaktsoversiktPage.goToFullmakter();
        await fullmaktsoversiktPage.verifyPaaFullmaktsoversikt();
      });

      await test.step('Nedlasting av fullmakter er tilgjengelig', async () => {
        await expect(fullmaktsoversiktPage.lastNedKnapp).toBeVisible();
      });

      await test.step(`Søk finner tilgangspakken ${PAKKE.navn}`, async () => {
        await fullmaktsoversiktPage.pakkeSok.fill(PAKKE.navn);
        await expect(fullmaktsoversiktPage.pakkeLenke(PAKKE.navn).first()).toBeVisible();
      });
    });
  });

  test.describe('pakkens brukere', () => {
    const {
      organisasjoner: [virksomhet],
      personer: [mottaker],
    } = TESTDATA.pakkensBrukere;

    test.beforeEach(async ({ api }) => {
      await api.connections.addConnectionAndPackagesToUser(
        virksomhet.pid,
        virksomhet.orgNo,
        mottaker.pid,
        [PAKKE.urn],
      );
    });

    test('pakkesiden viser hvem som har fullmakt', async ({ fullmaktsoversiktPage, login }) => {
      await test.step(`Logg inn som ${virksomhet.name} og åpne ${PAKKE.navn}`, async () => {
        await login.LoginToAccessManagement(virksomhet.pid);
        await login.selectActor(virksomhet.name);
        await fullmaktsoversiktPage.goToFullmakter();
        await fullmaktsoversiktPage.aapneTilgangspakke(PAKKE.navn);
      });

      await test.step(`${mottaker.name} står oppført med fullmakt`, async () => {
        // The tab lists only a handful of users up front, so find the user the
        // way the tab intends — by searching. Which users appear unprompted
        // depends on how many the organisation has, so relying on that is flaky.
        await fullmaktsoversiktPage.sokEtterBruker(mottaker.name);
        await expect(fullmaktsoversiktPage.brukerRad(mottaker.name)).toBeVisible();
        await expect(fullmaktsoversiktPage.slettFullmaktKnapp(mottaker.name)).toBeVisible();
      });
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.connections.deleteConnection(virksomhet.pid, virksomhet.orgNo, [mottaker.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('gi og slett fullmakt fra pakkesiden', () => {
    const {
      organisasjoner: [virksomhet],
      personer: [bruker],
    } = TESTDATA.giOgSlett;

    test.beforeEach(async ({ api }) => {
      // A connection WITHOUT the package, so the user shows up on the package
      // page as someone who can be given it.
      try {
        await api.connections.deleteConnection(virksomhet.pid, virksomhet.orgNo, [bruker.pid]);
      } catch {
        /* not connected — nothing to clean */
      }
      await api.connections.addConnection(virksomhet.pid, virksomhet.orgNo, bruker.pid);
    });

    test('gi og slett fullmakt til en tilgangspakke', async ({ fullmaktsoversiktPage, login }) => {
      await test.step(`Logg inn som ${virksomhet.name} og åpne ${PAKKE.navn}`, async () => {
        await login.LoginToAccessManagement(virksomhet.pid);
        await login.selectActor(virksomhet.name);
        await fullmaktsoversiktPage.goToFullmakter();
        await fullmaktsoversiktPage.aapneTilgangspakke(PAKKE.navn);
      });

      await test.step(`Gi ${bruker.name} fullmakt til ${PAKKE.navn}`, async () => {
        await fullmaktsoversiktPage.sokEtterBruker(bruker.name);
        await expect(fullmaktsoversiktPage.giFullmaktKnapp(bruker.name)).toBeVisible();
        await fullmaktsoversiktPage.giFullmakt(bruker.name);
      });

      await test.step(`${bruker.name} har nå fullmakt`, async () => {
        await expect(fullmaktsoversiktPage.slettFullmaktKnapp(bruker.name)).toBeVisible();
      });

      await test.step('Slett fullmakten igjen', async () => {
        await fullmaktsoversiktPage.slettFullmakt(bruker.name);
      });

      await test.step(`${bruker.name} kan igjen få fullmakt`, async () => {
        await expect(fullmaktsoversiktPage.giFullmaktKnapp(bruker.name)).toBeVisible();
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

  test.describe('pakkens tjenester', () => {
    const {
      organisasjoner: [virksomhet],
    } = TESTDATA.tjenester;

    test('tjenestefanen viser tjenestene pakken gir tilgang til', async ({
      fullmaktsoversiktPage,
      login,
    }) => {
      await test.step(`Logg inn som ${virksomhet.name} og åpne ${PAKKE.navn}`, async () => {
        await login.LoginToAccessManagement(virksomhet.pid);
        await login.selectActor(virksomhet.name);
        await fullmaktsoversiktPage.goToFullmakter();
        // The overview lists every package, so no delegation is needed to reach it.
        await fullmaktsoversiktPage.aapneTilgangspakke(PAKKE.navn);
      });

      await test.step('Tjenestefanen lister minst én tjeneste', async () => {
        await fullmaktsoversiktPage.goToTjenesterFane();
        await expect(fullmaktsoversiktPage.tjenesteSok).toBeVisible();
        await expect(fullmaktsoversiktPage.tjenesteRader.first()).toBeVisible();
      });
    });
  });

  test.describe('bruker uten tilgang', () => {
    const {
      organisasjoner: [virksomhet],
      personer: [bruker],
    } = TESTDATA.utenTilgang;

    test.beforeEach(async ({ api }) => {
      // Clear any leftover from an earlier failed run first — addConnection
      // fails if the connection is already there.
      try {
        await api.connections.deleteConnection(virksomhet.pid, virksomhet.orgNo, [bruker.pid]);
      } catch {
        /* not connected — nothing to clean */
      }
      // A plain right-holder: may represent the organisation, but is not admin.
      await api.connections.addConnection(virksomhet.pid, virksomhet.orgNo, bruker.pid);
    });

    test('bruker uten administratorrettighet får ikke se fullmaktsoversikten', async ({
      fullmaktsoversiktPage,
      login,
    }) => {
      await test.step(`Logg inn som ${bruker.pid} og velg ${virksomhet.name}`, async () => {
        await login.LoginToAccessManagement(bruker.pid);
        await login.selectActor(virksomhet.name);
        await fullmaktsoversiktPage.goToFullmakterViaUrl();
      });

      await test.step('Brukeren ser varselet om manglende tilgang', async () => {
        await expect(fullmaktsoversiktPage.noAccessAlert).toBeVisible();
      });

      await test.step('og ingen tilgangspakker kan administreres', async () => {
        await expect(fullmaktsoversiktPage.tilgangspakkerFane).toBeHidden();
        await expect(fullmaktsoversiktPage.lastNedKnapp).toBeHidden();
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
