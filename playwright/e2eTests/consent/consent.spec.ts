import { expect } from '@playwright/test';
import { test } from 'playwright/fixture/pomFixture';

import { Language } from 'playwright/pages/consent/ConsentPage';
import { formatUiDateTime } from 'playwright/util/helper';
import { scenarioBuilder } from './helper/scenarioBuilder';

const redirectUrl = 'https://example.com/';

const languages = [Language.NB, Language.NN, Language.EN];
const mobileViewport = { width: 375, height: 667 };

languages.forEach((language) => {
  test.describe(`Samtykke - fra person til org (${language})`, () => {
    test.use({
      language,
      viewport: mobileViewport,
    });
    test(`Standard samtykke`, async ({ login, consentPage }, testInfo) => {
      const scenario = scenarioBuilder.personToOrg();

      const consentResponse = await test.step('Create consent request', async () => {
        return await scenario.api.createConsentRequest({
          from: { type: 'person', id: scenario.fromPerson },
          to: { type: 'org', id: scenario.toOrg },
          validToIsoUtc: scenario.validTo,
          resourceValue: 'standard-samtykke-for-dele-data',
          redirectUrl,
          metaData: { inntektsaar: '2028' },
        });
      });
      console.log(
        '\nTestscenario: ' +
          testInfo.title +
          '\nPerson som skal gjøre samtykke: ' +
          scenario.fromPerson +
          '\nSamtykke-URL ' +
          consentResponse.viewUri,
      );

      await test.step('Open consent page and login', async () => {
        await consentPage.open(consentResponse.viewUri);
        await login.loginNotChoosingActor(scenario.fromPerson);
      });

      await test.step('Pick language', async () => {
        await consentPage.pickLanguage(consentPage.language);
      });

      await test.step('Verify consent UI and expiry', async () => {
        await consentPage.expectStandardIntro();
        await expect(consentPage.textIncomeData).toBeVisible();
        const expected = formatUiDateTime(scenario.validTo);
        await consentPage.expectExpiry(expected);
      });

      await test.step('Approve consent', async () => {
        await consentPage.approveStandardAndWaitLogout(redirectUrl);
      });
    });

    test(`Krav-template`, async ({ page, consentPage, login }, testInfo) => {
      const scenario = scenarioBuilder.personToOrg();

      const consentResponse = await test.step('Create consent request', async () => {
        return await scenario.api.createConsentRequest({
          from: { type: 'person', id: scenario.fromPerson },
          to: { type: 'org', id: scenario.toOrg },
          validToIsoUtc: scenario.validTo,
          resourceValue: 'samtykke-brukerstyrt-tilgang',
          redirectUrl,
          metaData: { brukerdata: 'AutomatisertTiltakE2E' },
        });
      });
      console.log(
        '\nTestscenario: ' +
          testInfo.title +
          '\nPerson som skal gjøre samtykke: ' +
          scenario.fromPerson +
          '\nSamtykke-URL ' +
          consentResponse.viewUri,
      );

      await test.step('Open consent page and login', async () => {
        await consentPage.open(consentResponse.viewUri);
        await login.loginNotChoosingActor(scenario.fromPerson);
      });

      await test.step('Pick language', async () => {
        await consentPage.pickLanguage(consentPage.language);
      });

      await test.step('Verify consent UI and expiry', async () => {
        await consentPage.expectKravIntro();
        const expected = formatUiDateTime(scenario.validTo);
        await consentPage.expectExpiry(expected);
      });

      await test.step('Approve consent', async () => {
        await consentPage.approveStandardAndWaitLogout(redirectUrl);
      });
    });

    test(`Fullmakt utføre tjeneste`, async ({ consentPage, page, login }, testInfo) => {
      const scenario = scenarioBuilder.personToOrg();

      const consentResponse = await test.step('Create consent request', async () => {
        return await scenario.api.createConsentRequest({
          from: { type: 'person', id: scenario.fromPerson },
          to: { type: 'org', id: scenario.toOrg },
          validToIsoUtc: scenario.validTo,
          resourceValue: 'samtykke-fullmakt-utfoere-tjeneste',
          redirectUrl,
          metaData: { tiltak: '2024' },
        });
      });
      console.log(
        '\nTestscenario: ' +
          testInfo.title +
          '\nPerson som skal gjøre samtykke: ' +
          scenario.fromPerson +
          '\nSamtykke-URL ' +
          consentResponse.viewUri,
      );

      await test.step('Open consent page and login', async () => {
        await consentPage.open(consentResponse.viewUri);
        await login.loginNotChoosingActor(scenario.fromPerson);
      });

      await test.step('Pick language', async () => {
        await consentPage.pickLanguage(consentPage.language);
      });

      await test.step('Verify consent UI and expiry', async () => {
        await consentPage.expectFullmaktIntro();
        await expect(consentPage.textFullmaktHeading).toBeVisible();
        await expect(consentPage.textFullmaktService).toBeVisible();
        await expect(page.getByText('Tiltak: 2024')).toBeVisible();
        const expected = formatUiDateTime(scenario.validTo);
        await consentPage.expectFullmaktExpiry();
        await consentPage.expectExpiryDate(expected);
      });

      await test.step('Approve consent', async () => {
        await consentPage.approveFullmaktAndWaitLogout(redirectUrl);
      });
    });

    test(`Lånesøknad`, async ({ consentPage, page, login }, testInfo) => {
      const scenario = scenarioBuilder.personToOrg();

      const consentResponse = await test.step('Create consent request', async () => {
        return await scenario.api.createConsentRequest({
          from: { type: 'person', id: scenario.fromPerson },
          to: { type: 'org', id: scenario.toOrg },
          validToIsoUtc: scenario.validTo,
          resourceValue: 'samtykke-laanesoeknad',
          redirectUrl,
          metaData: { rente: '4.2', banknavn: 'Testbanken E2E', utloepsar: '2027' },
        });
      });
      console.log(
        '\nTestscenario: ' +
          testInfo.title +
          '\nPerson som skal gjøre samtykke: ' +
          scenario.fromPerson +
          '\nSamtykke-URL ' +
          consentResponse.viewUri,
      );

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
        await consentPage.approveStandardAndWaitLogout(redirectUrl);
      });
    });

    test(`Enkelt samtykke`, async ({ consentPage, page, login }, testInfo) => {
      const scenario = scenarioBuilder.personToOrg();

      const consentResponse = await test.step('Create consent request', async () => {
        return await scenario.api.createConsentRequest({
          from: { type: 'person', id: scenario.fromPerson },
          to: { type: 'org', id: scenario.toOrg },
          validToIsoUtc: scenario.validTo,
          resourceValue: 'enkelt-samtykke',
          redirectUrl,
          metaData: { simpletag: 'E2E Playwright metadata for simpletag' },
        });
      });
      console.log(
        '\nTestscenario: ' +
          testInfo.title +
          '\nPerson som skal gjøre samtykke: ' +
          scenario.fromPerson +
          '\nSamtykke-URL ' +
          consentResponse.viewUri,
      );

      await test.step('Open consent page and login', async () => {
        await consentPage.open(consentResponse.viewUri);
        await login.loginNotChoosingActor(scenario.fromPerson);
      });

      await test.step('Pick language', async () => {
        await consentPage.pickLanguage(consentPage.language);
      });

      await test.step('Verify consent UI', async () => {
        await consentPage.expectEnkeltIntro();
        await expect(consentPage.textDataUsage).toBeVisible();
        await expect(consentPage.textDataProtection).toBeVisible();
        await expect(
          consentPage.getMetadataText('E2E Playwright metadata for simpletag'),
        ).toBeVisible();
        await expect(consentPage.textOneTimeUse).toBeVisible();
      });

      await test.step('Approve consent', async () => {
        await consentPage.approveStandardAndWaitLogout(redirectUrl);
      });
    });

    test(`Avvis samtykke`, async ({ consentPage, login }, testInfo) => {
      const scenario = scenarioBuilder.personToOrg();

      const consentResponse = await test.step('Create consent request', async () => {
        return await scenario.api.createConsentRequest({
          from: { type: 'person', id: scenario.fromPerson },
          to: { type: 'org', id: scenario.toOrg },
          validToIsoUtc: scenario.validTo,
          resourceValue: 'enkelt-samtykke',
          redirectUrl,
          metaData: { simpletag: 'E2E reject test' },
        });
      });
      console.log(
        '\nTestscenario: ' +
          testInfo.title +
          '\nPerson som skal gjøre samtykke: ' +
          scenario.fromPerson +
          '\nSamtykke-URL ' +
          consentResponse.viewUri,
      );

      await test.step('Open consent page and login', async () => {
        await consentPage.open(consentResponse.viewUri);
        await login.loginNotChoosingActor(scenario.fromPerson);
      });

      await test.step('Pick language', async () => {
        await consentPage.pickLanguage(consentPage.language);
      });

      await test.step('Verify consent request heading', async () => {
        await expect(consentPage.textConsentRequestHeading).toBeVisible();
      });

      await test.step('Reject consent', async () => {
        await consentPage.rejectStandardAndWaitLogout(redirectUrl);
      });
    });
  });
});
