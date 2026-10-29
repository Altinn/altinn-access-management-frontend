import { expect, test } from '../../../fixture/pomFixture';
import { loadTestdata } from '../../../util/testdata';

const posttjenester = 'urn:altinn:accesspackage:posttjenester';
const posttjenesterNavn = 'Posttjenester';
// Access packages are grouped by område on a user's detail page, and the område
// has to be expanded before the package's buttons exist. Same value the
// tilgangspakkedelegering spec uses for this package.
const posttjenesterOmraade = 'Andre tjenesteytende næringer';
const byggesoknad = 'urn:altinn:accesspackage:byggesoknad';

/**
 * Forespørsler — mottatte og sendte forespørsler om fullmakt.
 *
 * Each describe block has its OWN organisation and requester, because the tests
 * create and answer requests against that organisation and the suite runs fully
 * parallel — a request left pending in one block would show up in another's list.
 *
 * `actor.pid` is the organisation's daglig leder, who can both see the page and
 * approve requests. `requester` is the person asking for access.
 *
 * A request can only be created when the organisation ALREADY has the requester
 * as a connection — the API rejects it with "No connection between party and to"
 * otherwise — so every `beforeEach` establishes that connection first.
 *
 * To source replacements: `yarn tenor:virksomhet --env <env>` for an
 * organisation with its daglig leder, `yarn tenor --env <env> -n 1` for a person.
 */
const TESTDATA = loadTestdata('forespoersler');

