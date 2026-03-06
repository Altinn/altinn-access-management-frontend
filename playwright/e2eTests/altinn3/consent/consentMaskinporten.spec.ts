import { expect } from '@playwright/test';
import { test } from 'playwright/fixture/pomFixture';
import { ConsentApiRequests } from 'playwright/api-requests/ConsentApiRequests';
import { addTimeToNowUtc, env, formatUiDateTime, pickRandom } from 'playwright/util/helper';
import { getConsentRequestId } from './helper/consentHelper.js';
import { fromOrgs, fromPersons, toOrgs } from './helper/consentTestdata';

const MASKINPORTEN_ORG_DIGDIR = '991825827';
const ENV = env('environment')?.toUpperCase();
const REDIRECT_URL = 'https://example.com/';
const APPROVED_REDIRECT_URL = `${REDIRECT_URL}?Status=OK`;

// standard request scope used directly or behalf of organization in combination with consumer_org
const CONSENTREQUESTS_WRITE_SCOPE = 'altinn:consentrequests.write';

// e-bevis scope used by Digdir
const CONSENTREQUESTS_ORG_SCOPE = 'altinn:consentrequests.org';

const MASKINPORTEN_CLIENT_ID_ENV = 'MASKINPORTEN_CLIENT_ID';
const MASKINPORTEN_JWK_ENV = 'MASKINPORTEN_JWK';
const MASKINPORTEN_BEHALF_OF_CLIENT_ID_ENV = 'MASKINPORTEN_BEHALF_OF_CLIENT_ID';
const MASKINPORTEN_BEHALF_OF_JWK_ENV = 'MASKINPORTEN_BEHALF_OF_JWK';

