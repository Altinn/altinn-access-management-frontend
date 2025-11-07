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
    test(`Standard samtykke`, async ({ login, consentPage }) => {
      const scenario = scenarioBuilder.personToOrg();
      const consentResponse = await scenario.api.createConsentRequest({
        from: { type: 'person', id: scenario.fromPerson },
        to: { type: 'org', id: scenario.toOrg },
        validToIsoUtc: scenario.validTo,
        resourceValue: 'standard-samtykke-for-dele-data',
        redirectUrl,
        metaData: { inntektsaar: '2028' },
      });

      await consentPage.open(consentResponse.viewUri);
      await login.loginNotChoosingActor(scenario.fromPerson);

      await consentPage.pickLanguage(consentPage.language);

      await consentPage.expectStandardIntro();
      await expect(consentPage.textIncomeData).toBeVisible();

      const expected = formatUiDateTime(scenario.validTo);
      await consentPage.expectExpiry(expected);

      await consentPage.approveStandardAndWaitLogout(redirectUrl);
    });

    test(`Krav-template`, async ({ page, consentPage, login }) => {
      const scenario = scenarioBuilder.personToOrg();
      const consentResponse = await scenario.api.createConsentRequest({
        from: { type: 'person', id: scenario.fromPerson },
        to: { type: 'org', id: scenario.toOrg },
        validToIsoUtc: scenario.validTo,
        resourceValue: 'samtykke-brukerstyrt-tilgang',
        redirectUrl,
        metaData: { brukerdata: 'AutomatisertTiltakE2E' },
      });

      await consentPage.open(consentResponse.viewUri);
      await login.loginNotChoosingActor(scenario.fromPerson);

      await consentPage.pickLanguage(consentPage.language);

      await consentPage.expectKravIntro();

      const expected = formatUiDateTime(scenario.validTo);
      await consentPage.expectExpiry(expected);

      await consentPage.approveStandardAndWaitLogout(redirectUrl);
    });

    test(`Fullmakt utføre tjeneste`, async ({ consentPage, page, login }) => {
      const scenario = scenarioBuilder.personToOrg();
      const consentResponse = await scenario.api.createConsentRequest({
        from: { type: 'person', id: scenario.fromPerson },
        to: { type: 'org', id: scenario.toOrg },
        validToIsoUtc: scenario.validTo,
        resourceValue: 'samtykke-fullmakt-utfoere-tjeneste',
        redirectUrl,
        metaData: { tiltak: '2024' },
      });

      await consentPage.open(consentResponse.viewUri);
      await login.loginNotChoosingActor(scenario.fromPerson);

      await consentPage.pickLanguage(consentPage.language);

      await consentPage.expectFullmaktIntro();
      await expect(consentPage.textFullmaktHeading).toBeVisible();
      await expect(consentPage.textFullmaktService).toBeVisible();
      await expect(page.getByText('Tiltak: 2024')).toBeVisible();

      const expected = formatUiDateTime(scenario.validTo);
      await consentPage.expectFullmaktExpiry();
      await consentPage.expectExpiryDate(expected);

      await consentPage.approveFullmaktAndWaitLogout(redirectUrl);
    });

    test(`Lånesøknad`, async ({ consentPage, page, login }) => {
      const scenario = scenarioBuilder.personToOrg();
      const consentResponse = await scenario.api.createConsentRequest({
        from: { type: 'person', id: scenario.fromPerson },
        to: { type: 'org', id: scenario.toOrg },
        validToIsoUtc: scenario.validTo,
        resourceValue: 'samtykke-laanesoeknad',
        redirectUrl,
        metaData: { rente: '4.2', banknavn: 'Testbanken E2E', utloepsar: '2027' },
      });

      await consentPage.open(consentResponse.viewUri);
      await login.loginNotChoosingActor(scenario.fromPerson);

      await consentPage.pickLanguage(consentPage.language);

      await consentPage.expectStandardIntro();
      await expect(consentPage.textLoanApplication).toBeVisible();
      await expect(consentPage.getInterestRateText('4.2')).toBeVisible();
      await expect(consentPage.getExpirationYearText('2027')).toBeVisible();
      await expect(consentPage.getBankNameText('Testbanken E2E')).toBeVisible();

      await expect(consentPage.textOneTimeDelivery).toBeVisible();

      await consentPage.approveStandardAndWaitLogout(redirectUrl);
    });

    test(`Enkelt samtykke`, async ({ consentPage, page, login }) => {
      const scenario = scenarioBuilder.personToOrg();
      const consentResponse = await scenario.api.createConsentRequest({
        from: { type: 'person', id: scenario.fromPerson },
        to: { type: 'org', id: scenario.toOrg },
        validToIsoUtc: scenario.validTo,
        resourceValue: 'enkelt-samtykke',
        redirectUrl,
        metaData: { simpletag: 'E2E Playwright metadata for simpletag' },
      });

      await consentPage.open(consentResponse.viewUri);
      await login.loginNotChoosingActor(scenario.fromPerson);

      await consentPage.pickLanguage(consentPage.language);

      await consentPage.expectEnkeltIntro();
      await expect(consentPage.textDataUsage).toBeVisible();
      await expect(consentPage.textDataProtection).toBeVisible();
      await expect(
        consentPage.getMetadataText('E2E Playwright metadata for simpletag'),
      ).toBeVisible();

      await expect(consentPage.textOneTimeUse).toBeVisible();
      await consentPage.approveStandardAndWaitLogout(redirectUrl);
    });

    test(`Avvis samtykke`, async ({ consentPage, login }) => {
      const scenario = scenarioBuilder.personToOrg();
      const consentResponse = await scenario.api.createConsentRequest({
        from: { type: 'person', id: scenario.fromPerson },
        to: { type: 'org', id: scenario.toOrg },
        validToIsoUtc: scenario.validTo,
        resourceValue: 'enkelt-samtykke',
        redirectUrl,
        metaData: { simpletag: 'E2E reject test' },
      });

      await consentPage.open(consentResponse.viewUri);
      await login.loginNotChoosingActor(scenario.fromPerson);

      await consentPage.pickLanguage(consentPage.language);

      await expect(consentPage.textConsentRequestHeading).toBeVisible();
      await consentPage.rejectStandardAndWaitLogout(redirectUrl);
    });
  });
});

