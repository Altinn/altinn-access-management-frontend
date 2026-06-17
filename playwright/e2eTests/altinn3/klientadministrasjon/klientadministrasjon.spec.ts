import { expect, test } from '../../../fixture/pomFixture';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';

const posttjenester = 'urn:altinn:accesspackage:posttjenester';

test.describe('klientadministrasjon', () => {
  const api = new EnduserConnection();

  test.describe('legg til bruker', () => {
    const actor = { pid: '09866598352', org: '213779702', orgName: 'UVANLIG FILOSOFISK TIGER AS' };
    const agent = { pid: '29814895546', name: 'MUNTER SKO', lastName: 'Sko' };

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
        await expect(klientAdministrasjonPage.brukerKnapp(agent.name)).toBeVisible();
      });
    });

    test.afterEach(async () => {
      try {
        await api.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('slett bruker', () => {
    const actor = { pid: '16830197862', org: '311164651', orgName: 'KLARTENKT UPRESIS ISBJØRN SA' };
    const agent = { pid: '30877795760', name: 'TROVERDIG JUICE' };

    test.beforeEach(async () => {
      try {
        await api.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch {
        /* ignore if nothing to clean */
      }
      await api.addClientDelegationAgent(actor.pid, actor.org, agent.pid);
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
        await klientAdministrasjonPage.klikkListeElement(agent.name);
      });

      await test.step(`slett ${agent.name}`, async () => {
        await klientAdministrasjonPage.slettBruker();
      });

      await test.step(`${agent.name} er nå slettet`, async () => {
        await expect(klientAdministrasjonPage.ingenBrukereTekst).toBeVisible();
      });
    });

    test.afterEach(async ({}, testInfo) => {
      if (testInfo.status === 'passed') return;

      try {
        await api.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('deleger klient til en bruker fra klientfanen', () => {
    const actor = { pid: '15846199893', org: '310002224', orgName: 'TRÅDLØS FORNUFTIG KATT LYTE' };
    const client = {
      connectionPid: '28868199808',
      org: '314087917',
      orgName: 'PARISK AKADEMISK KATT SITRON',
    };
    const agent = { pid: '28822449737', name: 'SINDIG BRUD' };

    test.beforeEach(async () => {
      try {
        await api.deleteConnection(client.connectionPid, client.org, [actor.org]);
      } catch {
        /* ignore if nothing to clean */
      }
      try {
        await api.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch {
        /* ignore if nothing to clean */
      }

      await api.addConnectionAndPackagesToUser(client.connectionPid, client.org, actor.org, [
        posttjenester,
      ]);
      await api.addClientDelegationAgent(actor.pid, actor.org, agent.pid);
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
        await klientAdministrasjonPage.klikkListeElement(client.orgName);
      });

      await test.step(`Gi ${agent.name} fullmakt til Posttjenester`, async () => {
        await klientAdministrasjonPage.klikkAlleBrukere();
        await klientAdministrasjonPage.klikkKnapp(agent.name);
        await klientAdministrasjonPage.klikkGiFullmakt('Posttjenester');
      });

      await test.step(`${agent.name} finnes nå i listen over eksisterende brukere`, async () => {
        await klientAdministrasjonPage.klikkBrukereMedFullmakt();
        await expect(klientAdministrasjonPage.brukerKnapp(agent.name)).toBeVisible();
      });

      await test.step('og har tilgangspakken Posttjenester', async () => {
        await klientAdministrasjonPage.klikkKnapp(agent.name);
        await expect(klientAdministrasjonPage.slettFullmaktKnapp('Posttjenester')).toBeVisible();
      });
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(client.connectionPid, client.org, [actor.org]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
      try {
        await api.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('deleger klient til en bruker fra brukerfanen', () => {
    const actor = {
      pid: '16852749125',
      org: '313662624',
      orgName: 'INTERESSERT KONVENSJONELL TIGER AS',
    };
    const client = {
      connectionPid: '23907296857',
      org: '313238105',
      orgName: 'BESTEMT SLAKK TIGER AS',
    };
    const agent = { pid: '47822800420', name: 'UVANLIG FREDAG' };

    test.beforeEach(async () => {
      try {
        await api.deleteConnection(client.connectionPid, client.org, [actor.org]);
      } catch {
        /* ignore if nothing to clean */
      }
      try {
        await api.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch {
        /* ignore if nothing to clean */
      }

      await api.addConnectionAndPackagesToUser(client.connectionPid, client.org, actor.org, [
        posttjenester,
      ]);
      await api.addClientDelegationAgent(actor.pid, actor.org, agent.pid);
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
        await klientAdministrasjonPage.klikkListeElement(agent.name);
      });

      await test.step(`Gi ${agent.name} fullmakt til Posttjenester for ${client.orgName}`, async () => {
        await klientAdministrasjonPage.klikkAlleKlienter();
        await klientAdministrasjonPage.klikkKnapp(client.orgName);
        await klientAdministrasjonPage.klikkGiFullmakt('Posttjenester');
      });

      await test.step(`${agent.name} finnes nå i listen over eksisterende brukere`, async () => {
        await klientAdministrasjonPage.klikkHarDisseKlientene();
        await expect(klientAdministrasjonPage.klientKnapp(client.orgName)).toBeVisible();
      });

      await test.step('og har tilgangspakken Posttjenester', async () => {
        await klientAdministrasjonPage.klikkKnapp(client.orgName);
        await expect(klientAdministrasjonPage.slettFullmaktKnapp('Posttjenester')).toBeVisible();
      });
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(client.connectionPid, client.org, [actor.org]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
      try {
        await api.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('Slett fullmakt for en bruker fra brukerfanen', () => {
    const actor = { pid: '08873349590', org: '312772655', orgName: 'RØRETE RAKRYGGET TIGER AS' };
    const client = {
      connectionPid: '12886999389',
      org: '313428435',
      orgName: 'ROSA UNDERDANIG TIGER AS',
    };
    const agent = { pid: '04905999376', name: 'FORSTÅELSESFULL TRAFIKKORK' };

    test.beforeEach(async () => {
      await api.addConnectionAndPackagesToUser(client.connectionPid, client.org, actor.org, [
        posttjenester,
      ]);
      await api.addClientDelegationAgent(actor.pid, actor.org, agent.pid);
      await api.delegerKlientTilBruker(actor.pid, actor.org, client.org, agent.pid, posttjenester);
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

    test.afterEach(async () => {
      try {
        await api.deleteConnection(client.connectionPid, client.org, [actor.org]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
      try {
        await api.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('Slett fullmakt for en bruker fra klientfanen', () => {
    const actor = {
      pid: '21895699168',
      org: '310781940',
      orgName: 'UAVHENGIG REALISTISK TIGER AS',
    };
    const client = {
      connectionPid: '19876699047',
      org: '213836722',
      orgName: 'VENSTRE GENIERKLÆRT KATT SEPARASJON',
    };
    const agent = { pid: '03924296991', name: 'ORANSJE TEST' };

    test.beforeEach(async () => {
      await api.addConnectionAndPackagesToUser(client.connectionPid, client.org, actor.org, [
        posttjenester,
      ]);
      await api.addClientDelegationAgent(actor.pid, actor.org, agent.pid);
      await api.delegerKlientTilBruker(actor.pid, actor.org, client.org, agent.pid, posttjenester);
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
        await klientAdministrasjonPage.goToKlientFane();
        await klientAdministrasjonPage.klikkListeElement(client.orgName);
        await klientAdministrasjonPage.klikkKnapp(agent.name);
      });

      await test.step('Slett fullmakt for Posttjenester', async () => {
        await klientAdministrasjonPage.slettFullmakt('Posttjenester');
      });

      await test.step(`${agent.name} har ingen fullmakter lenger`, async () => {
        await expect(klientAdministrasjonPage.ingenBrukereTekst).toBeVisible();
      });
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(client.connectionPid, client.org, [actor.org]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
      try {
        await api.deleteClientDelegationAgent(actor.pid, actor.org, agent.pid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });
});
