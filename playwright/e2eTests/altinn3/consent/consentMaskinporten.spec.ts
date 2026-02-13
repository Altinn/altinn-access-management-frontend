import { expect } from '@playwright/test';
import { test } from 'playwright/fixture/pomFixture';
import { Language } from 'playwright/pages/consent/ConsentPage';
import { env, formatUiDateTime } from 'playwright/util/helper';
import { createAndApproveConsent, getConsentRequestId } from './helper/consentHelper.js';
import { scenarioBuilder } from './helper/scenarioBuilder';

const MobileViewport = { width: 375, height: 667 };

// Digdir's org id
const MASKINPORTEN_ORG_DIGDIR = '991825827';
const ENV = env('environment')?.toUpperCase();
const REDIRECT_URL = 'https://example.com/';

function getDigitaliseringsdirektoratetLocator(page: any) {
  return page.getByText('DIGITALISERINGSDIREKTORATET');
}

test.describe('Generate consent request for Digdir using maskinporten to fetch token', () => {
  test.use({ language: Language.NB, viewport: MobileViewport });

  test('Create and approve standard consent with Maskinporten', async ({
    page,
    login,
    consentPage,
  }) => {
    const scenario = scenarioBuilder.personToOrgWithMaskinporten(MASKINPORTEN_ORG_DIGDIR);

    await test.step('Create consent request', async () => {
      await createAndApproveConsent({
        ...scenario,
        page,
        login,
        consentPage,
        resourceValue: 'standard-samtykke-for-dele-data',
        metaData: { inntektsaar: '2028' },
      });
    });

    await test.step('Verify consent UI and expiry', async () => {
      await consentPage.expectStandardIntro();
      await expect(consentPage.textIncomeData).toBeVisible();
      await expect(getDigitaliseringsdirektoratetLocator(page)).toHaveCount(2);
      await consentPage.expectExpiry(formatUiDateTime(scenario.validTo));
    });

    await test.step('Approve consent', async () => {
      await consentPage.approveStandardAndWaitLogout(REDIRECT_URL);
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
    const scenario = scenarioBuilder.personToOrg('altinn:consentrequests.org');

    const consentResponse = await test.step('Create consent request', async () => {
      return await scenario.api.createConsentRequest({
        from: { type: 'person', id: scenario.fromPerson },
        to: { type: 'org', id: scenario.toOrg },
        validToIsoUtc: scenario.validTo,
        resourceValue: 'samtykke-esoknad',
        redirectUrl: REDIRECT_URL,
        metaData: { rente: '4.2', banknavn: 'Testbanken E2E', utloepsar: '2027' },
      });
    });

    await test.step('Open consent page and login', async () => {
      await consentPage.open(consentResponse.viewUri);
      await login.loginNotChoosingActor(scenario.fromPerson);
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
      await consentPage.approveStandardAndWaitLogout(REDIRECT_URL);
    });
  });

  // TT02-only token retrieval
  test.describe('TT02-only token retrieval', () => {
    test.skip(ENV !== 'TT02', 'Consent token fetch only available in TT02');

    test('Fetch consent token after approval', async ({ page, login, consentPage }) => {
      const scenario = scenarioBuilder.personToOrgWithMaskinporten(MASKINPORTEN_ORG_DIGDIR);

      const consentResp = await test.step('Create consent request', async () => {
        return await createAndApproveConsent({
          ...scenario,
          page,
          login,
          consentPage,
          resourceValue: 'standard-samtykke-for-dele-data',
          metaData: { inntektsaar: '2028' },
        });
      });

      await test.step('Verify consent UI', async () => {
        await consentPage.expectStandardIntro();
        await expect(consentPage.textIncomeData).toBeVisible();
        await expect(getDigitaliseringsdirektoratetLocator(page)).toHaveCount(2);
      });

      await test.step('Approve consent', async () => {
        await consentPage.approveStandardAndWaitLogout(REDIRECT_URL);
      });

      await test.step('Fetch consent token', async () => {
        const consentId = getConsentRequestId(consentResp.viewUri);
        const token = await scenario.api.getConsentTokenWithMaskinporten(
          consentId,
          scenario.fromPerson,
          'MASKINPORTEN_CLIENT_ID',
          'MASKINPORTEN_JWK',
        );
        expect(token).toBeTruthy();
        expect(token.length).toBeGreaterThan(10);
      });
    });

    test('Create and approve consent on behalf of organization as a consumer org and fetch token', async ({
      login,
      consentPage,
    }) => {
      test.skip(ENV !== 'TT02', 'Consent token fetch only available in TT02');

      const SPAREBANKEN_ORG_NUMBER = '313876144'; //Dagl 28913749776

      const SPAREBANKEN_DRIFT_ORG_NUMBER = '310149942'; //Dagl: 09906397525

      const scenario = scenarioBuilder.personToOrgWithMaskinportenBehalfOf(
        SPAREBANKEN_DRIFT_ORG_NUMBER,
      );

      const consentResp =
        await test.step('Fetch Maskinporten token for consumer_org and create consent request with toOrg as SPAREBANKEN_ORG_NUMBER', async () => {
          // Use Maskinporten token (from behalf_of client) with consumer_orgno to create consent request
          const { viewUri } = await scenario.api.createConsentRequestWithMaskinporten(
            { type: 'person', id: scenario.fromPerson },
            { type: 'org', id: SPAREBANKEN_ORG_NUMBER },
            'MASKINPORTEN_BEHALF_OF_CLIENT_ID',
            'MASKINPORTEN_BEHALF_OF_JWK',
            SPAREBANKEN_ORG_NUMBER,
          );

          await consentPage.open(viewUri);
          await login.loginNotChoosingActor(scenario.fromPerson);
          await consentPage.pickLanguage(consentPage.language);

          expect(viewUri).toBeTruthy();
          return { viewUri };
        });

      await test.step('Verify consent UI and expiry', async () => {
        await consentPage.expectStandardIntro();
        await expect(consentPage.textIncomeData).toBeVisible();
        await consentPage.expectExpiry(formatUiDateTime(scenario.validTo));
      });

      await test.step('Verify behalf of text is displayed', async () => {
        await expect(
          consentPage.page.getByText(
            'Jovial Konservativ Tiger AS foretar dette oppslaget på vegne av Nyttig Fredfull Struts Ltd.',
          ),
        ).toBeVisible();
      });

      await test.step('Approve consent', async () => {
        await consentPage.approveStandardAndWaitLogout(REDIRECT_URL);
      });

      await test.step('Fetch consent token with consumer_org', async () => {
        const consentId = getConsentRequestId(consentResp.viewUri);

        const token = await scenario.api.getConsentTokenWithMaskinporten(
          consentId,
          scenario.fromPerson,
          'MASKINPORTEN_BEHALF_OF_CLIENT_ID',
          'MASKINPORTEN_BEHALF_OF_JWK',
          SPAREBANKEN_ORG_NUMBER,
        );
        expect(token).toBeTruthy();
        expect(token.length).toBeGreaterThan(10);
      });
    });
  });
});