languages.forEach((language) => {
  test.describe(`Samtykke fra organisasjon til organisasjon: (${language})`, () => {
    test.use({
      language,
      viewport: mobileViewport,
    });

    test(`Skal kunne godkjenne samtykke med Utfyller/innsender-rollen (${language})`, async ({
      consentPage,
      login,
    }) => {
      // Create consent request from one org to another org
      // For å godkjenne her kreves det at ressursen i ressursregisteret er satt opp med utfyller/innsender-rollen for org til org-samtykke
      const scenario = scenarioBuilder.orgToOrg();
      const consentResponse = await scenario.api.createConsentRequest({
        from: { type: 'org', id: scenario.fromOrg },
        to: { type: 'org', id: scenario.toOrg },
        validToIsoUtc: scenario.validTo,
        resourceValue: 'standard-samtykke-for-dele-data',
        redirectUrl,
        metaData: { inntektsaar: '2028' },
      });

      await consentPage.open(consentResponse.viewUri);
      await login.loginNotChoosingActor(scenario.fromPerson);

      await consentPage.pickLanguage(consentPage.language);

      await expect(consentPage.textIncomeData).toBeVisible();

      const expected = formatUiDateTime(scenario.validTo);
      await consentPage.expectExpiry(expected);

      // Verify metadata is displayed
      await expect(consentPage.getIncomeYearText('2028')).toBeVisible();

      // Approve the consent
      await consentPage.approveStandardAndWaitLogout(redirectUrl);
    });
  });
});
