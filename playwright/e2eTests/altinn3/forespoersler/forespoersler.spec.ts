import { expect, test } from '../../../fixture/pomFixture';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';
import { RequestApiRequests } from '../../../api-requests/RequestApiRequests';
import { Token } from '../../../api-requests/Token';

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
const ACTORS = {
  godkjenn: {
    actor: { pid: '28897598797', org: '314242602', orgName: 'SOFISTIKERT KOMPLETT TIGER AS' },
    requester: '14818398574',
  },
  avvis: {
    actor: { pid: '08827999653', org: '314243048', orgName: 'FANTASILØS FIRKANTET TIGER AS' },
    requester: '14892149020',
  },
  godkjennAlle: {
    actor: { pid: '12835498199', org: '312681528', orgName: 'HELLIG SPISS PUMA' },
    requester: '23887998442',
  },
  sendt: {
    actor: { pid: '22877497392', org: '314239458', orgName: 'BEVISST KNUSLETE TIGER AS' },
    requester: '26884895145',
  },
  trekkTilbake: {
    actor: { pid: '16926997746', org: '312203189', orgName: 'UNG ANSTENDIG PUMA' },
    requester: '04849196710',
  },
};

test.describe('Forespørsler', () => {
  const requests = new RequestApiRequests();
  const connections = new EnduserConnection();
  const token = new Token();

  test.describe('godkjenn forespørsel', () => {
    const { actor, requester } = ACTORS.godkjenn;

    test.beforeEach(async () => {
      await connections.addConnection(actor.pid, actor.org, requester);
      await requests.withdrawAllPendingRequests(requester, actor.org);
      await requests.createPackageRequest(requester, actor.org, posttjenester);
    });

    test('godkjenn forespørsel og slett fullmakten etterpå', async ({
      accessManagementFrontPage,
      forespoerslerPage,
      login,
    }) => {
      const requesterName = await token.getLastName(requester);

      await test.step(`Logg inn som ${actor.orgName} og åpne forespørsler`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectMainUnitBySearching(actor.orgName);
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

    test.afterEach(async () => {
      try {
        await requests.withdrawAllPendingRequests(requester, actor.org);
      } catch (error) {
        console.error('Cleanup: Failed to withdraw pending requests:', error);
      }
      try {
        await connections.deleteConnection(actor.pid, actor.org, [requester]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('avvis forespørsel', () => {
    const { actor, requester } = ACTORS.avvis;

    test.beforeEach(async () => {
      await connections.addConnection(actor.pid, actor.org, requester);
      await requests.withdrawAllPendingRequests(requester, actor.org);
      await requests.createPackageRequest(requester, actor.org, posttjenester);
    });

    test('avvis forespørsel om tilgangspakke', async ({ forespoerslerPage, login }) => {
      const requesterName = await token.getLastName(requester);

      await test.step(`Logg inn som ${actor.orgName} og åpne forespørsler`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectMainUnitBySearching(actor.orgName);
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

    test.afterEach(async () => {
      try {
        await requests.withdrawAllPendingRequests(requester, actor.org);
      } catch (error) {
        console.error('Cleanup: Failed to withdraw pending requests:', error);
      }
      try {
        await connections.deleteConnection(actor.pid, actor.org, [requester]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('godkjenn alle forespørsler', () => {
    const { actor, requester } = ACTORS.godkjennAlle;

    test.beforeEach(async () => {
      await connections.addConnection(actor.pid, actor.org, requester);
      await requests.withdrawAllPendingRequests(requester, actor.org);
      await requests.createPackageRequest(requester, actor.org, posttjenester);
      await requests.createPackageRequest(requester, actor.org, byggesoknad);
    });

    test('godkjenn alle forespørsler på én gang', async ({ forespoerslerPage, login }) => {
      const requesterName = await token.getLastName(requester);

      await test.step(`Logg inn som ${actor.orgName} og åpne forespørsler`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectMainUnitBySearching(actor.orgName);
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

    test.afterEach(async () => {
      try {
        await requests.withdrawAllPendingRequests(requester, actor.org);
      } catch (error) {
        console.error('Cleanup: Failed to withdraw pending requests:', error);
      }
      try {
        await connections.deleteConnection(actor.pid, actor.org, [requester]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('sendt forespørsel', () => {
    const { actor, requester } = ACTORS.sendt;

    test.beforeEach(async () => {
      await connections.addConnection(actor.pid, actor.org, requester);
      await requests.withdrawAllPendingRequests(requester, actor.org);
      await requests.createPackageRequest(requester, actor.org, posttjenester);
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
        await expect(forespoerslerPage.forespoerselRad(actor.orgName)).toBeVisible();
      });
    });

    test.afterEach(async () => {
      try {
        await requests.withdrawAllPendingRequests(requester, actor.org);
      } catch (error) {
        console.error('Cleanup: Failed to withdraw pending requests:', error);
      }
      try {
        await connections.deleteConnection(actor.pid, actor.org, [requester]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });

  test.describe('trekk tilbake sendt forespørsel', () => {
    const { actor, requester } = ACTORS.trekkTilbake;

    test.beforeEach(async () => {
      await connections.addConnection(actor.pid, actor.org, requester);
      await requests.withdrawAllPendingRequests(requester, actor.org);
      await requests.createPackageRequest(requester, actor.org, posttjenester);
    });

    test('avsender trekker tilbake sin egen forespørsel', async ({ forespoerslerPage, login }) => {
      await test.step(`Logg inn som avsender ${requester}`, async () => {
        await login.LoginToAccessManagement(requester);
        await forespoerslerPage.goToForespoerslerViaUrl();
        await expect(
          forespoerslerPage.pageHeading.or(forespoerslerPage.ownRequestsHeading),
        ).toBeVisible();
      });

      await test.step(`Åpne den sendte forespørselen til ${actor.orgName}`, async () => {
        await forespoerslerPage.goToSendteFane();
        await forespoerslerPage.aapneForespoersel(actor.orgName);
        await expect(forespoerslerPage.sendtDialogOverskrift()).toBeVisible();
      });

      await test.step('Slett forespørselen om Posttjenester', async () => {
        await expect(forespoerslerPage.slettForespoerselKnapp(posttjenesterNavn)).toBeVisible();
        await forespoerslerPage.trekkTilbakeForespoersel(posttjenesterNavn);
      });

      await test.step('Forespørselen er trukket tilbake', async () => {
        await expect(forespoerslerPage.slettForespoerselKnapp(posttjenesterNavn)).toBeHidden();
        // And it is gone server-side, not just from the open dialog.
        expect(await requests.getSentRequests(requester, requester)).toEqual([]);
      });
    });

    test.afterEach(async () => {
      try {
        await requests.withdrawAllPendingRequests(requester, actor.org);
      } catch (error) {
        console.error('Cleanup: Failed to withdraw pending requests:', error);
      }
      try {
        await connections.deleteConnection(actor.pid, actor.org, [requester]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });
  });
});
