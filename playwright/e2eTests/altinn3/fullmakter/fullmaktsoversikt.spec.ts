import { expect, test } from '../../../fixture/pomFixture';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';

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
const ACTORS = {
  oversikt: {
    virksomhet: { pid: '06876299923', org: '314241363', orgName: 'UNGT LAV TIGER AS' },
  },
  pakkensBrukere: {
    virksomhet: { pid: '25887399541', org: '214242192', orgName: 'FREDFULL SUNN TIGER AS' },
    mottaker: { pid: '27862749125', navn: 'Trofast Kråkebolle' },
  },
  giOgSlett: {
    virksomhet: {
      pid: '25877799797',
      org: '310990361',
      orgName: 'AKTPÅGIVENDE ORDENTLIG TIGER AS',
    },
    bruker: { pid: '05880549792', navn: 'Grå Jantelov' },
  },
  tjenester: {
    virksomhet: {
      pid: '17845498598',
      org: '214251892',
      orgName: 'JORDNÆR FORMBAR KATT GUVERNANTE',
    },
  },
  utenTilgang: {
    virksomhet: { pid: '19817296923', org: '212204242', orgName: 'ALLSIDIG ENTUSIASTISK TIGER AS' },
    bruker: { pid: '04817099306' },
  },
};

const PAKKE = { urn: 'urn:altinn:accesspackage:posttjenester', navn: 'Posttjenester' };

test.describe('Fullmaktsoversikt', () => {
  const connections = new EnduserConnection();

  test.describe('oversikt', () => {
    const { virksomhet } = ACTORS.oversikt;

    // No setup: the overview lists every access package regardless of what has
    // been delegated, and nothing here asserts on a recipient.
    test('oversikten viser tilgangspakker og nedlastingsvalg', async ({
      fullmaktsoversiktPage,
      login,
    }) => {
      await test.step(`Logg inn som ${virksomhet.orgName} og åpne fullmaktsoversikten`, async () => {
        await login.LoginToAccessManagement(virksomhet.pid);
        await login.selectActor(virksomhet.orgName);
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
    const { virksomhet, mottaker } = ACTORS.pakkensBrukere;

    test.beforeEach(async () => {
      await connections.addConnectionAndPackagesToUser(
        virksomhet.pid,
        virksomhet.org,
        mottaker.pid,
        [PAKKE.urn],
      );
    });

    test('pakkesiden viser hvem som har fullmakt', async ({ fullmaktsoversiktPage, login }) => {
      await test.step(`Logg inn som ${virksomhet.orgName} og åpne ${PAKKE.navn}`, async () => {
        await login.LoginToAccessManagement(virksomhet.pid);
        await login.selectActor(virksomhet.orgName);
        await fullmaktsoversiktPage.goToFullmakter();
        await fullmaktsoversiktPage.aapneTilgangspakke(PAKKE.navn);
      });

      await test.step(`${mottaker.navn} står oppført med fullmakt`, async () => {
        // The tab lists only a handful of users up front, so find the user the
        // way the tab intends — by searching. Which users appear unprompted
        // depends on how many the organisation has, so relying on that is flaky.
        await fullmaktsoversiktPage.sokEtterBruker(mottaker.navn);
        await expect(fullmaktsoversiktPage.brukerRad(mottaker.navn)).toBeVisible();
        await expect(fullmaktsoversiktPage.slettFullmaktKnapp(mottaker.navn)).toBeVisible();
      });
    });

    test.afterEach(async () => {
      try {
        await connections.deleteConnection(virksomhet.pid, virksomhet.org, [mottaker.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('gi og slett fullmakt fra pakkesiden', () => {
    const { virksomhet, bruker } = ACTORS.giOgSlett;

    test.beforeEach(async () => {
      // A connection WITHOUT the package, so the user shows up on the package
      // page as someone who can be given it.
      try {
        await connections.deleteConnection(virksomhet.pid, virksomhet.org, [bruker.pid]);
      } catch {
        /* not connected — nothing to clean */
      }
      await connections.addConnection(virksomhet.pid, virksomhet.org, bruker.pid);
    });

    test('gi og slett fullmakt til en tilgangspakke', async ({ fullmaktsoversiktPage, login }) => {
      await test.step(`Logg inn som ${virksomhet.orgName} og åpne ${PAKKE.navn}`, async () => {
        await login.LoginToAccessManagement(virksomhet.pid);
        await login.selectActor(virksomhet.orgName);
        await fullmaktsoversiktPage.goToFullmakter();
        await fullmaktsoversiktPage.aapneTilgangspakke(PAKKE.navn);
      });

      await test.step(`Gi ${bruker.navn} fullmakt til ${PAKKE.navn}`, async () => {
        await fullmaktsoversiktPage.sokEtterBruker(bruker.navn);
        await expect(fullmaktsoversiktPage.giFullmaktKnapp(bruker.navn)).toBeVisible();
        await fullmaktsoversiktPage.giFullmakt(bruker.navn);
      });

      await test.step(`${bruker.navn} har nå fullmakt`, async () => {
        await expect(fullmaktsoversiktPage.slettFullmaktKnapp(bruker.navn)).toBeVisible();
      });

      await test.step('Slett fullmakten igjen', async () => {
        await fullmaktsoversiktPage.slettFullmakt(bruker.navn);
      });

      await test.step(`${bruker.navn} kan igjen få fullmakt`, async () => {
        await expect(fullmaktsoversiktPage.giFullmaktKnapp(bruker.navn)).toBeVisible();
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

  test.describe('pakkens tjenester', () => {
    const { virksomhet } = ACTORS.tjenester;

    test('tjenestefanen viser tjenestene pakken gir tilgang til', async ({
      fullmaktsoversiktPage,
      login,
    }) => {
      await test.step(`Logg inn som ${virksomhet.orgName} og åpne ${PAKKE.navn}`, async () => {
        await login.LoginToAccessManagement(virksomhet.pid);
        await login.selectActor(virksomhet.orgName);
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
    const { virksomhet, bruker } = ACTORS.utenTilgang;

    test.beforeEach(async () => {
      // Clear any leftover from an earlier failed run first — addConnection
      // fails if the connection is already there.
      try {
        await connections.deleteConnection(virksomhet.pid, virksomhet.org, [bruker.pid]);
      } catch {
        /* not connected — nothing to clean */
      }
      // A plain right-holder: may represent the organisation, but is not admin.
      await connections.addConnection(virksomhet.pid, virksomhet.org, bruker.pid);
    });

    test('bruker uten administratorrettighet får ikke se fullmaktsoversikten', async ({
      fullmaktsoversiktPage,
      login,
    }) => {
      await test.step(`Logg inn som ${bruker.pid} og velg ${virksomhet.orgName}`, async () => {
        await login.LoginToAccessManagement(bruker.pid);
        await login.selectActor(virksomhet.orgName);
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

    test.afterEach(async () => {
      try {
        await connections.deleteConnection(virksomhet.pid, virksomhet.org, [bruker.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });
});
