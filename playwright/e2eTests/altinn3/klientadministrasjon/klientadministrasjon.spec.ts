import { env } from 'playwright/util/helper';
import { expect, test } from '../../../fixture/pomFixture';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';

const posttjenester = 'urn:altinn:accesspackage:posttjenester';

test.describe('klientadministrasjon', () => {
  const api = new EnduserConnection();

  test.describe('legg til bruker', () => {
    const d = {
      loginPid: '09866598352',
      org: '213779702',
      orgName: 'UVANLIG FILOSOFISK TIGER AS',
      agentPid: '29814895546',
      agentName: 'MUNTER SKO',
      agentLastName: 'Sko',
    };

    test('legg til bruker', async ({
      page,
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step('Logg inn', async () => {
        await page.goto(env('BASE_URL'));
        await login.LoginToAccessManagement(d.loginPid);
      });

      await test.step(`Velg org ${d.orgName} og gå til klientadministrasjon`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(d.orgName);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`legg til bruker ${d.agentPid} ${d.agentName}`, async () => {
        await klientAdministrasjonPage.clickLeggTilBrukerKnapp();
        await klientAdministrasjonPage.skrivFnr(d.agentPid);
        await klientAdministrasjonPage.skrivEtternavn(d.agentLastName);
        await klientAdministrasjonPage.klikkLeggTilPerson();
      });

      await test.step(`${d.agentName} har nå blitt lagt til`, async () => {
        await expect(klientAdministrasjonPage.slettBrukerKnapp).toBeVisible();
        await expect(klientAdministrasjonPage.brukerKnapp(d.agentName)).toBeVisible();
      });
    });

    test.afterEach(async () => {
      try {
        await api.deleteClientDelegationAgent(d.loginPid, d.org, d.agentPid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('slett bruker', () => {
    const d = {
      loginPid: '16830197862',
      org: '311164651',
      orgName: 'KLARTENKT UPRESIS ISBJØRN SA',
      agentPid: '30877795760',
      agentName: 'TROVERDIG JUICE',
    };

    test('slett bruker', async ({
      page,
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
      aktorvalgHeader,
    }) => {
      await api.addClientDelegationAgent(d.loginPid, d.org, d.agentPid);

      await test.step('Logg inn', async () => {
        await page.goto(env('BASE_URL'));
        await login.LoginToAccessManagement(d.loginPid);
      });

      await test.step(`Velg org ${d.orgName} og gå til klientadministrasjon`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(d.orgName);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`Gå til ${d.agentPid} ${d.agentName}`, async () => {
        await klientAdministrasjonPage.klikkListeElement(d.agentName);
      });

      await test.step(`slett ${d.agentName}`, async () => {
        await klientAdministrasjonPage.slettBruker();
      });

      await test.step(`${d.agentName} er nå slettet`, async () => {
        await expect(klientAdministrasjonPage.ingenBrukereTekst).toBeVisible();
      });
    });

    test.afterEach(async () => {
      try {
        await api.deleteClientDelegationAgent(d.loginPid, d.org, d.agentPid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('deleger klient til en bruker fra klientfanen', () => {
    const d = {
      connectionPid: '28868199808',
      loginPid: '15846199893',
      facilitatorOrg: '310002224',
      facilitatorOrgName: 'TRÅDLØS FORNUFTIG KATT LYTE',
      clientOrg: '314087917',
      clientOrgName: 'PARISK AKADEMISK KATT SITRON',
      agentPid: '28822449737',
      agentName: 'SINDIG BRUD',
    };

    test('deleger klient til en bruker fra klientfanen', async ({
      page,
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
      aktorvalgHeader,
    }) => {
      await api.addConnectionAndPackagesToUser(d.connectionPid, d.clientOrg, d.facilitatorOrg, [
        posttjenester,
      ]);
      await api.addClientDelegationAgent(d.loginPid, d.facilitatorOrg, d.agentPid);

      await test.step('Logg inn', async () => {
        await page.goto(env('BASE_URL'));
        await login.LoginToAccessManagement(d.loginPid);
      });

      await test.step(`Velg org ${d.facilitatorOrgName} og gå til klientadministrasjon`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(d.facilitatorOrgName);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`Gå til klientfanen og velg ${d.clientOrgName}`, async () => {
        await klientAdministrasjonPage.goToKlientFane();
        await klientAdministrasjonPage.klikkListeElement(d.clientOrgName);
      });

      await test.step(`Gi ${d.agentName} fullmakt til Posttjenester`, async () => {
        await klientAdministrasjonPage.klikkAlleBrukere();
        await klientAdministrasjonPage.klikkKnapp(d.agentName);
        await klientAdministrasjonPage.klikkGiFullmakt('Posttjenester');
      });

      await test.step(`${d.agentName} finnes nå i listen over eksisterende brukere`, async () => {
        await klientAdministrasjonPage.klikkBrukereMedFullmakt();
        await expect(klientAdministrasjonPage.brukerKnapp(d.agentName)).toBeVisible();
      });

      await test.step('og har tilgangspakken Posttjenester', async () => {
        await klientAdministrasjonPage.klikkKnapp(d.agentName);
        await expect(klientAdministrasjonPage.slettFullmaktKnapp('Posttjenester')).toBeVisible();
      });
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(d.connectionPid, d.clientOrg, [d.facilitatorOrg]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
      try {
        await api.deleteClientDelegationAgent(d.loginPid, d.facilitatorOrg, d.agentPid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('deleger klient til en bruker fra brukerfanen', () => {
    const d = {
      connectionPid: '23907296857',
      loginPid: '16852749125',
      facilitatorOrg: '313662624',
      facilitatorOrgName: 'INTERESSERT KONVENSJONELL TIGER AS',
      clientOrg: '313238105',
      clientOrgName: 'BESTEMT SLAKK TIGER AS',
      agentPid: '47822800420',
      agentName: 'UVANLIG FREDAG',
    };

    test('deleger klient til en bruker fra brukerfanen', async ({
      page,
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
      aktorvalgHeader,
    }) => {
      await api.addConnectionAndPackagesToUser(d.connectionPid, d.clientOrg, d.facilitatorOrg, [
        posttjenester,
      ]);
      await api.addClientDelegationAgent(d.loginPid, d.facilitatorOrg, d.agentPid);

      await test.step('Logg inn', async () => {
        await page.goto(env('BASE_URL'));
        await login.LoginToAccessManagement(d.loginPid);
      });

      await test.step(`Velg org ${d.facilitatorOrgName} og gå til klientadministrasjon`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(d.facilitatorOrgName);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`velg ${d.agentName}`, async () => {
        await klientAdministrasjonPage.klikkListeElement(d.agentName);
      });

      await test.step(`Gi ${d.agentName} fullmakt til Posttjenester for ${d.clientOrgName}`, async () => {
        await klientAdministrasjonPage.klikkAlleKlienter();
        await klientAdministrasjonPage.klikkKnapp(d.clientOrgName);
        await klientAdministrasjonPage.klikkGiFullmakt('Posttjenester');
      });

      await test.step(`${d.agentName} finnes nå i listen over eksisterende brukere`, async () => {
        await klientAdministrasjonPage.klikkHarDisseKlientene();
        await expect(klientAdministrasjonPage.brukerKnapp(d.clientOrgName)).toBeVisible();
      });

      await test.step('og har tilgangspakken Posttjenester', async () => {
        await klientAdministrasjonPage.klikkKnapp(d.clientOrgName);
        await expect(klientAdministrasjonPage.slettFullmaktKnapp('Posttjenester')).toBeVisible();
      });
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(d.connectionPid, d.clientOrg, [d.facilitatorOrg]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
      try {
        await api.deleteClientDelegationAgent(d.loginPid, d.facilitatorOrg, d.agentPid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('Slett fullmakt for en bruker fra brukerfanen', () => {
    const d = {
      connectionPid: '12886999389',
      loginPid: '08873349590',
      facilitatorOrg: '312772655',
      facilitatorOrgName: 'RØRETE RAKRYGGET TIGER AS',
      clientOrg: '313428435',
      clientOrgName: 'ROSA UNDERDANIG TIGER AS',
      agentPid: '04905999376',
      agentName: 'FORSTÅELSESFULL TRAFIKKORK',
    };

    test('Slett fullmakt for en bruker fra brukerfanen', async ({
      page,
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
      aktorvalgHeader,
    }) => {
      await api.addConnectionAndPackagesToUser(d.connectionPid, d.clientOrg, d.facilitatorOrg, [
        posttjenester,
      ]);
      await api.addClientDelegationAgent(d.loginPid, d.facilitatorOrg, d.agentPid);
      await api.delegerKlientTilBruker(
        d.loginPid,
        d.facilitatorOrg,
        d.clientOrg,
        d.agentPid,
        posttjenester,
      );

      await test.step('Logg inn', async () => {
        await page.goto(env('BASE_URL'));
        await login.LoginToAccessManagement(d.loginPid);
      });

      await test.step(`Velg org ${d.facilitatorOrgName} og gå til klientadministrasjon`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(d.facilitatorOrgName);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`Gå til klienten ${d.clientOrgName} hos brukeren ${d.agentName}`, async () => {
        await klientAdministrasjonPage.klikkBruker(d.agentName);
        await klientAdministrasjonPage.klikkKnapp(d.clientOrgName);
      });

      await test.step('Slett fullmakt for Posttjenester', async () => {
        await klientAdministrasjonPage.slettFullmakt('Posttjenester');
      });

      await test.step(`${d.agentName} har ingen fullmakter lenger`, async () => {
        await expect(klientAdministrasjonPage.ingenKlienterTekst).toBeVisible();
      });
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(d.connectionPid, d.clientOrg, [d.facilitatorOrg]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
      try {
        await api.deleteClientDelegationAgent(d.loginPid, d.facilitatorOrg, d.agentPid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });

  test.describe('Slett fullmakt for en bruker fra klientfanen', () => {
    const d = {
      connectionPid: '19876699047',
      loginPid: '21895699168',
      facilitatorOrg: '310781940',
      facilitatorOrgName: 'UAVHENGIG REALISTISK TIGER AS',
      clientOrg: '213836722',
      clientOrgName: 'VENSTRE GENIERKLÆRT KATT SEPARASJON',
      agentPid: '03924296991',
      agentName: 'ORANSJE TEST',
    };

    test('Slett fullmakt for en bruker fra klientfanen', async ({
      page,
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
      aktorvalgHeader,
    }) => {
      await api.addConnectionAndPackagesToUser(d.connectionPid, d.clientOrg, d.facilitatorOrg, [
        posttjenester,
      ]);
      await api.addClientDelegationAgent(d.loginPid, d.facilitatorOrg, d.agentPid);
      await api.delegerKlientTilBruker(
        d.loginPid,
        d.facilitatorOrg,
        d.clientOrg,
        d.agentPid,
        posttjenester,
      );

      await test.step('Logg inn', async () => {
        await page.goto(env('BASE_URL'));
        await login.LoginToAccessManagement(d.loginPid);
      });

      await test.step(`Velg org ${d.facilitatorOrgName} og gå til klientadministrasjon`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(d.facilitatorOrgName);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`Gå til brukeren ${d.agentName} hos klienten ${d.clientOrgName}`, async () => {
        await klientAdministrasjonPage.goToKlientFane();
        await klientAdministrasjonPage.klikkListeElement(d.clientOrgName);
        await klientAdministrasjonPage.klikkKnapp(d.agentName);
      });

      await test.step('Slett fullmakt for Posttjenester', async () => {
        await klientAdministrasjonPage.slettFullmakt('Posttjenester');
      });

      await test.step(`${d.agentName} har ingen fullmakter lenger`, async () => {
        await expect(klientAdministrasjonPage.ingenBrukereTekst).toBeVisible();
      });
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(d.connectionPid, d.clientOrg, [d.facilitatorOrg]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
      try {
        await api.deleteClientDelegationAgent(d.loginPid, d.facilitatorOrg, d.agentPid);
      } catch (error) {
        console.error('Cleanup: Failed to delete client delegation agent:', error);
      }
    });
  });
});
