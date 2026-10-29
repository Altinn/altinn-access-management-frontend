import { expect, medTestbrukere } from '../../../fixture/pomFixture';

const test = medTestbrukere({
  virksomhet: 'dagligLeder',
  mottaker: 'privatperson',
  bruker: 'privatperson',
});

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

const PAKKE = { urn: 'urn:altinn:accesspackage:posttjenester', navn: 'Posttjenester' };

test.describe('Fullmaktsoversikt', () => {
  test.describe('oversikt', () => {
    // No setup: the overview lists every access package regardless of what has
    // been delegated, and nothing here asserts on a recipient.
    test('oversikten viser tilgangspakker og nedlastingsvalg', async ({
      virksomhet,
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
    test.beforeEach(async ({ virksomhet, mottaker, api }) => {
      await api.connections.addConnectionAndPackagesToUser(
        virksomhet.pid,
        virksomhet.orgNo,
        mottaker.pid,
        [PAKKE.urn],
      );
    });

    test('pakkesiden viser hvem som har fullmakt', async ({
      virksomhet,
      mottaker,
      fullmaktsoversiktPage,
      login,
    }) => {
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

    test.afterEach(async ({ virksomhet, mottaker, api }) => {
      try {
        await api.connections.deleteConnection(virksomhet.pid, virksomhet.orgNo, [mottaker.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('gi og slett fullmakt fra pakkesiden', () => {
    test.beforeEach(async ({ virksomhet, bruker, api }) => {
      // A connection WITHOUT the package, so the user shows up on the package
      // page as someone who can be given it.
      try {
        await api.connections.deleteConnection(virksomhet.pid, virksomhet.orgNo, [bruker.pid]);
      } catch {
        /* not connected — nothing to clean */
      }
      await api.connections.addConnection(virksomhet.pid, virksomhet.orgNo, bruker.pid);
    });

    test('gi og slett fullmakt til en tilgangspakke', async ({
      virksomhet,
      bruker,
      fullmaktsoversiktPage,
      login,
    }) => {
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

    test.afterEach(async ({ virksomhet, bruker, api }) => {
      try {
        await api.connections.deleteConnection(virksomhet.pid, virksomhet.orgNo, [bruker.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('pakkens tjenester', () => {
    test('tjenestefanen viser tjenestene pakken gir tilgang til', async ({
      virksomhet,
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
    test.beforeEach(async ({ virksomhet, bruker, api }) => {
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
      virksomhet,
      bruker,
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

    test.afterEach(async ({ virksomhet, bruker, api }) => {
      try {
        await api.connections.deleteConnection(virksomhet.pid, virksomhet.orgNo, [bruker.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });
});
