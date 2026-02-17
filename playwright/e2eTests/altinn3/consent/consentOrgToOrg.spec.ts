import { expect } from '@playwright/test';
import { test } from 'playwright/fixture/pomFixture';

import { Language } from 'playwright/pages/consent/ConsentPage';
import { formatUiDateTime } from 'playwright/util/helper';
import { scenarioBuilder } from './helper/scenarioBuilder';

const REDIRECT_URL = 'https://example.com/';
const APPROVED_REDIRECT_URL = `${REDIRECT_URL}?Status=OK`;

const LANGUAGES = [Language.NB, Language.NN, Language.EN];
const MOBILE_VIEWPORT = { width: 375, height: 667 };

LANGUAGES.forEach((language) => {
  test.describe(`Samtykke fra organisasjon til organisasjon: (${language})`, () => {
    test.use({
      language,
      viewport: MOBILE_VIEWPORT,
    });

    test(`Skal kunne godkjenne samtykke med Utfyller/innsender-rollen (${language})`, async ({
      consentPage,
      login,
    }) => {
      // Create consent request from one org to another org
      // For å godkjenne her kreves det at ressursen i ressursregisteret er satt opp med utfyller/innsender-rollen for org til org-samtykke
      const scenario = scenarioBuilder.orgToOrg();

      const consentResponse = await test.step('Create consent request', async () => {
        return await scenario.api.createConsentRequest({
          from: { type: 'org', id: scenario.fromOrg },
          to: { type: 'org', id: scenario.toOrg },
          validToIsoUtc: scenario.validTo,
          resourceValue: 'standard-samtykke-for-dele-data',
          redirectUrl: REDIRECT_URL,
          metaData: { inntektsaar: '2028' },
        });
      });

      await test.step('Open consent page and login', async () => {
        await consentPage.open(consentResponse.viewUri);
        await login.loginNotChoosingActor(scenario.fromPerson);
      });

      await test.step('Pick language', async () => {
        await consentPage.pickLanguage(consentPage.language);
      });

      await test.step('Verify consent UI and expiry', async () => {
        await expect(consentPage.textIncomeData).toBeVisible();
        const expected = formatUiDateTime(scenario.validTo);
        await consentPage.expectExpiry(expected);
        await expect(consentPage.getIncomeYearText('2028')).toBeVisible();
      });

      await test.step('Approve consent', async () => {
        await consentPage.approveStandardAndWaitLogout(APPROVED_REDIRECT_URL);
      });
    });
  });
});