test.describe('Fetch consent token after approval', () => {
  async function assertConsentTokenIsReturned(
    api: ConsentApiRequests,
    consentViewUri: string,
    fromPartyUrn: string,
    clientIdEnv: string,
    jwkEnv: string,
    consumerOrg?: string,
  ) {
    const consentId = getConsentRequestId(consentViewUri);
    const token = await api.getConsentTokenWithMaskinporten(
      consentId,
      fromPartyUrn,
      clientIdEnv,
      jwkEnv,
      consumerOrg,
    );
    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(10);
  }

  test('From person to org', async ({ login, consentPage }) => {
    const fromPerson = pickRandom(fromPersons);
    const toOrg = MASKINPORTEN_ORG_DIGDIR;
    const validTo = addTimeToNowUtc({ days: 5 });
    const api = new ConsentApiRequests(toOrg);

    const consentResp = await test.step('Create consent request', async () => {
      const response = await api.createConsentRequestWithMaskinporten(
        { type: 'person', id: fromPerson },
        { type: 'org', id: toOrg },
        MASKINPORTEN_CLIENT_ID_ENV,
        MASKINPORTEN_JWK_ENV,
        {
          consentRequestScope: CONSENTREQUESTS_WRITE_SCOPE,
          validToIsoUtc: validTo,
        },
      );
      await consentPage.open(response.viewUri);
      await login.loginNotChoosingActor(fromPerson);
      await consentPage.pickLanguage(consentPage.language);
      return response;
    });

    await test.step('Approve consent', async () => {
      await consentPage.approveStandardAndWaitLogout(APPROVED_REDIRECT_URL);
    });

    await test.step('Fetch consent token', async () => {
      // only works in TT02 environment
      if (ENV !== 'TT02') {
        return;
      }
      await assertConsentTokenIsReturned(
        api,
        consentResp.viewUri,
        `urn:altinn:person:identifier-no:${fromPerson}`,
        MASKINPORTEN_CLIENT_ID_ENV,
        MASKINPORTEN_JWK_ENV,
      );
    });
  });

  test('From org to org', async ({ login, consentPage }) => {
    const [fromOrg, personThatCanApprove] = pickRandom(fromOrgs);
    const toOrg = MASKINPORTEN_ORG_DIGDIR;
    const validTo = addTimeToNowUtc({ days: 5 });
    const api = new ConsentApiRequests(toOrg);

    const consentResp = await test.step('Create consent request', async () => {
      const response = await api.createConsentRequestWithMaskinporten(
        { type: 'org', id: fromOrg },
        { type: 'org', id: toOrg },
        MASKINPORTEN_CLIENT_ID_ENV,
        MASKINPORTEN_JWK_ENV,
        {
          consentRequestScope: CONSENTREQUESTS_WRITE_SCOPE,
          validToIsoUtc: validTo,
        },
      );
      await consentPage.open(response.viewUri);
      await login.loginNotChoosingActor(personThatCanApprove);
      await consentPage.pickLanguage(consentPage.language);
      return response;
    });

    await test.step('Approve consent', async () => {
      await consentPage.approveStandardAndWaitLogout(APPROVED_REDIRECT_URL);
    });

    await test.step('Fetch consent token', async () => {
      // only works in TT02 environment
      if (ENV !== 'TT02') {
        return;
      }
      await assertConsentTokenIsReturned(
        api,
        consentResp.viewUri,
        `urn:altinn:organization:identifier-no:${fromOrg}`,
        MASKINPORTEN_CLIENT_ID_ENV,
        MASKINPORTEN_JWK_ENV,
      );
    });
  });

  /**
   * Scenario: Displaying the scenario page for a consent request (known bug)
   *
   * This test is related to Altinn issue #2094.
   * Kjent bug: https://github.com/Altinn/altinn-authorization-tmp/issues/2094
   *
   * Funksjonelt Scenario: https://github.com/Altinn/altinn-authorization-tmp/issues/1006
   *
   */

  test('Kjent bug som gir 400-feil. E-bevis', async ({ login, consentPage }) => {
    const [fromOrg, personThatCanApprove] = pickRandom(fromOrgs);
    const toOrg = pickRandom(toOrgs);
    const validTo = addTimeToNowUtc({ days: 2 });
    const api = new ConsentApiRequests(toOrg);

    const consentResp =
      await test.step('Create consent request with Maskinporten using org scope', async () => {
        const response = await api.createConsentRequestWithMaskinporten(
          { type: 'org', id: fromOrg },
          { type: 'org', id: toOrg },
          MASKINPORTEN_CLIENT_ID_ENV,
          MASKINPORTEN_JWK_ENV,
          {
            consentRequestScope: CONSENTREQUESTS_ORG_SCOPE, // Digdir's super scope for e-bevis
            validToIsoUtc: validTo,
            resourceValue: 'samtykke-esoknad', //  se issue #2094 for mer info
            redirectUrl: REDIRECT_URL,
            metaData: { rente: '4.2', banknavn: 'Testbanken E2E', utloepsar: '2027' },
          },
        );

        await consentPage.open(response.viewUri);
        await login.loginNotChoosingActor(personThatCanApprove);
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
      // only works in TT02 environment
      if (ENV !== 'TT02') {
        return;
      }
      await assertConsentTokenIsReturned(
        api,
        consentResp.viewUri,
        `urn:altinn:organization:identifier-no:${fromOrg}`,
        MASKINPORTEN_CLIENT_ID_ENV,
        MASKINPORTEN_JWK_ENV,
      );
    });
  });

  /**
   * "På vegne av - samtykke for datakonsument må få delegert scope-tilgang"
   *
   * Funksjonelt scenario:
   * Sparebanken må hente inn samtykke fra person, men en annen org gjør det tekniske
   * (Sparebanken Drift).
   *
   * Forhåndssteg:
   * - Sparebanken Øst har delegert scopetilgang "samtykke:write" til Sparebanken Drift (datakonsument).
   * - Sparebanken Drift henter ut Maskinporten-token for Sparebank 1 Øst ved å oppgi
   *   consumer_org for Sparebank 1 Øst (for selve forespørselen).
   */
  test('På vegne av - Person to org', async ({ login, consentPage }) => {
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
          MASKINPORTEN_BEHALF_OF_CLIENT_ID_ENV,
          MASKINPORTEN_BEHALF_OF_JWK_ENV,
          {
            consentRequestScope: CONSENTREQUESTS_WRITE_SCOPE,
            consumerOrg: FROM_ORG,
            validToIsoUtc: validTo,
          },
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
      // only works in TT02 environment
      if (ENV !== 'TT02') {
        return;
      }
      await assertConsentTokenIsReturned(
        api,
        consentResp.viewUri,
        `urn:altinn:person:identifier-no:${fromPerson}`,
        MASKINPORTEN_BEHALF_OF_CLIENT_ID_ENV,
        MASKINPORTEN_BEHALF_OF_JWK_ENV,
        FROM_ORG,
      );
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
  test('På vegne av - Org to org', async ({ login, consentPage }) => {
    const SPAREBANKEN_ORG_NUMBER = '313876144'; //Dagl 28913749776

    // Org that consents
    const fromOrg = '312690365';
    const personThatCanApprove = '09923649732';
    const validTo = addTimeToNowUtc({ days: 5 });

    const api = new ConsentApiRequests();

    let viewUri: string;

    await test.step('Fetch Maskinporten token for consumer_org and create consent request with toOrg as SPAREBANKEN_ORG_NUMBER', async () => {
      // Use Maskinporten token (from behalf_of client) with consumer_orgno to create consent request
      const response = await api.createConsentRequestWithMaskinporten(
        { type: 'org', id: fromOrg },
        { type: 'org', id: SPAREBANKEN_ORG_NUMBER },
        MASKINPORTEN_BEHALF_OF_CLIENT_ID_ENV,
        MASKINPORTEN_BEHALF_OF_JWK_ENV,
        {
          consentRequestScope: CONSENTREQUESTS_WRITE_SCOPE,
          consumerOrg: SPAREBANKEN_ORG_NUMBER,
          validToIsoUtc: validTo,
        },
      );
      viewUri = response.viewUri;

      await consentPage.open(viewUri);
      await login.loginNotChoosingActor(personThatCanApprove);
      await consentPage.pickLanguage(consentPage.language);

      expect(viewUri).toBeTruthy();
      return { viewUri };
    });

    await test.step('Approve consent', async () => {
      await consentPage.approveStandardAndWaitLogout(APPROVED_REDIRECT_URL);
    });

    await test.step('Fetch consent token with consumer_org', async () => {
      // only works in TT02 environment
      if (ENV !== 'TT02') {
        return;
      }
      await assertConsentTokenIsReturned(
        api,
        viewUri,
        `urn:altinn:organization:identifier-no:${fromOrg}`,
        MASKINPORTEN_BEHALF_OF_CLIENT_ID_ENV,
        MASKINPORTEN_BEHALF_OF_JWK_ENV,
        SPAREBANKEN_ORG_NUMBER,
      );
    });
  });
});
