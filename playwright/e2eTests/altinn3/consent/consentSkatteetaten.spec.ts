import { expect } from '@playwright/test';
import { test } from 'playwright/fixture/pomFixture';
import { ConsentApiRequests } from 'playwright/api-requests/ConsentApiRequests';
import { TenorApiClient } from 'playwright/api-requests/TenorApiClient';
import { addTimeToNowUtc, env } from 'playwright/util/helper';
import { getConsentRequestId } from './helper/consentHelper';

const DIGDIR_ORG = '991825827';
const MASKINPORTEN_CLIENT_ID_ENV = 'MASKINPORTEN_CLIENT_ID';
const MASKINPORTEN_JWK_ENV = 'MASKINPORTEN_JWK';
const SKATTEETATEN_RESOURCE = 'ske-samtykke-krav-og-betalinger';
const SKATTEETATEN_MASKINPORTEN_SCOPE = 'skatteetaten:kravogbetalinger';
const REDIRECT_URL = 'https://example.com/';
const APPROVED_REDIRECT_URL = `${REDIRECT_URL}?Status=OK`;
const ENV = env('environment')?.toUpperCase();

async function fetchKravOgBetalinger(
  norskIdentifikator: string,
  consentToken: string,
): Promise<Response> {
  const url = `https://kravogbetalinger.api.skatteetaten-test.no/v1/finans/${norskIdentifikator}/aapnekrav`;
  return fetch(url, { headers: { Authorization: `Bearer ${consentToken}` } });
}

test.describe('Samtykke - Skatteetaten krav og betalinger ende til ende', () => {
  test.describe('Org', () => {
    let orgNr: string;
    let dagligLederPid: string;

    test.beforeAll(async () => {
      const tenor = new TenorApiClient();
      ({ orgNr, dagligLederPid } = await tenor.findOrgWithSamletReskontroinnsyn());
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

      await test.step('Hent consent-token og verifiser krav-og-betalinger-API (kun TT02)', async () => {
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

        const response = await fetchKravOgBetalinger(orgNr, consentToken);
        const responseText = await response.text();
        expect(response.ok).toBe(true);
        expect(JSON.parse(responseText)).toBeTruthy();
      });
    });
  });
});
