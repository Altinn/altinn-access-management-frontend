import { expect } from '@playwright/test';
import { test } from 'playwright/fixture/pomFixture';
import { Language } from 'playwright/pages/consent/ConsentPage';
import { env, formatUiDateTime } from 'playwright/util/helper';
import { createAndApproveConsent, getConsentRequestId } from './helper/consentHelper.js';
import { scenarioBuilder } from './helper/scenarioBuilder';

const DESKTOP = { width: 1920, height: 1080 };

// Digdir's org id
const MASKINPORTEN_ORG_DIGDIR = '991825827';
const ENV = env('environment')?.toUpperCase();

function getDigitaliseringsdirektoratetLocator(page: any) {
  return page.getByText('DIGITALISERINGSDIREKTORATET');
}

test.describe('Generate consent request for Digdir using maskinporten to fetch token', () => {
  test.use({ language: Language.NB, viewport: DESKTOP });

  test('Create and approve standard consent with Maskinporten', async ({
    page,
    login,
    consentPage,
  }) => {
    const scenario = scenarioBuilder.personToOrgWithMaskinporten(MASKINPORTEN_ORG_DIGDIR);
    await createAndApproveConsent({
      ...scenario,
      page,
      login,
      consentPage,
      resourceValue: 'standard-samtykke-for-dele-data',
      metaData: { inntektsaar: '2028' },
    });

    await test.step('Verify UI text + expiry', async () => {
      await consentPage.expectStandardIntro();
      await expect(consentPage.textIncomeData).toBeVisible();
      await expect(getDigitaliseringsdirektoratetLocator(page)).toHaveCount(2);
      await consentPage.expectExpiry(formatUiDateTime(scenario.validTo));
    });

    await consentPage.approveStandardAndWaitLogout('https://example.com/');
  });

  // TT02-only token retrieval
  test.describe('TT02-only token retrieval', () => {
    test.skip(ENV !== 'TT02', 'Consent token fetch only available in TT02');

    test('Fetch consent token after approval', async ({ page, login, consentPage }) => {
      const scenario = scenarioBuilder.personToOrgWithMaskinporten(MASKINPORTEN_ORG_DIGDIR);
      const consentResp = await createAndApproveConsent({
        ...scenario,
        page,
        login,
        consentPage,
        resourceValue: 'standard-samtykke-for-dele-data',
        metaData: { inntektsaar: '2028' },
      });

      await consentPage.expectStandardIntro();
      await expect(consentPage.textIncomeData).toBeVisible();
      await expect(getDigitaliseringsdirektoratetLocator(page)).toHaveCount(2);
      await consentPage.approveStandardAndWaitLogout('https://example.com/');

      const consentId = getConsentRequestId(consentResp.viewUri);
      const token = await scenario.api.getConsentTokenWithMaskinporten(
        consentId,
        scenario.fromPerson,
        scenario.mpToken,
      );
      expect(token).toBeTruthy();
      expect(token.length).toBeGreaterThan(10);
    });

    test('Create and approve consent with behalf_of Maskinporten client and fetch token', async ({
      page,
      login,
      consentPage,
    }) => {
      //The org that must delegate scope to the maskinporten client. Not used.
      // Will this org send the consent request or will the consumer org do that as well? not sure.
      const toOrg = '313876144';

      const consumerOrg = '310149942';

      const scenario = scenarioBuilder.personToOrgWithMaskinportenBehalfOf(consumerOrg);

      const consentResp = await createAndApproveConsent({
        ...scenario,
        page,
        login,
        consentPage,
        resourceValue: 'standard-samtykke-for-dele-data',
        metaData: { inntektsaar: '2028' },
      });

      expect(consentResp.viewUri).toBeTruthy();

      await test.step('Verify UI text + expiry', async () => {
        await consentPage.expectStandardIntro();
        await expect(consentPage.textIncomeData).toBeVisible();
        await consentPage.expectExpiry(formatUiDateTime(scenario.validTo));
      });

      await consentPage.approveStandardAndWaitLogout('https://example.com/');

      const consentId = getConsentRequestId(consentResp.viewUri);
      const token = await scenario.api.getConsentTokenWithMaskinporten(
        consentId,
        scenario.fromPerson,
        scenario.mpToken,
        consumerOrg,
      );
      expect(token).toBeTruthy();
      expect(token.length).toBeGreaterThan(10);
    });
  });

  test('Create and approve simple consent (enkelt-samtykke)', async ({
    page,
    login,
    consentPage,
  }) => {
    const resp = await createAndApproveConsent({
      ...scenarioBuilder.personToOrgWithMaskinporten(MASKINPORTEN_ORG_DIGDIR),
      page,
      login,
      consentPage,
      resourceValue: 'enkelt-samtykke',
      metaData: { simpletag: 'Maskinporten E2E test' },
    });

    expect(resp.viewUri).toBeTruthy();

    await consentPage.expectEnkeltIntro();
    await expect(consentPage.textDataUsage).toBeVisible();
    await expect(consentPage.textDataProtection).toBeVisible();
    await expect(getDigitaliseringsdirektoratetLocator(page)).toBeVisible();

    await consentPage.approveStandardAndWaitLogout('https://example.com/');
  });
});