test.describe('Forespørsler', () => {
  test.describe('godkjenn forespørsel', () => {
    const {
      organisasjoner: [actor],
      personer: [{ pid: requester }],
    } = TESTDATA.godkjenn;

    test.beforeEach(async ({ api }) => {
      await api.connections.addConnection(actor.pid, actor.orgNo, requester);
      await api.requests.withdrawAllPendingRequests(requester, actor.orgNo);
      await api.requests.createPackageRequest(requester, actor.orgNo, posttjenester);
    });

    test('godkjenn forespørsel og slett fullmakten etterpå', async ({
      accessManagementFrontPage,
      forespoerslerPage,
      login,
      api,
    }) => {
      const requesterName = await api.token.getLastName(requester);

      await test.step(`Logg inn som ${actor.name} og åpne forespørsler`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectActor(actor.name);
        await forespoerslerPage.goToForespoersler();
      });

      await test.step('Åpne forespørselen og velg tilgangspakken', async () => {
        await forespoerslerPage.aapneForespoersel(requesterName);
        await forespoerslerPage.aapnePakke(posttjenesterNavn);
      });

      await test.step('Godkjenn forespørselen', async () => {
        await forespoerslerPage.godkjenn();
      });

      await test.step('Forespørselen er nå godkjent', async () => {
        await expect(forespoerslerPage.godkjentStatus).toBeVisible();
      });

      // The dialog saying "Godkjent" only proves the request was answered. This
      // is what proves the approval actually granted the access.
      await test.step(`${requesterName} har nå fullmakt til Posttjenester`, async () => {
        await forespoerslerPage.lukkDialog();
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(requesterName);
        await accessManagementFrontPage.goToArea(posttjenesterOmraade);
        await accessManagementFrontPage.userCanDeletePackage(posttjenesterNavn);
      });

      await test.step('Fullmakten kan slettes igjen', async () => {
        await accessManagementFrontPage.clickSlettFullmaktForTilgangspakke(posttjenesterNavn);
        await expect(accessManagementFrontPage.slettFullmaktKnapp(posttjenesterNavn)).toBeHidden();
      });
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.requests.withdrawAllPendingRequests(requester, actor.orgNo);
      } catch (error) {
        console.error('Cleanup: Failed to withdraw pending requests:', error);
      }
      try {
        await api.connections.deleteConnection(actor.pid, actor.orgNo, [requester]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('avvis forespørsel', () => {
    const {
      organisasjoner: [actor],
      personer: [{ pid: requester }],
    } = TESTDATA.avvis;

    test.beforeEach(async ({ api }) => {
      await api.connections.addConnection(actor.pid, actor.orgNo, requester);
      await api.requests.withdrawAllPendingRequests(requester, actor.orgNo);
      await api.requests.createPackageRequest(requester, actor.orgNo, posttjenester);
    });

    test('avvis forespørsel om tilgangspakke', async ({ forespoerslerPage, login, api }) => {
      const requesterName = await api.token.getLastName(requester);

      await test.step(`Logg inn som ${actor.name} og åpne forespørsler`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectActor(actor.name);
        await forespoerslerPage.goToForespoersler();
      });

      await test.step('Åpne forespørselen og velg tilgangspakken', async () => {
        await forespoerslerPage.aapneForespoersel(requesterName);
        await forespoerslerPage.aapnePakke(posttjenesterNavn);
      });

      await test.step('Avvis forespørselen', async () => {
        await forespoerslerPage.avvis();
      });

      await test.step('Forespørselen er nå avvist', async () => {
        await expect(forespoerslerPage.avvistStatus).toBeVisible();
      });
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.requests.withdrawAllPendingRequests(requester, actor.orgNo);
      } catch (error) {
        console.error('Cleanup: Failed to withdraw pending requests:', error);
      }
      try {
        await api.connections.deleteConnection(actor.pid, actor.orgNo, [requester]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('godkjenn alle forespørsler', () => {
    const {
      organisasjoner: [actor],
      personer: [{ pid: requester }],
    } = TESTDATA.godkjennAlle;

    test.beforeEach(async ({ api }) => {
      await api.connections.addConnection(actor.pid, actor.orgNo, requester);
      await api.requests.withdrawAllPendingRequests(requester, actor.orgNo);
      await api.requests.createPackageRequest(requester, actor.orgNo, posttjenester);
      await api.requests.createPackageRequest(requester, actor.orgNo, byggesoknad);
    });

    test('godkjenn alle forespørsler på én gang', async ({ forespoerslerPage, login, api }) => {
      const requesterName = await api.token.getLastName(requester);

      await test.step(`Logg inn som ${actor.name} og åpne forespørsler`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectActor(actor.name);
        await forespoerslerPage.goToForespoersler();
      });

      await test.step('Åpne forespørselen med to tilgangspakker', async () => {
        await forespoerslerPage.aapneForespoersel(requesterName);
        await expect(forespoerslerPage.pakkeRad(posttjenesterNavn)).toBeVisible();
      });

      await test.step('Godkjenn alle', async () => {
        await forespoerslerPage.godkjennAlle();
      });

      await test.step('Begge forespørslene er godkjent', async () => {
        await expect(forespoerslerPage.godkjentStatus).toHaveCount(2);
      });
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.requests.withdrawAllPendingRequests(requester, actor.orgNo);
      } catch (error) {
        console.error('Cleanup: Failed to withdraw pending requests:', error);
      }
      try {
        await api.connections.deleteConnection(actor.pid, actor.orgNo, [requester]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('sendt forespørsel', () => {
    const {
      organisasjoner: [actor],
      personer: [{ pid: requester }],
    } = TESTDATA.sendt;

    test.beforeEach(async ({ api }) => {
      await api.connections.addConnection(actor.pid, actor.orgNo, requester);
      await api.requests.withdrawAllPendingRequests(requester, actor.orgNo);
      await api.requests.createPackageRequest(requester, actor.orgNo, posttjenester);
    });

    test('avsender ser sin egen sendte forespørsel', async ({ forespoerslerPage, login }) => {
      await test.step(`Logg inn som avsender ${requester}`, async () => {
        await login.LoginToAccessManagement(requester);
        await forespoerslerPage.goToForespoerslerViaUrl();
        await expect(
          forespoerslerPage.pageHeading.or(forespoerslerPage.ownRequestsHeading),
        ).toBeVisible();
      });

      await test.step('Den sendte forespørselen ligger under Sendte', async () => {
        await forespoerslerPage.goToSendteFane();
        await expect(forespoerslerPage.forespoerselRad(actor.name)).toBeVisible();
      });
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.requests.withdrawAllPendingRequests(requester, actor.orgNo);
      } catch (error) {
        console.error('Cleanup: Failed to withdraw pending requests:', error);
      }
      try {
        await api.connections.deleteConnection(actor.pid, actor.orgNo, [requester]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('trekk tilbake sendt forespørsel', () => {
    const {
      organisasjoner: [actor],
      personer: [{ pid: requester }],
    } = TESTDATA.trekkTilbake;

    test.beforeEach(async ({ api }) => {
      await api.connections.addConnection(actor.pid, actor.orgNo, requester);
      await api.requests.withdrawAllPendingRequests(requester, actor.orgNo);
      await api.requests.createPackageRequest(requester, actor.orgNo, posttjenester);
    });

    test('avsender trekker tilbake sin egen forespørsel', async ({
      forespoerslerPage,
      login,
      api,
    }) => {
      await test.step(`Logg inn som avsender ${requester}`, async () => {
        await login.LoginToAccessManagement(requester);
        await forespoerslerPage.goToForespoerslerViaUrl();
        await expect(
          forespoerslerPage.pageHeading.or(forespoerslerPage.ownRequestsHeading),
        ).toBeVisible();
      });

      await test.step(`Åpne den sendte forespørselen til ${actor.name}`, async () => {
        await forespoerslerPage.goToSendteFane();
        await forespoerslerPage.aapneForespoersel(actor.name);
        await expect(forespoerslerPage.sendtDialogOverskrift()).toBeVisible();
      });

      await test.step('Slett forespørselen om Posttjenester', async () => {
        await expect(forespoerslerPage.slettForespoerselKnapp(posttjenesterNavn)).toBeVisible();
        await forespoerslerPage.trekkTilbakeForespoersel(posttjenesterNavn);
      });

      await test.step('Forespørselen er trukket tilbake', async () => {
        await expect(forespoerslerPage.slettForespoerselKnapp(posttjenesterNavn)).toBeHidden();
        // And it is gone server-side, not just from the open dialog.
        expect(await api.requests.getSentRequests(requester, requester)).toEqual([]);
      });
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.requests.withdrawAllPendingRequests(requester, actor.orgNo);
      } catch (error) {
        console.error('Cleanup: Failed to withdraw pending requests:', error);
      }
      try {
        await api.connections.deleteConnection(actor.pid, actor.orgNo, [requester]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });
});
