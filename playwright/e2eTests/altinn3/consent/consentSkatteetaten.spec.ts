import { expect } from '@playwright/test';
import { test } from 'playwright/fixture/pomFixture';
import { ConsentApiRequests } from 'playwright/api-requests/ConsentApiRequests';
import { TenorApiClient } from 'playwright/api-requests/TenorApiClient';
import { addTimeToNowUtc, env } from 'playwright/util/helper';
import { getConsentRequestId } from './helper/consentHelper';

const DIGDIR_ORG = '991825827';
const MASKINPORTEN_CLIENT_ID_ENV = 'MASKINPORTEN_CLIENT_ID';
const MASKINPORTEN_JWK_ENV = 'MASKINPORTEN_JWK';
const SKATTEETATEN_RESOURCE = 'ske-samtykke-sbl-summert-skattegrunnlag';
// const SKATTEETATEN_MASKINPORTEN_SCOPE = 'skatteetaten:spesifisertsummertskattegrunnlag'; //skatteetaten:summertskattegrunnlag
const SKATTEETATEN_MASKINPORTEN_SCOPE = 'skatteetaten:summertskattegrunnlag';
const REDIRECT_URL = 'https://example.com/';
const APPROVED_REDIRECT_URL = `${REDIRECT_URL}?Status=OK`;
const ENV = env('environment')?.toUpperCase();
const INNTEKTSAAR = 2025;
const FRA_OG_MED = '2025-10';
const TIL_OG_MED = '2026-03';

async function fetchSkattegrunnlag(pid: string, consentToken: string): Promise<Response> {
  const url =
    `https://inntekt.api.skatteetaten-test.no/v1/sbl/${pid}/inntekter` +
    `?fraOgMed=${FRA_OG_MED}&tilOgMed=${TIL_OG_MED}`;
  return fetch(url, { headers: { Authorization: `Bearer ${consentToken}` } });
}

test.describe('Samtykke - Skatteetaten summertSkattegrunnlag', () => {
  test.describe('Privatperson', () => {
    let personPid: string;

    test.beforeAll(async () => {
      const tenor = new TenorApiClient();
      personPid = await tenor.findPersonWithBeregnetSkatt(INNTEKTSAAR);
    });

    test('Godkjenn samtykke og hent skattegrunnlag', async ({ login, consentPage }) => {
      const validTo = addTimeToNowUtc({ days: 5 });
      const api = new ConsentApiRequests(DIGDIR_ORG);

      const consentResp = await test.step('Opprett samtykkeforespørsel', async () => {
        return await api.createConsentRequest({
          from: { type: 'person', id: personPid },
          to: { type: 'org', id: DIGDIR_ORG },
          validToIsoUtc: validTo,
          resourceValue: SKATTEETATEN_RESOURCE,
          redirectUrl: REDIRECT_URL,
          metaData: { inntektsaar: String(INNTEKTSAAR) },
        });
      });

      console.log('consentResp', consentResp);

      await test.step('Åpne samtykkeside og logg inn', async () => {
        await consentPage.open(consentResp.viewUri);
        await login.loginNotChoosingActor(personPid);
        await consentPage.openMenu();
        await consentPage.pickLanguage(consentPage.language);
      });

      await test.step('Godkjenn samtykke', async () => {
        await consentPage.approveStandardAndWaitLogout(APPROVED_REDIRECT_URL);
      });

      await test.step('Hent consent-token og verifiser skattegrunnlag-API (kun TT02)', async () => {
        if (ENV !== 'TT02') return;

        const consentId = getConsentRequestId(consentResp.viewUri);
        const consentToken = await api.getConsentTokenWithMaskinporten(
          consentId,
          `urn:altinn:person:identifier-no:${personPid}`,
          MASKINPORTEN_CLIENT_ID_ENV,
          MASKINPORTEN_JWK_ENV,
          undefined, // consumerOrg is not used for this scope
          SKATTEETATEN_MASKINPORTEN_SCOPE,
        );

        console.log('consentToken', consentToken);
        expect(consentToken).toBeTruthy();

        const response = await fetchSkattegrunnlag(personPid, consentToken);
        console.log('response', response);
        expect(response.ok).toBe(true);
        const data = await response.json();
        console.log('Skatteetaten API response:', JSON.stringify(data, null, 2));
        expect(data).toBeTruthy();
      });
    });
  });

  test.describe('Org', () => {
    let orgNr: string;
    let dagligLederPid: string;

    test.beforeAll(async () => {
      const tenor = new TenorApiClient();
      ({ orgNr, dagligLederPid } = await tenor.findOrgWithBeregnetSkatt(INNTEKTSAAR));
    });

    test('Godkjenn samtykke og hent skattegrunnlag', async ({ login, consentPage }) => {
      const validTo = addTimeToNowUtc({ days: 5 });
      const api = new ConsentApiRequests(DIGDIR_ORG);

      const consentResp = await test.step('Opprett samtykkeforespørsel', async () => {
        return await api.createConsentRequest({
          from: { type: 'org', id: orgNr },
          to: { type: 'org', id: DIGDIR_ORG },
          validToIsoUtc: validTo,
          resourceValue: SKATTEETATEN_RESOURCE,
          redirectUrl: REDIRECT_URL,
          metaData: { inntektsaar: String(INNTEKTSAAR) },
        });
      });

      await test.step('Åpne samtykkeside og logg inn som dagligLeder', async () => {
        await consentPage.open(consentResp.viewUri);
        await login.loginNotChoosingActor(dagligLederPid);
        await consentPage.openMenu();
        await consentPage.pickLanguage(consentPage.language);
      });

      await test.step('Godkjenn samtykke', async () => {
        await consentPage.approveStandardAndWaitLogout(APPROVED_REDIRECT_URL);
      });

      await test.step('Hent consent-token og verifiser skattegrunnlag-API (kun TT02)', async () => {
        if (ENV !== 'TT02') return;

        const consentId = getConsentRequestId(consentResp.viewUri);
        const consentToken = await api.getConsentTokenWithMaskinporten(
          consentId,
          `urn:altinn:organization:identifier-no:${orgNr}`,
          MASKINPORTEN_CLIENT_ID_ENV,
          MASKINPORTEN_JWK_ENV,
          undefined,
          SKATTEETATEN_MASKINPORTEN_SCOPE,
        );
        expect(consentToken).toBeTruthy();

        const response = await fetchSkattegrunnlag(orgNr, consentToken);
        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toBeTruthy();
      });
    });
  });
});
