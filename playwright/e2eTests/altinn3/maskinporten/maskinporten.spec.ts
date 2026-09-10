import { expect, test } from '../../../fixture/pomFixture';
import { MaskinportenApiRequests } from '../../../api-requests/MaskinportenApiRequests';

/**
 * Maskinporten-administrasjon — leverandører og konsumenter.
 *
 * Each describe block has its OWN acting organisation, because the tests add and
 * remove suppliers on it and the suite runs fully parallel.
 *
 * `actor.pid` is the organisation's daglig leder, which is what makes them
 * Maskinporten administrator (`GET user/isMaskinportenAdmin` returns true) —
 * no access package needs delegating first. `leverandoer` is the organisation
 * being added as a supplier; it needs no special rights of its own.
 *
 * To source replacements, `yarn tenor:virksomhet --env <env>` prints an
 * organisation with its daglig leder. Verify the pair against
 * `isMaskinportenAdmin`, and prefer an organisation with no existing suppliers.
 *
 * NOTE: delegating an API (scope) to a supplier is deliberately not covered —
 * the backend rejects it with "The resource is invalid" (AM-00027) in both AT23
 * and TT02, because the resources returned by the scope search are not resolvable
 * in the access-management database. See the PR description.
 */
const ACTORS = {
  leggTil: {
    actor: { pid: '01906499998', org: '314241878', orgName: 'ETTERPÅKLOK USENSUELL TIGER AS' },
    leverandoer: { org: '312281325', orgName: 'DOGMATISK ANONYM TIGER AS' },
  },
  slett: {
    actor: { pid: '20855398150', org: '314318277', orgName: 'SLAKK KJEMPENDE MINK ANS' },
    leverandoer: { org: '312281325', orgName: 'DOGMATISK ANONYM TIGER AS' },
  },
  oversikt: {
    actor: { pid: '27849297746', org: '310343439', orgName: 'UFORNUFTIG VIRTUELL PUMA' },
  },
};

test.describe('Maskinporten-administrasjon', () => {
  const api = new MaskinportenApiRequests();

  test.describe('oversikt', () => {
    const { actor } = ACTORS.oversikt;

    test.beforeEach(async () => {
      await api.removeAllSuppliers(actor.pid, actor.org);
    });

    test('maskinportenadministrator ser leverandør- og konsumentfanen', async ({
      maskinportenPage,
      login,
    }) => {
      await test.step(`Logg inn som ${actor.orgName} og åpne maskinportenadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectMainUnitBySearching(actor.orgName);
        await maskinportenPage.goToMaskinporten();
      });

      await test.step('Begge fanene er tilgjengelige', async () => {
        await maskinportenPage.verifyPaaMaskinporten();
      });

      await test.step('Virksomheten har ingen leverandører', async () => {
        await expect(maskinportenPage.ingenLeverandoererTekst).toBeVisible();
      });

      await test.step('Konsumentfanen kan åpnes', async () => {
        await maskinportenPage.goToKonsumenterFane();
      });
    });
  });

  test.describe('legg til leverandør', () => {
    const { actor, leverandoer } = ACTORS.leggTil;

    test.beforeEach(async () => {
      await api.removeAllSuppliers(actor.pid, actor.org);
    });

    test('legg til en leverandør', async ({ maskinportenPage, login }) => {
      await test.step(`Logg inn som ${actor.orgName} og åpne maskinportenadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectMainUnitBySearching(actor.orgName);
        await maskinportenPage.goToMaskinporten();
      });

      await test.step('Virksomheten har ingen leverandører fra før', async () => {
        await expect(maskinportenPage.ingenLeverandoererTekst).toBeVisible();
      });

      await test.step(`Legg til ${leverandoer.orgName} som leverandør`, async () => {
        await maskinportenPage.leggTilLeverandoer(leverandoer.org);
      });

      await test.step('Leverandøren er lagt til og vises i oversikten', async () => {
        // Adding navigates straight to the new supplier's own page.
        await expect(maskinportenPage.slettLeverandoerKnapp).toBeVisible();
        await maskinportenPage.goToMaskinporten();
        await expect(maskinportenPage.connectionRad(leverandoer.orgName)).toBeVisible();
      });
    });

    test.afterEach(async () => {
      try {
        await api.removeAllSuppliers(actor.pid, actor.org);
      } catch (error) {
        console.error('Cleanup: Failed to remove suppliers:', error);
      }
    });
  });

  test.describe('slett leverandør', () => {
    const { actor, leverandoer } = ACTORS.slett;

    test.beforeEach(async () => {
      await api.removeAllSuppliers(actor.pid, actor.org);
      await api.addSupplier(actor.pid, actor.org, leverandoer.org);
    });

    test('slett en leverandør', async ({ maskinportenPage, login }) => {
      await test.step(`Logg inn som ${actor.orgName} og åpne maskinportenadministrasjon`, async () => {
        await login.LoginToAccessManagement(actor.pid);
        await login.selectMainUnitBySearching(actor.orgName);
        await maskinportenPage.goToMaskinporten();
      });

      await test.step(`Åpne leverandøren ${leverandoer.orgName}`, async () => {
        await expect(maskinportenPage.connectionRad(leverandoer.orgName)).toBeVisible();
        await maskinportenPage.aapneLeverandoer(leverandoer.orgName);
      });

      await test.step('Slett leverandøren', async () => {
        await maskinportenPage.slettLeverandoer();
      });

      await test.step('Leverandøren er borte fra oversikten', async () => {
        await expect(maskinportenPage.ingenLeverandoererTekst).toBeVisible();
        await expect(maskinportenPage.connectionRad(leverandoer.orgName)).toBeHidden();
      });
    });

    test.afterEach(async ({}, testInfo) => {
      if (testInfo.status === 'passed') return;

      try {
        await api.removeAllSuppliers(actor.pid, actor.org);
      } catch (error) {
        console.error('Cleanup: Failed to remove suppliers:', error);
      }
    });
  });
});
