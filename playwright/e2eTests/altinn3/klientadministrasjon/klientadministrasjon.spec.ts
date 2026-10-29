import { expect, medTestbrukere } from '../../../fixture/pomFixture';
import { ApiError } from '../../../api-requests/apiRequest';

const test = medTestbrukere({ actor: 'dagligLeder', agent: 'privatperson', client: 'dagligLeder' });

const posttjenester = 'urn:altinn:accesspackage:posttjenester';

test.describe('klientadministrasjon', () => {
  test.describe('legg til bruker', () => {
    test('legg til bruker', async ({
      actor,
      agent,
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step(`Logg inn som ${actor.name} og åpne klientadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.name);
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

    test.afterEach(async ({ actor, agent, api }) => {
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.orgNo, agent.pid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('slett bruker', () => {
    test.beforeEach(async ({ actor, agent, api }) => {
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.orgNo, agent.pid);
      } catch {
        /* ignore if nothing to clean */
      }
      await api.connections.addClientDelegationAgent(actor.pid, actor.orgNo, agent.pid);
    });

    test('slett bruker', async ({
      actor,
      agent,
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step(`Logg inn som ${actor.name} og åpne klientadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.name);
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

    test.afterEach(async ({ actor, agent, api }, testInfo) => {
      if (testInfo.status === 'passed') return;

      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.orgNo, agent.pid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('deleger klient til en bruker fra klientfanen', () => {
    test.beforeEach(async ({ actor, agent, client, api }) => {
      try {
        await api.connections.deleteConnection(client.pid, client.orgNo, [actor.orgNo]);
      } catch {
        /* ignore if nothing to clean */
      }
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.orgNo, agent.pid);
      } catch {
        /* ignore if nothing to clean */
      }

      await api.connections.addConnectionAndPackagesToUser(client.pid, client.orgNo, actor.orgNo, [
        posttjenester,
      ]);
      await api.connections.addClientDelegationAgent(actor.pid, actor.orgNo, agent.pid);
    });

    test('deleger klient til en bruker fra klientfanen', async ({
      actor,
      agent,
      client,
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step(`Logg inn som ${actor.name} og åpne klientadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.name);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`Gå til klientfanen og velg ${client.name}`, async () => {
        await klientAdministrasjonPage.goToKlientFane();
        await klientAdministrasjonPage.klikkListeElement(client.name);
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

    test.afterEach(async ({ actor, agent, client, api }) => {
      try {
        await api.connections.deleteConnection(client.pid, client.orgNo, [actor.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.orgNo, agent.pid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('deleger klient til en bruker fra brukerfanen', () => {
    test.beforeEach(async ({ actor, agent, client, api }) => {
      try {
        await api.connections.deleteConnection(client.pid, client.orgNo, [actor.orgNo]);
      } catch {
        /* ignore if nothing to clean */
      }
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.orgNo, agent.pid);
      } catch {
        /* ignore if nothing to clean */
      }

      await api.connections.addConnectionAndPackagesToUser(client.pid, client.orgNo, actor.orgNo, [
        posttjenester,
      ]);
      await api.connections.addClientDelegationAgent(actor.pid, actor.orgNo, agent.pid);
    });

    test('deleger klient til en bruker fra brukerfanen', async ({
      actor,
      agent,
      client,
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step(`Logg inn som ${actor.name} og åpne klientadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.name);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`velg ${agent.name}`, async () => {
        await klientAdministrasjonPage.verifyPaaKlientadministrasjon();
        await klientAdministrasjonPage.klikkListeElement(agent.name);
        await klientAdministrasjonPage.verifyPaaBrukerDetaljer();
      });

      await test.step(`Gi ${agent.name} fullmakt til Posttjenester for ${client.name}`, async () => {
        await klientAdministrasjonPage.klikkAlleKlienter();
        await klientAdministrasjonPage.klikkKnapp(client.name);
        await klientAdministrasjonPage.klikkGiFullmakt('Posttjenester');
      });

      await test.step(`${agent.name} finnes nå i listen over eksisterende brukere`, async () => {
        await expect(klientAdministrasjonPage.klientKnapp(client.name)).toBeVisible();
      });

      await test.step('og har tilgangspakken Posttjenester', async () => {
        await expect(klientAdministrasjonPage.slettFullmaktKnapp('Posttjenester')).toBeVisible();
      });
    });

    test.afterEach(async ({ actor, agent, client, api }) => {
      try {
        await api.connections.deleteConnection(client.pid, client.orgNo, [actor.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.orgNo, agent.pid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('Slett fullmakt for en bruker fra brukerfanen', () => {
    test.beforeEach(async ({ actor, agent, client, api }) => {
      try {
        await api.connections.deleteConnection(client.pid, client.orgNo, [actor.orgNo]);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 404) {
          console.warn('Pre-test cleanup: Failed to delete connection:', error);
        }
      }
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.orgNo, agent.pid);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 404) {
          console.warn('Pre-test cleanup: Failed to delete client delegation agent:', error);
        }
      }

      await api.connections.addConnectionAndPackagesToUser(client.pid, client.orgNo, actor.orgNo, [
        posttjenester,
      ]);
      await api.connections.addClientDelegationAgent(actor.pid, actor.orgNo, agent.pid);
      await api.connections.delegerKlientTilBruker(
        actor.pid,
        actor.orgNo,
        client.orgNo,
        agent.pid,
        posttjenester,
      );
    });

    test('Slett fullmakt for en bruker fra brukerfanen', async ({
      actor,
      agent,
      client,
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step(`Logg inn som ${actor.name} og åpne klientadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.name);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`Gå til klienten ${client.name} hos brukeren ${agent.name}`, async () => {
        await klientAdministrasjonPage.klikkBruker(agent.name);
        await klientAdministrasjonPage.klikkKnapp(client.name);
      });

      await test.step('Slett fullmakt for Posttjenester', async () => {
        await klientAdministrasjonPage.slettFullmakt('Posttjenester');
      });

      await test.step(`${agent.name} har ingen fullmakter lenger`, async () => {
        await expect(klientAdministrasjonPage.ingenKlienterTekst).toBeVisible();
      });
    });

    test.afterEach(async ({ actor, agent, client, api }) => {
      try {
        await api.connections.deleteConnection(client.pid, client.orgNo, [actor.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.orgNo, agent.pid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('Slett fullmakt for en bruker fra klientfanen', () => {
    // Refreshed from Tenor: the previous actor represented nine organisations,
    // which is where the aktørvelger starts paging its list. `client` must be a
    // real ER client of `actor` — an arbitrary connection between two unrelated
    // organisations does not show up under the Klienter tab.

    test.beforeEach(async ({ actor, agent, client, api }) => {
      try {
        await api.connections.deleteConnection(client.pid, client.orgNo, [actor.orgNo]);
      } catch {
        /* ignore if nothing to clean */
      }
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.orgNo, agent.pid);
      } catch {
        /* ignore if nothing to clean */
      }

      await api.connections.addConnectionAndPackagesToUser(client.pid, client.orgNo, actor.orgNo, [
        posttjenester,
      ]);
      await api.connections.addClientDelegationAgent(actor.pid, actor.orgNo, agent.pid);
      await api.connections.delegerKlientTilBruker(
        actor.pid,
        actor.orgNo,
        client.orgNo,
        agent.pid,
        posttjenester,
      );
    });

    test('Slett fullmakt for en bruker fra klientfanen', async ({
      actor,
      agent,
      client,
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step(`Logg inn som ${actor.name} og åpne klientadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await aktorvalgHeader.selectActorFromHeaderMenu(actor.name);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`Gå til brukeren ${agent.name} hos klienten ${client.name}`, async () => {
        await klientAdministrasjonPage.verifyPaaKlientadministrasjon();
        await klientAdministrasjonPage.goToKlientFane();
        await klientAdministrasjonPage.klikkListeElement(client.name);
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

    test.afterEach(async ({ actor, agent, client, api }) => {
      try {
        await api.connections.deleteConnection(client.pid, client.orgNo, [actor.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
      try {
        await api.connections.deleteClientDelegationAgent(actor.pid, actor.orgNo, agent.pid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });
});
