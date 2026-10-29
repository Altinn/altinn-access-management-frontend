import { expect, medTestbrukere } from '../../../fixture/pomFixture';

const test = medTestbrukere({ actor: 'dagligLeder', requester: 'privatperson' });

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
 * Every test reserves its OWN organisation and requester from the testbruker pools,
 * because the tests create and answer requests against that organisation and the suite
 * runs fully parallel — a request left pending in one test would show up in another's list.
 *
 * `actor.pid` is the organisation's daglig leder, who can both see the page and
 * approve requests. `requester` is the person asking for access.
 *
 * A request can only be created when the organisation ALREADY has the requester
 * as a connection — the API rejects it with "No connection between party and to"
 * otherwise — so every `beforeEach` establishes that connection first.
 */

test.describe('Forespørsler', () => {
  test.describe('godkjenn forespørsel', () => {
    test.beforeEach(async ({ actor, requester, api }) => {
      await api.connections.addConnection(actor.pid, actor.orgNo, requester.pid);
      await api.requests.withdrawAllPendingRequests(requester.pid, actor.orgNo);
      await api.requests.createPackageRequest(requester.pid, actor.orgNo, posttjenester);
    });

    test('godkjenn forespørsel og slett fullmakten etterpå', async ({
      actor,
      requester,
      accessManagementFrontPage,
      forespoerslerPage,
      login,
      api,
    }) => {
      const requesterName = await api.token.getLastName(requester.pid);

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

    test.afterEach(async ({ actor, requester, api }) => {
      try {
        await api.requests.withdrawAllPendingRequests(requester.pid, actor.orgNo);
      } catch (error) {
        console.error('Cleanup: Failed to withdraw pending requests:', error);
      }
      try {
        await api.connections.deleteConnection(actor.pid, actor.orgNo, [requester.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('avvis forespørsel', () => {
    test.beforeEach(async ({ actor, requester, api }) => {
      await api.connections.addConnection(actor.pid, actor.orgNo, requester.pid);
      await api.requests.withdrawAllPendingRequests(requester.pid, actor.orgNo);
      await api.requests.createPackageRequest(requester.pid, actor.orgNo, posttjenester);
    });

    test('avvis forespørsel om tilgangspakke', async ({
      actor,
      requester,
      forespoerslerPage,
      login,
      api,
    }) => {
      const requesterName = await api.token.getLastName(requester.pid);

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

    test.afterEach(async ({ actor, requester, api }) => {
      try {
        await api.requests.withdrawAllPendingRequests(requester.pid, actor.orgNo);
      } catch (error) {
        console.error('Cleanup: Failed to withdraw pending requests:', error);
      }
      try {
        await api.connections.deleteConnection(actor.pid, actor.orgNo, [requester.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('godkjenn alle forespørsler', () => {
    test.beforeEach(async ({ actor, requester, api }) => {
      await api.connections.addConnection(actor.pid, actor.orgNo, requester.pid);
      await api.requests.withdrawAllPendingRequests(requester.pid, actor.orgNo);
      await api.requests.createPackageRequest(requester.pid, actor.orgNo, posttjenester);
      await api.requests.createPackageRequest(requester.pid, actor.orgNo, byggesoknad);
    });

    test('godkjenn alle forespørsler på én gang', async ({
      actor,
      requester,
      forespoerslerPage,
      login,
      api,
    }) => {
      const requesterName = await api.token.getLastName(requester.pid);

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

    test.afterEach(async ({ actor, requester, api }) => {
      try {
        await api.requests.withdrawAllPendingRequests(requester.pid, actor.orgNo);
      } catch (error) {
        console.error('Cleanup: Failed to withdraw pending requests:', error);
      }
      try {
        await api.connections.deleteConnection(actor.pid, actor.orgNo, [requester.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('sendt forespørsel', () => {
    test.beforeEach(async ({ actor, requester, api }) => {
      await api.connections.addConnection(actor.pid, actor.orgNo, requester.pid);
      await api.requests.withdrawAllPendingRequests(requester.pid, actor.orgNo);
      await api.requests.createPackageRequest(requester.pid, actor.orgNo, posttjenester);
    });

    test('avsender ser sin egen sendte forespørsel', async ({
      actor,
      requester,
      forespoerslerPage,
      login,
    }) => {
      await test.step(`Logg inn som avsender ${requester.pid}`, async () => {
        await login.LoginToAccessManagement(requester.pid);
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

    test.afterEach(async ({ actor, requester, api }) => {
      try {
        await api.requests.withdrawAllPendingRequests(requester.pid, actor.orgNo);
      } catch (error) {
        console.error('Cleanup: Failed to withdraw pending requests:', error);
      }
      try {
        await api.connections.deleteConnection(actor.pid, actor.orgNo, [requester.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('trekk tilbake sendt forespørsel', () => {
    test.beforeEach(async ({ actor, requester, api }) => {
      await api.connections.addConnection(actor.pid, actor.orgNo, requester.pid);
      await api.requests.withdrawAllPendingRequests(requester.pid, actor.orgNo);
      await api.requests.createPackageRequest(requester.pid, actor.orgNo, posttjenester);
    });

    test('avsender trekker tilbake sin egen forespørsel', async ({
      actor,
      requester,
      forespoerslerPage,
      login,
      api,
    }) => {
      await test.step(`Logg inn som avsender ${requester.pid}`, async () => {
        await login.LoginToAccessManagement(requester.pid);
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
        expect(await api.requests.getSentRequests(requester.pid, requester.pid)).toEqual([]);
      });
    });

    test.afterEach(async ({ actor, requester, api }) => {
      try {
        await api.requests.withdrawAllPendingRequests(requester.pid, actor.orgNo);
      } catch (error) {
        console.error('Cleanup: Failed to withdraw pending requests:', error);
      }
      try {
        await api.connections.deleteConnection(actor.pid, actor.orgNo, [requester.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });
});
