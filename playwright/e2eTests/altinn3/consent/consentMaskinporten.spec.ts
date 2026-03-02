import { expect } from '@playwright/test';
import { test } from 'playwright/fixture/pomFixture';
import { ConsentApiRequests } from 'playwright/api-requests/ConsentApiRequests';
import { Language } from 'playwright/pages/consent/ConsentPage';
import { addTimeToNowUtc, env, formatUiDateTime, pickRandom } from 'playwright/util/helper';
import { getConsentRequestId } from './helper/consentHelper.js';
import { fromOrgs, fromPersons, toOrgs } from './helper/consentTestdata';

const MOBILE_VIEWPORT = { width: 375, height: 667 };

// Digdir's org id
const MASKINPORTEN_ORG_DIGDIR = '991825827';
const ENV = env('environment')?.toUpperCase();
const REDIRECT_URL = 'https://example.com/';
const APPROVED_REDIRECT_URL = `${REDIRECT_URL}?Status=OK`;

function getDigitaliseringsdirektoratetLocator(page: any) {
  return page.getByText('DIGITALISERINGSDIREKTORATET');
}

test.describe('Generate consent request for Digdir using maskinporten to fetch token', () => {
  test.use({ language: Language.NB, viewport: MOBILE_VIEWPORT });

  test('Create and approve standard consent with Maskinporten', async ({
    page,
    login,
    consentPage,
  }) => {
    const fromPerson = pickRandom(fromPersons);
    const toOrg = MASKINPORTEN_ORG_DIGDIR;
    const validTo = addTimeToNowUtc({ days: 5 });
    const api = new ConsentApiRequests(toOrg);

    const consentResp = await test.step('Create consent request', async () => {
      const response = await api.createConsentRequestWithMaskinporten(
        { type: 'person', id: fromPerson },
        { type: 'org', id: toOrg },
        'MASKINPORTEN_CLIENT_ID',
        'MASKINPORTEN_JWK',
      );
      await consentPage.open(response.viewUri);
      await login.loginNotChoosingActor(fromPerson);
      await consentPage.pickLanguage(consentPage.language);
      return response;
    });

    await test.step('Verify consent created', async () => {
      expect(consentResp.viewUri).toBeTruthy();
    });

    await test.step('Verify consent UI and expiry', async () => {
      await consentPage.expectStandardIntro();
      await expect(consentPage.textIncomeData).toBeVisible();
      await expect(getDigitaliseringsdirektoratetLocator(page)).toHaveCount(2);
      await consentPage.expectExpiry(formatUiDateTime(validTo));
    });

    await test.step('Approve consent', async () => {
      await consentPage.approveStandardAndWaitLogout(APPROVED_REDIRECT_URL);
    });
  });

  /**
   * Scenario E-bevis
   *
   * Funksjonelt scenario:
   * I dette scenarioet har en virksomhet behov for tilgang til data til norsk virksomhet eller innbygger via e-bevis løsningen
   * som administreres av Digdir. Virksomheten som ønsker tilgang til data har ikke noe oppsett
   * for å kunne gjøre det og vil at Digdir gjennomfører alt på vegne av dem.
   * Krever scopet "altinn:consentrequests.org" for å kunne gjøre det og det sjekkes eksplisitt på at samtykkeressursen eies av samme org som henter
   * maskinporten-tokenet.
   */
  test(`E-bevis (org scope)`, async ({ consentPage, login }) => {
    const fromPerson = pickRandom(fromPersons);
    const toOrg = pickRandom(toOrgs);
    const validTo = addTimeToNowUtc({ days: 2 });
    const api = new ConsentApiRequests(toOrg, 'altinn:consentrequests.org');

    const consentResponse = await test.step('Create consent request', async () => {
      return await api.createConsentRequest({
        from: { type: 'person', id: fromPerson },
        to: { type: 'org', id: toOrg },
        validToIsoUtc: validTo,
        resourceValue: 'samtykke-esoknad',
        redirectUrl: REDIRECT_URL,
        metaData: { rente: '4.2', banknavn: 'Testbanken E2E', utloepsar: '2027' },
      });
    });

    await test.step('Open consent page and login', async () => {
      await consentPage.open(consentResponse.viewUri);
      await login.loginNotChoosingActor(fromPerson);
    });

    await test.step('Pick language', async () => {
      await consentPage.pickLanguage(consentPage.language);
    });

    await test.step('Verify consent UI', async () => {
      await consentPage.expectStandardIntro();
      await expect(consentPage.textLoanApplication).toBeVisible();
      await expect(consentPage.getInterestRateText('4.2')).toBeVisible();
      await expect(consentPage.getExpirationYearText('2027')).toBeVisible();
      await expect(consentPage.getBankNameText('Testbanken E2E')).toBeVisible();
      await expect(consentPage.textOneTimeDelivery).toBeVisible();
    });

    await test.step('Approve consent', async () => {
      await consentPage.approveStandardAndWaitLogout(APPROVED_REDIRECT_URL);
    });
  });

  // TT02-only token retrieval
  test.describe('TT02-only token retrieval', () => {
    test.skip(ENV !== 'TT02', 'Consent token fetch only available in TT02');

    test('Fetch consent token after approval', async ({ page, login, consentPage }) => {
      const fromPerson = pickRandom(fromPersons);
      const toOrg = MASKINPORTEN_ORG_DIGDIR;
      const api = new ConsentApiRequests(toOrg);

      const consentResp = await test.step('Create consent request', async () => {
        const response = await api.createConsentRequestWithMaskinporten(
          { type: 'person', id: fromPerson },
          { type: 'org', id: toOrg },
          'MASKINPORTEN_CLIENT_ID',
          'MASKINPORTEN_JWK',
        );
        await consentPage.open(response.viewUri);
        await login.loginNotChoosingActor(fromPerson);
        await consentPage.pickLanguage(consentPage.language);
        return response;
      });

      await test.step('Verify consent UI', async () => {
        await consentPage.expectStandardIntro();
        await expect(consentPage.textIncomeData).toBeVisible();
        await expect(getDigitaliseringsdirektoratetLocator(page)).toHaveCount(2);
      });

      await test.step('Approve consent', async () => {
        await consentPage.approveStandardAndWaitLogout(APPROVED_REDIRECT_URL);
      });

      await test.step('Fetch consent token', async () => {
        const consentId = getConsentRequestId(consentResp.viewUri);
        const token = await api.getConsentTokenWithMaskinporten(
          consentId,
          { type: 'person', id: fromPerson },
          'MASKINPORTEN_CLIENT_ID',
          'MASKINPORTEN_JWK',
        );
        expect(token).toBeTruthy();
        expect(token.length).toBeGreaterThan(10);
      });
    });

    /**
     * Scenario 3 - E-bevis
     *
     * Funksjonelt scenario:
     * En virksomhet trenger tilgang til data via e-bevis, og Digdir gjør oppslag/forespørsel på vegne av dem
     * med scope `altinn:consentrequests.org`.
     */
    test('Scenario 3 E-bevis: create consent with org scope and fetch token', async ({
      login,
      consentPage,
    }) => {
      const fromPerson = pickRandom(fromPersons);
      const toOrg = pickRandom(toOrgs);
      const validTo = addTimeToNowUtc({ days: 2 });
      const api = new ConsentApiRequests(toOrg);

      const consentResp =
        await test.step('Create consent request with Maskinporten using org scope', async () => {
          const response = await api.createConsentRequestWithMaskinporten(
            { type: 'person', id: fromPerson },
            { type: 'org', id: toOrg },
            'MASKINPORTEN_CLIENT_ID',
            'MASKINPORTEN_JWK',
            {
              consentRequestScope: 'altinn:consentrequests.org', // Digdir's super scope for e-bevis
              validToIsoUtc: validTo,
              resourceValue: 'samtykke-esoknad',
              redirectUrl: REDIRECT_URL,
              metaData: { rente: '4.2', banknavn: 'Testbanken E2E', utloepsar: '2027' },
            },
          );

          await consentPage.open(response.viewUri);
          await login.loginNotChoosingActor(fromPerson);
          await consentPage.pickLanguage(consentPage.language);
          return response;
        });

      await test.step('Verify Digdir on-behalf-of text is displayed', async () => {
        await expect(
          consentPage.page.getByText('Digitaliseringsdirektoratet foretar dette oppslaget på'),
        ).toBeVisible();
      });

      await test.step('Approve consent', async () => {
        await consentPage.approveStandardAndWaitLogout(APPROVED_REDIRECT_URL);
      });

      await test.step('Fetch consent token with Digdir client', async () => {
        const consentId = getConsentRequestId(consentResp.viewUri);
        const token = await api.getConsentTokenWithMaskinporten(
          consentId,
          { type: 'person', id: fromPerson },
          'MASKINPORTEN_CLIENT_ID',
          'MASKINPORTEN_JWK',
        );
        expect(token).toBeTruthy();
        expect(token.length).toBeGreaterThan(10);
      });
    });

    /**
     * Scenario 2 - "På vegne av - samtykke for datakonsument må få delegert scope-tilgang"
     *
     * Funksjonelt scenario:
     * Sparebanken må hente inn samtykke fra person, men en annen org er datakonsument
     * (Sparebanken Drift).
     *
     * Forhåndssteg:
     * - Sparebanken Øst har delegert scopetilgang "samtykke:write" til Sparebanken Drift (datakonsument).
     * - Sparebanken Drift henter ut Maskinporten-token for Sparebank 1 Øst ved å oppgi
     *   consumer_org for Sparebank 1 Øst (for selve forespørselen).
     */
    test('Create and approve consent on behalf of organization as a consumer org and fetch token', async ({
      login,
      consentPage,
    }) => {
      test.skip(ENV !== 'TT02', 'Consent token fetch only available in TT02');

      const FROM_ORG = '313876144'; //Dagl 28913749776

      const fromPerson = pickRandom(fromPersons);
      const validTo = addTimeToNowUtc({ days: 5 });
      const api = new ConsentApiRequests();

      const consentResp =
        await test.step('Fetch Maskinporten token for consumer_org and create consent request with toOrg as FROM_ORG', async () => {
          // Use Maskinporten token (from behalf_of client) with consumer_orgno to create consent request
          const { viewUri } = await api.createConsentRequestWithMaskinporten(
            { type: 'person', id: fromPerson },
            { type: 'org', id: FROM_ORG },
            'MASKINPORTEN_BEHALF_OF_CLIENT_ID',
            'MASKINPORTEN_BEHALF_OF_JWK',
            { consumerOrg: FROM_ORG },
          );

          await consentPage.open(viewUri);
          await login.loginNotChoosingActor(fromPerson);
          await consentPage.pickLanguage(consentPage.language);

          expect(viewUri).toBeTruthy();
          return { viewUri };
        });

      await test.step('Verify consent UI and expiry', async () => {
        await consentPage.expectStandardIntro();
        await expect(consentPage.textIncomeData).toBeVisible();
        await consentPage.expectExpiry(formatUiDateTime(validTo));
      });

      await test.step('Verify behalf of text is displayed', async () => {
        await expect(
          consentPage.page.getByText(
            'Jovial Konservativ Tiger AS foretar dette oppslaget på vegne av Nyttig Fredfull Struts Ltd.',
          ),
        ).toBeVisible();
      });

      await test.step('Approve consent', async () => {
        await consentPage.approveStandardAndWaitLogout(APPROVED_REDIRECT_URL);
      });

      await test.step('Fetch consent token with consumer_org', async () => {
        const consentId = getConsentRequestId(consentResp.viewUri);

        const token = await api.getConsentTokenWithMaskinporten(
          consentId,
          { type: 'person', id: fromPerson },
          'MASKINPORTEN_BEHALF_OF_CLIENT_ID',
          'MASKINPORTEN_BEHALF_OF_JWK',
          FROM_ORG,
        );
        expect(token).toBeTruthy();
        expect(token.length).toBeGreaterThan(10);
      });
    });
  });

  /**
   * Scenario 2 - "På vegne av - samtykke for datakonsument må få delegert scope-tilgang"
   *
   * Funksjonelt scenario:
   * Sparebanken må hente inn samtykke fra virksomhet (from = org), mens en annen org er datakonsument
   * (Sparebanken Drift).
   *
   * Forhåndssteg:
   * - Sparebanken Øst har delegert scopetilgang "samtykke:write" til Sparebanken Drift (datakonsument).
   * - Sparebanken Drift henter ut Maskinporten-token for Sparebank 1 Øst ved å oppgi
   *   consumer_org for Sparebank 1 Øst (for selve forespørselen).
   */
  test('Create and approve consent on behalf of organization as a consumer org and fetch token with org number', async ({
    login,
    consentPage,
  }) => {
    test.skip(ENV !== 'TT02', 'Consent token fetch only available in TT02');

    const SPAREBANKEN_ORG_NUMBER = '313876144'; //Dagl 28913749776

    // Org that consents
    const fromOrg = '312690365';
    const personapprove = '09923649732';

    const api = new ConsentApiRequests();

    const consentResp =
      await test.step('Fetch Maskinporten token for consumer_org and create consent request with toOrg as SPAREBANKEN_ORG_NUMBER', async () => {
        // Use Maskinporten token (from behalf_of client) with consumer_orgno to create consent request
        const { viewUri } = await api.createConsentRequestWithMaskinporten(
          { type: 'org', id: fromOrg },
          { type: 'org', id: SPAREBANKEN_ORG_NUMBER },
          'MASKINPORTEN_BEHALF_OF_CLIENT_ID',
          'MASKINPORTEN_BEHALF_OF_JWK',
          { consumerOrg: SPAREBANKEN_ORG_NUMBER },
        );

        await consentPage.open(viewUri);
        await login.loginNotChoosingActor(personapprove);
        await consentPage.pickLanguage(consentPage.language);

        expect(viewUri).toBeTruthy();
        return { viewUri };
      });

    await test.step('Approve consent', async () => {
      await consentPage.approveStandardAndWaitLogout(APPROVED_REDIRECT_URL);
    });

    await test.step('Fetch consent token with consumer_org', async () => {
      const consentId = getConsentRequestId(consentResp.viewUri);

      const token = await api.getConsentTokenWithMaskinporten(
        consentId,
        { type: 'org', id: fromOrg },
        'MASKINPORTEN_BEHALF_OF_CLIENT_ID',
        'MASKINPORTEN_BEHALF_OF_JWK',
        SPAREBANKEN_ORG_NUMBER,
      );
      console.log('token', token);
      expect(token).toBeTruthy();
      expect(token.length).toBeGreaterThan(10);
    });
  });
});
