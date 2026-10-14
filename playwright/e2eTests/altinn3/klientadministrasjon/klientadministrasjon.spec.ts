import { expect, test } from '../../../fixture/pomFixture';
import { ApiError } from '../../../api-requests/apiRequest';
import { klientadminTestdata } from '../../../testdata/klientadministrasjon';

const posttjenester = 'urn:altinn:accesspackage:posttjenester';

/**
 * Trekker et tilfeldig sett fra poolen i testdata/klientadministrasjon.ts (lages med
 * `yarn tenor klientadmin`). Hver describe får sin egen bit av poolen, så describene
 * aldri deler aktør — og to samtidige kjøringer treffer sjelden samme sett.
 */
const ANTALL_DESCRIBES = 6;
function trekkTestdata(describe: number) {
  const bit = klientadminTestdata.filter((_, i) => i % ANTALL_DESCRIBES === describe);
  return bit[Math.floor(Math.random() * bit.length)];
}

test.describe('klientadministrasjon', () => {
  test.describe('legg til bruker', () => {
    const { actor, agent } = trekkTestdata(0);

    test('legg til bruker', async ({
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step(`Logg inn som ${actor.orgName} og åpne klientadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.orgName);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`legg til bruker ${agent.pid} ${agent.name}`, async () => {
        await klientAdministrasjonPage.clickLeggTilBrukerKnapp();
        await klientAdministrasjonPage.skrivFnr(agent.pid);
        await klientAdministrasjonPage.skrivEtternavn(agent.lastName);
        await klientAdministrasjonPage.klikkLeggTilPerson();
      });

      await test.step(`${agent.name} har nå blitt lagt til`, async () => {
        await expect(klientAdministrasjonPage.slettBrukerKnapp).toBeVisible();
        await expect(klientAdministrasjonPage.brukerHeading(agent.name)).toBeVisible();
      });
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('slett bruker', () => {
    const { actor, agent } = trekkTestdata(1);

    test.beforeEach(async ({ api }) => {
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch {
        /* ignore if nothing to clean */
      }
      await api.connections.addClientDelegationAgent(actor.pid, actor.org, agent.pid);
    });

    test('slett bruker', async ({
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step(`Logg inn som ${actor.orgName} og åpne klientadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.orgName);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`Gå til ${agent.pid} ${agent.name}`, async () => {
        await klientAdministrasjonPage.verifyPaaKlientadministrasjon();
        await klientAdministrasjonPage.klikkListeElement(agent.name);
        await klientAdministrasjonPage.verifyPaaBrukerDetaljer();
      });

      await test.step(`slett ${agent.name}`, async () => {
        await klientAdministrasjonPage.slettBruker();
      });

      await test.step(`${agent.name} er nå slettet`, async () => {
        await expect(klientAdministrasjonPage.ingenBrukereTekst).toBeVisible();
      });
    });

    test.afterEach(async ({ api }, testInfo) => {
      if (testInfo.status === 'passed') return;

      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('deleger klient til en bruker fra klientfanen', () => {
    const { actor, client, agent } = trekkTestdata(2);

    test.beforeEach(async ({ api }) => {
      try {
        await api.connections.deleteConnection(client.connectionPid, client.org, [actor.org]);
      } catch {
        /* ignore if nothing to clean */
      }
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch {
        /* ignore if nothing to clean */
      }

      await api.connections.addConnectionAndPackagesToUser(
        client.connectionPid,
        client.org,
        actor.org,
        [posttjenester],
      );
      await api.connections.addClientDelegationAgent(actor.pid, actor.org, agent.pid);
    });

    test('deleger klient til en bruker fra klientfanen', async ({
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step(`Logg inn som ${actor.orgName} og åpne klientadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.orgName);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`Gå til klientfanen og velg ${client.orgName}`, async () => {
        await klientAdministrasjonPage.goToKlientFane();
        await klientAdministrasjonPage.sokIKlientfanen(client.orgName);
        await klientAdministrasjonPage.klikkListeElement(client.orgName);
      });

      await test.step(`Gi ${agent.name} fullmakt til Posttjenester`, async () => {
        await klientAdministrasjonPage.klikkAlleBrukere();
        await klientAdministrasjonPage.klikkKnapp(agent.name);
        await klientAdministrasjonPage.klikkGiFullmakt('Posttjenester');
      });

      await test.step(`${agent.name} finnes nå i listen over eksisterende brukere`, async () => {
        await expect(klientAdministrasjonPage.brukerKnapp(agent.name)).toBeVisible();
      });

      await test.step('og har tilgangspakken Posttjenester', async () => {
        await expect(klientAdministrasjonPage.slettFullmaktKnapp('Posttjenester')).toBeVisible();
      });
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.connections.deleteConnection(client.connectionPid, client.org, [actor.org]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('deleger klient til en bruker fra brukerfanen', () => {
    const { actor, client, agent } = trekkTestdata(3);

    test.beforeEach(async ({ api }) => {
      try {
        await api.connections.deleteConnection(client.connectionPid, client.org, [actor.org]);
      } catch {
        /* ignore if nothing to clean */
      }
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch {
        /* ignore if nothing to clean */
      }

      await api.connections.addConnectionAndPackagesToUser(
        client.connectionPid,
        client.org,
        actor.org,
        [posttjenester],
      );
      await api.connections.addClientDelegationAgent(actor.pid, actor.org, agent.pid);
    });

    test('deleger klient til en bruker fra brukerfanen', async ({
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step(`Logg inn som ${actor.orgName} og åpne klientadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.orgName);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`velg ${agent.name}`, async () => {
        await klientAdministrasjonPage.verifyPaaKlientadministrasjon();
        await klientAdministrasjonPage.klikkListeElement(agent.name);
        await klientAdministrasjonPage.verifyPaaBrukerDetaljer();
      });

      await test.step(`Gi ${agent.name} fullmakt til Posttjenester for ${client.orgName}`, async () => {
        await klientAdministrasjonPage.klikkAlleKlienter();
        await klientAdministrasjonPage.sokEtterKlient(client.orgName);
        await klientAdministrasjonPage.klikkKnapp(client.orgName);
        await klientAdministrasjonPage.klikkGiFullmakt('Posttjenester');
      });

      await test.step(`${agent.name} finnes nå i listen over eksisterende brukere`, async () => {
        await expect(klientAdministrasjonPage.klientKnapp(client.orgName)).toBeVisible();
      });

      await test.step('og har tilgangspakken Posttjenester', async () => {
        await expect(klientAdministrasjonPage.slettFullmaktKnapp('Posttjenester')).toBeVisible();
      });
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.connections.deleteConnection(client.connectionPid, client.org, [actor.org]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('Slett fullmakt for en bruker fra brukerfanen', () => {
    const { actor, client, agent } = trekkTestdata(4);

    test.beforeEach(async ({ api }) => {
      try {
        await api.connections.deleteConnection(client.connectionPid, client.org, [actor.org]);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 404) {
          console.warn('Pre-test cleanup: Failed to delete connection:', error);
        }
      }
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 404) {
          console.warn('Pre-test cleanup: Failed to delete client delegation agent:', error);
        }
      }

      await api.connections.addConnectionAndPackagesToUser(
        client.connectionPid,
        client.org,
        actor.org,
        [posttjenester],
      );
      await api.connections.addClientDelegationAgent(actor.pid, actor.org, agent.pid);
      await api.connections.delegerKlientTilBruker(
        actor.pid,
        actor.org,
        client.org,
        agent.pid,
        posttjenester,
      );
    });

    test('Slett fullmakt for en bruker fra brukerfanen', async ({
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step(`Logg inn som ${actor.orgName} og åpne klientadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.orgName);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`Gå til klienten ${client.orgName} hos brukeren ${agent.name}`, async () => {
        await klientAdministrasjonPage.klikkBruker(agent.name);
        await klientAdministrasjonPage.klikkKnapp(client.orgName);
      });

      await test.step('Slett fullmakt for Posttjenester', async () => {
        await klientAdministrasjonPage.slettFullmakt('Posttjenester');
      });

      await test.step(`${agent.name} har ingen fullmakter lenger`, async () => {
        await expect(klientAdministrasjonPage.ingenKlienterTekst).toBeVisible();
      });
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.connections.deleteConnection(client.connectionPid, client.org, [actor.org]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('Slett fullmakt for en bruker fra klientfanen', () => {
    const { actor, client, agent } = trekkTestdata(5);

    test.beforeEach(async ({ api }) => {
      try {
        await api.connections.deleteConnection(client.connectionPid, client.org, [actor.org]);
      } catch {
        /* ignore if nothing to clean */
      }
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch {
        /* ignore if nothing to clean */
      }

      await api.connections.addConnectionAndPackagesToUser(
        client.connectionPid,
        client.org,
        actor.org,
        [posttjenester],
      );
      await api.connections.addClientDelegationAgent(actor.pid, actor.org, agent.pid);
      await api.connections.delegerKlientTilBruker(
        actor.pid,
        actor.org,
        client.org,
        agent.pid,
        posttjenester,
      );
    });

    test('Slett fullmakt for en bruker fra klientfanen', async ({
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step(`Logg inn som ${actor.orgName} og åpne klientadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.orgName);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`Gå til brukeren ${agent.name} hos klienten ${client.orgName}`, async () => {
        await klientAdministrasjonPage.verifyPaaKlientadministrasjon();
        await klientAdministrasjonPage.goToKlientFane();
        await klientAdministrasjonPage.sokIKlientfanen(client.orgName);
        await klientAdministrasjonPage.klikkListeElement(client.orgName);
        await klientAdministrasjonPage.verifyPaaKlientDetaljer();
        await klientAdministrasjonPage.klikkKnapp(agent.name);
      });

      await test.step('Slett fullmakt for Posttjenester', async () => {
        await klientAdministrasjonPage.slettFullmakt('Posttjenester');
      });

      await test.step(`${agent.name} har ingen fullmakter lenger`, async () => {
        await expect(klientAdministrasjonPage.ingenBrukereTekst).toBeVisible();
      });
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.connections.deleteConnection(client.connectionPid, client.org, [actor.org]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });
});
