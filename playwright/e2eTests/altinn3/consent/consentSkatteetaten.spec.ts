import { test, expect } from 'playwright/fixture/pomFixture';
import { ConsentApiRequests } from 'playwright/api-requests/ConsentApiRequests';
import { addTimeToNowUtc, env } from 'playwright/util/helper';
import { getConsentRequestId } from './helper/consentHelper';
import { fetchKrav } from 'playwright/api-requests/SkatteetatenApiRequests';

const DIGDIR_ORG = '991825827';
const MASKINPORTEN_CLIENT_ID_ENV = 'MASKINPORTEN_CLIENT_ID';
const MASKINPORTEN_JWK_ENV = 'MASKINPORTEN_JWK';
const SKATTEETATEN_RESOURCE = 'ske-samtykke-krav-og-betalinger';
const SKATTEETATEN_MASKINPORTEN_SCOPE = 'skatteetaten:kravogbetalinger';
const REDIRECT_URL = 'https://example.com/';
const APPROVED_REDIRECT_URL = `${REDIRECT_URL}?Status=OK`;
const ENV = env('environment')?.toUpperCase();

test.describe('Samtykke - Skatteetaten krav og betalinger ende til ende', () => {
  test.describe('Org', () => {
    test.skip(ENV !== 'TT02', 'Kun TT02');
    const orgNr = '313506673'; // Org med krav og betalinger
    const pid = '02925796975'; // innehaver

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
        await login.loginNotChoosingActor(pid);
        await consentPage.openMenu();
        await consentPage.pickLanguage(consentPage.language);
      });

      await test.step('Godkjenn samtykke', async () => {
        await consentPage.approveStandardAndWaitLogout(APPROVED_REDIRECT_URL);
      });

      await test.step('Hent consent-token og verifiser krav-og-betalinger-API', async () => {
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

        const response = await fetchKrav(orgNr, consentToken);
        expect(response.status).toBe(200);
      });
    });
  });
});
