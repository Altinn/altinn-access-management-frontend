import { expect, test } from '../../../fixture/pomFixture';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';
import { cleanupConnection, cleanupClientDelegationAgent } from '../../../util/delegationHelpers';
import {
  TenorTestData,
  type TenorPerson,
  type TenorDagligLederMedOrg,
} from '../../../tenor/TenorTestData';

const posttjenester = 'urn:altinn:accesspackage:posttjenester';

test.describe('klientadministrasjon', () => {
  const api = new EnduserConnection();
  const tenor = new TenorTestData();

  test.describe('legg til bruker', () => {
    let actor: TenorDagligLederMedOrg;
    let agent: TenorPerson;

    test.beforeEach(async () => {
      // `actor` er virksomheten som administrerer klienter; `agent` er personen
      // som legges til som bruker. Klient-relasjonen opprettes via API i testene
      // som trenger den, så `actor` trenger ikke være en registrert facilitator.
      [actor, agent] = await Promise.all([tenor.dagligLederMedOrg(), tenor.bosattMyndigPerson()]);
    });

    test('legg til bruker', async ({
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
    }) => {
      await test.step(`Logg inn som ${actor.org.navn} og åpne klientadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.dagligLeder.pid);
        await login.selectMainUnitBySearching(actor.org.navn);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`legg til bruker ${agent.pid} ${agent.navn}`, async () => {
        await klientAdministrasjonPage.clickLeggTilBrukerKnapp();
        await klientAdministrasjonPage.skrivFnr(agent.pid);
        await klientAdministrasjonPage.skrivEtternavn(agent.etternavn);
        await klientAdministrasjonPage.klikkLeggTilPerson();
      });

      await test.step(`${agent.navn} har nå blitt lagt til`, async () => {
        await expect(klientAdministrasjonPage.slettBrukerKnapp).toBeVisible();
        await expect(klientAdministrasjonPage.brukerKnapp(agent.navn)).toBeVisible();
      });
    });

    test.afterEach(async () => {
      await cleanupClientDelegationAgent(api, actor.dagligLeder.pid, actor.org.orgnr, agent.pid);
    });
  });

  test.describe('slett bruker', () => {
    let actor: TenorDagligLederMedOrg;
    let agent: TenorPerson;

    test.beforeEach(async () => {
      [actor, agent] = await Promise.all([tenor.dagligLederMedOrg(), tenor.bosattMyndigPerson()]);
      await api.addClientDelegationAgent(actor.dagligLeder.pid, actor.org.orgnr, agent.pid);
    });

    test('slett bruker', async ({ accessManagementFrontPage, klientAdministrasjonPage, login }) => {
      await test.step(`Logg inn som ${actor.org.navn} og åpne klientadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.dagligLeder.pid);
        await login.selectMainUnitBySearching(actor.org.navn);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`Gå til ${agent.pid} ${agent.navn}`, async () => {
        await klientAdministrasjonPage.verifyPaaKlientadministrasjon();
        await klientAdministrasjonPage.klikkListeElement(agent.navn);
        await klientAdministrasjonPage.verifyPaaBrukerDetaljer();
      });

      await test.step(`slett ${agent.navn}`, async () => {
        await klientAdministrasjonPage.slettBruker();
      });

      await test.step(`${agent.navn} er nå slettet`, async () => {
        await expect(klientAdministrasjonPage.ingenBrukereTekst).toBeVisible();
      });
    });

    test.afterEach(async ({}, testInfo) => {
      if (testInfo.status === 'passed') return;
      await cleanupClientDelegationAgent(api, actor.dagligLeder.pid, actor.org.orgnr, agent.pid);
    });
  });

  test.describe('deleger klient til en bruker fra klientfanen', () => {
    let actor: TenorDagligLederMedOrg;
    let client: TenorDagligLederMedOrg;
    let agent: TenorPerson;

    test.beforeEach(async () => {
      [actor, agent] = await Promise.all([tenor.dagligLederMedOrg(), tenor.bosattMyndigPerson()]);
      client = await tenor.dagligLederMedOrg({ ekskluder: [actor.org.orgnr] });

      // Klienten gir `actor` posttjenester (oppdrag), og `agent` legges til som bruker.
      await api.addConnectionAndPackagesToUser(
        client.dagligLeder.pid,
        client.org.orgnr,
        actor.org.orgnr,
        [posttjenester],
      );
      await api.addClientDelegationAgent(actor.dagligLeder.pid, actor.org.orgnr, agent.pid);
    });

    test('deleger klient til en bruker fra klientfanen', async ({
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
    }) => {
      await test.step(`Logg inn som ${actor.org.navn} og åpne klientadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.dagligLeder.pid);
        await login.selectMainUnitBySearching(actor.org.navn);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`Gå til klientfanen og velg ${client.org.navn}`, async () => {
        await klientAdministrasjonPage.goToKlientFane();
        await klientAdministrasjonPage.klikkListeElement(client.org.navn);
      });

      await test.step(`Gi ${agent.navn} fullmakt til Posttjenester`, async () => {
        await klientAdministrasjonPage.klikkAlleBrukere();
        await klientAdministrasjonPage.klikkKnapp(agent.navn);
        await klientAdministrasjonPage.klikkGiFullmakt('Posttjenester');
      });

      await test.step(`${agent.navn} finnes nå i listen over eksisterende brukere`, async () => {
        await klientAdministrasjonPage.klikkBrukereMedFullmakt();
        await expect(klientAdministrasjonPage.brukerKnapp(agent.navn)).toBeVisible();
      });

      await test.step('og har tilgangspakken Posttjenester', async () => {
        await klientAdministrasjonPage.klikkKnapp(agent.navn);
        await expect(klientAdministrasjonPage.slettFullmaktKnapp('Posttjenester')).toBeVisible();
      });
    });

    test.afterEach(async () => {
      await cleanupConnection(api, {
        pid: client.dagligLeder.pid,
        from: client.org.orgnr,
        to: actor.org.orgnr,
      });
      await cleanupClientDelegationAgent(api, actor.dagligLeder.pid, actor.org.orgnr, agent.pid);
    });
  });

  test.describe('deleger klient til en bruker fra brukerfanen', () => {
    let actor: TenorDagligLederMedOrg;
    let client: TenorDagligLederMedOrg;
    let agent: TenorPerson;

    test.beforeEach(async () => {
      [actor, agent] = await Promise.all([tenor.dagligLederMedOrg(), tenor.bosattMyndigPerson()]);
      client = await tenor.dagligLederMedOrg({ ekskluder: [actor.org.orgnr] });

      await api.addConnectionAndPackagesToUser(
        client.dagligLeder.pid,
        client.org.orgnr,
        actor.org.orgnr,
        [posttjenester],
      );
      await api.addClientDelegationAgent(actor.dagligLeder.pid, actor.org.orgnr, agent.pid);
    });

    test('deleger klient til en bruker fra brukerfanen', async ({
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
    }) => {
      await test.step(`Logg inn som ${actor.org.navn} og åpne klientadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.dagligLeder.pid);
        await login.selectMainUnitBySearching(actor.org.navn);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`velg ${agent.navn}`, async () => {
        await klientAdministrasjonPage.verifyPaaKlientadministrasjon();
        await klientAdministrasjonPage.klikkListeElement(agent.navn);
        await klientAdministrasjonPage.verifyPaaBrukerDetaljer();
      });

      await test.step(`Gi ${agent.navn} fullmakt til Posttjenester for ${client.org.navn}`, async () => {
        await klientAdministrasjonPage.klikkAlleKlienter();
        await klientAdministrasjonPage.klikkKnapp(client.org.navn);
        await klientAdministrasjonPage.klikkGiFullmakt('Posttjenester');
      });

      await test.step(`${agent.navn} finnes nå i listen over eksisterende brukere`, async () => {
        await klientAdministrasjonPage.klikkHarDisseKlientene();
        await expect(klientAdministrasjonPage.klientKnapp(client.org.navn)).toBeVisible();
      });

      await test.step('og har tilgangspakken Posttjenester', async () => {
        await klientAdministrasjonPage.klikkKnapp(client.org.navn);
        await expect(klientAdministrasjonPage.slettFullmaktKnapp('Posttjenester')).toBeVisible();
      });
    });

    test.afterEach(async () => {
      await cleanupConnection(api, {
        pid: client.dagligLeder.pid,
        from: client.org.orgnr,
        to: actor.org.orgnr,
      });
      await cleanupClientDelegationAgent(api, actor.dagligLeder.pid, actor.org.orgnr, agent.pid);
    });
  });

  test.describe('Slett fullmakt for en bruker fra brukerfanen', () => {
    let actor: TenorDagligLederMedOrg;
    let client: TenorDagligLederMedOrg;
    let agent: TenorPerson;

    test.beforeEach(async () => {
      [actor, agent] = await Promise.all([tenor.dagligLederMedOrg(), tenor.bosattMyndigPerson()]);
      client = await tenor.dagligLederMedOrg({ ekskluder: [actor.org.orgnr] });

      await api.addConnectionAndPackagesToUser(
        client.dagligLeder.pid,
        client.org.orgnr,
        actor.org.orgnr,
        [posttjenester],
      );
      await api.addClientDelegationAgent(actor.dagligLeder.pid, actor.org.orgnr, agent.pid);
      await api.delegerKlientTilBruker(
        actor.dagligLeder.pid,
        actor.org.orgnr,
        client.org.orgnr,
        agent.pid,
        posttjenester,
      );
    });

    test('Slett fullmakt for en bruker fra brukerfanen', async ({
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
    }) => {
      await test.step(`Logg inn som ${actor.org.navn} og åpne klientadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.dagligLeder.pid);
        await login.selectMainUnitBySearching(actor.org.navn);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`Gå til klienten ${client.org.navn} hos brukeren ${agent.navn}`, async () => {
        await klientAdministrasjonPage.klikkBruker(agent.navn);
        await klientAdministrasjonPage.klikkKnapp(client.org.navn);
      });

      await test.step('Slett fullmakt for Posttjenester', async () => {
        await klientAdministrasjonPage.slettFullmakt('Posttjenester');
      });

      await test.step(`${agent.navn} har ingen fullmakter lenger`, async () => {
        await expect(klientAdministrasjonPage.ingenKlienterTekst).toBeVisible();
      });
    });

    test.afterEach(async () => {
      await cleanupConnection(api, {
        pid: client.dagligLeder.pid,
        from: client.org.orgnr,
        to: actor.org.orgnr,
      });
      await cleanupClientDelegationAgent(api, actor.dagligLeder.pid, actor.org.orgnr, agent.pid);
    });
  });

  test.describe('Slett fullmakt for en bruker fra klientfanen', () => {
    let actor: TenorDagligLederMedOrg;
    let client: TenorDagligLederMedOrg;
    let agent: TenorPerson;

    test.beforeEach(async () => {
      [actor, agent] = await Promise.all([tenor.dagligLederMedOrg(), tenor.bosattMyndigPerson()]);
      client = await tenor.dagligLederMedOrg({ ekskluder: [actor.org.orgnr] });

      await api.addConnectionAndPackagesToUser(
        client.dagligLeder.pid,
        client.org.orgnr,
        actor.org.orgnr,
        [posttjenester],
      );
      await api.addClientDelegationAgent(actor.dagligLeder.pid, actor.org.orgnr, agent.pid);
      await api.delegerKlientTilBruker(
        actor.dagligLeder.pid,
        actor.org.orgnr,
        client.org.orgnr,
        agent.pid,
        posttjenester,
      );
    });

    test('Slett fullmakt for en bruker fra klientfanen', async ({
      accessManagementFrontPage,
      klientAdministrasjonPage,
      login,
    }) => {
      await test.step(`Logg inn som ${actor.org.navn} og åpne klientadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.dagligLeder.pid);
        await login.selectMainUnitBySearching(actor.org.navn);
        await accessManagementFrontPage.goToKlientAdministrasjon();
      });

      await test.step(`Gå til brukeren ${agent.navn} hos klienten ${client.org.navn}`, async () => {
        await klientAdministrasjonPage.verifyPaaKlientadministrasjon();
        await klientAdministrasjonPage.goToKlientFane();
        await klientAdministrasjonPage.klikkListeElement(client.org.navn);
        await klientAdministrasjonPage.verifyPaaKlientDetaljer();
        await klientAdministrasjonPage.klikkKnapp(agent.navn);
      });

      await test.step('Slett fullmakt for Posttjenester', async () => {
        await klientAdministrasjonPage.slettFullmakt('Posttjenester');
      });

      await test.step(`${agent.navn} har ingen fullmakter lenger`, async () => {
        await expect(klientAdministrasjonPage.ingenBrukereTekst).toBeVisible();
      });
    });

    test.afterEach(async () => {
      await cleanupConnection(api, {
        pid: client.dagligLeder.pid,
        from: client.org.orgnr,
        to: actor.org.orgnr,
      });
      await cleanupClientDelegationAgent(api, actor.dagligLeder.pid, actor.org.orgnr, agent.pid);
    });
  });
});
