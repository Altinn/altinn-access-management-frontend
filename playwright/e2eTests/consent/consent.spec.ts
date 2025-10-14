import { expect } from '@playwright/test';
import { test } from 'playwright/fixture/pomFixture';

import { ConsentApiRequests } from '../../api-requests/ConsentApiRequests';
import { fromPersons, toOrgs, fromOrgs } from './consentTestdata';
import { Language } from 'playwright/pages/consent/ConsentPage';
import { addTimeToNowUtc, formatUiDateTime } from 'playwright/util/helper';

test.describe.configure({ timeout: 10000 });

const redirectUrl = 'https://example.com/';

// Test matrix for mobile viewport with different languages
const languages = [Language.NB, Language.NN, Language.EN];
const mobileViewport = { width: 375, height: 667 };

let api: ConsentApiRequests;
let validToTimestamp: string;
let fromPerson: string;
let toOrg: string;

test.beforeEach(async ({}) => {
  api = new ConsentApiRequests();
  validToTimestamp = addTimeToNowUtc({ years: 1 });

  const pickRandom = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  fromPerson = pickRandom(fromPersons);
  toOrg = pickRandom(toOrgs);

  // Used to fetch valid token for org when creatnig consent request
  process.env.ORG = toOrg;
});

languages.forEach((language) => {
  test.describe(`Samtykke`, () => {
    test.use({
      language,
      viewport: mobileViewport,
    });
    test(`Standard samtykke (${language})`, async ({ page, login, consentPage }) => {
      const consentResponse = await api.createConsentRequest({
        from: { type: 'person', id: fromPerson },
        to: { type: 'org', id: toOrg },
        validToIsoUtc: validToTimestamp,
        resourceValue: 'standard-samtykke-for-dele-data',
        redirectUrl,
        metaData: { inntektsaar: '2028' },
      });

      await consentPage.open(consentResponse.viewUri);
      await login.loginAsActorPid(fromPerson);

      await consentPage.pickLanguage(consentPage.language);

      await consentPage.expectStandardIntro();
      await expect(consentPage.textIncomeData).toBeVisible();

      const expected = formatUiDateTime(validToTimestamp);
      await consentPage.expectExpiry(expected);

      await consentPage.approveStandardAndWaitLogout(redirectUrl);
    });

    test(`Krav-template (${language})`, async ({ page, consentPage, login }) => {
      const consentResponse = await api.createConsentRequest({
        from: { type: 'person', id: fromPerson },
        to: { type: 'org', id: toOrg },
        validToIsoUtc: validToTimestamp,
        resourceValue: 'samtykke-brukerstyrt-tilgang',
        redirectUrl,
        metaData: { brukerdata: 'AutomatisertTiltakE2E' },
      });

      await consentPage.open(consentResponse.viewUri);
      await login.loginAsActorPid(fromPerson);

      await consentPage.pickLanguage(consentPage.language);

      await consentPage.expectKravIntro();

      const expected = formatUiDateTime(validToTimestamp);
      await consentPage.expectExpiry(expected);

      await consentPage.approveStandardAndWaitLogout(redirectUrl);
    });

    test(`Fullmakt utføre tjeneste (${language})`, async ({ consentPage, page, login }) => {
      const consentResponse = await api.createConsentRequest({
        from: { type: 'person', id: fromPerson },
        to: { type: 'org', id: toOrg },
        validToIsoUtc: validToTimestamp,
        resourceValue: 'samtykke-fullmakt-utfoere-tjeneste',
        redirectUrl,
        metaData: { tiltak: '2024' },
      });

      await consentPage.open(consentResponse.viewUri);
      await login.loginAsActorPid(fromPerson);

      await consentPage.pickLanguage(consentPage.language);

      await consentPage.expectFullmaktIntro();
      await expect(consentPage.textFullmaktHeading).toBeVisible();
      await expect(consentPage.textFullmaktService).toBeVisible();
      await expect(page.getByText('Tiltak: 2024')).toBeVisible();

      const expected = formatUiDateTime(validToTimestamp);
      await consentPage.expectFullmaktExpiry();
      await consentPage.expectExpiryDate(expected);

      await consentPage.approveFullmaktAndWaitLogout(redirectUrl);
    });

    test(`Lånesøknad (${language})`, async ({ consentPage, page, login }) => {
      const consentResponse = await api.createConsentRequest({
        from: { type: 'person', id: fromPerson },
        to: { type: 'org', id: toOrg },
        validToIsoUtc: validToTimestamp,
        resourceValue: 'samtykke-laanesoeknad',
        redirectUrl,
        metaData: { rente: '4.2', banknavn: 'Testbanken E2E', utloepsar: '2027' },
      });

      await consentPage.open(consentResponse.viewUri);
      await login.loginAsActorPid(fromPerson);

      await consentPage.languagePicker.click();
      await consentPage.norwegian.click();

      await consentPage.expectStandardIntro();
      await expect(
        page.getByText(
          'Du samtykker til at søknadsdata kan brukes i forbindelse med låneprosessen',
        ),
      ).toBeVisible();
      await expect(page.getByText('Rente: 4.2')).toBeVisible();
      await expect(page.getByText('utloepsar: 2027')).toBeVisible();
      await expect(page.getByText('Bank: Testbanken E2E')).toBeVisible();
      await expect(
        page.getByText('Samtykket gjelder én gangs utlevering av opplysningene'),
      ).toBeVisible();

      await consentPage.approveStandardAndWaitLogout(redirectUrl);
    });

    test(`Enkelt samtykke (${language})`, async ({ consentPage, page, login }) => {
      const consentResponse = await api.createConsentRequest({
        from: { type: 'person', id: fromPerson },
        to: { type: 'org', id: toOrg },
        validToIsoUtc: validToTimestamp,
        resourceValue: 'enkelt-samtykke',
        redirectUrl,
        metaData: { simpletag: 'E2E Playwright metadata for simpletag' },
      });

      await consentPage.open(consentResponse.viewUri);
      await login.loginAsActorPid(fromPerson);

      await consentPage.languagePicker.click();
      await consentPage.norwegian.click();

      await consentPage.expectEnkeltIntro();
      await expect(
        page.getByText('Du samtykker til at dine data kan brukes i denne tjenesten'),
      ).toBeVisible();
      await expect(page.getByText('vi tar vare på dine data')).toBeVisible();
      await expect(page.getByText('metadata: E2E Playwright metadata for simpletag')).toBeVisible();

      await expect(page.getByText('Samtykket gjelder én gangs bruk')).toBeVisible();
      await consentPage.approveStandardAndWaitLogout(redirectUrl);
    });

    test(`Avvis samtykke (${language})`, async ({ consentPage, login }) => {
      const consentResponse = await api.createConsentRequest({
        from: { type: 'person', id: fromPerson },
        to: { type: 'org', id: toOrg },
        validToIsoUtc: validToTimestamp,
        resourceValue: 'enkelt-samtykke',
        redirectUrl,
        metaData: { simpletag: 'E2E reject test' },
      });

      await consentPage.open(consentResponse.viewUri);
      await login.loginAsActorPid(fromPerson);

      await consentPage.languagePicker.click();
      await consentPage.norwegian.click();

      await expect(consentPage.heading('Forespørsel om samtykke')).toBeVisible();
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

    let fromOrg: string;
    let toOrg: string;
    let fromPerson: string; // daglig leder of the requesting org

    test.beforeEach(async ({}) => {
      const pickRandom = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
      [fromOrg, fromPerson] = pickRandom(fromOrgs);
      toOrg = pickRandom(toOrgs);

      // Used to fetch valid token for org when creating consent request
      process.env.ORG = toOrg;
    });

    test(`Skal kunne godkjenne samtykke med Utfyller/innsender-rollen (${language})`, async ({
      page,
      consentPage,
      login,
    }) => {
      // Create consent request from one org to another org
      // For å godkjenne her kreves det at ressursen i ressursregisteret er satt opp med utfyller/innsender-rollen for org til org-samtykke
      const consentResponse = await api.createConsentRequest({
        from: { type: 'org', id: fromOrg },
        to: { type: 'org', id: toOrg },
        validToIsoUtc: validToTimestamp,
        resourceValue: 'standard-samtykke-for-dele-data',
        redirectUrl,
        metaData: { inntektsaar: '2028' },
      });

      // Navigate to the consent page
      await consentPage.open(consentResponse.viewUri);
      await login.loginAsActorPid(fromPerson);

      // Pick language
      await consentPage.pickLanguage(consentPage.language);

      await expect(consentPage.textIncomeData).toBeVisible();

      const expected = formatUiDateTime(validToTimestamp);
      await consentPage.expectExpiry(expected);

      // Verify metadata is displayed
      await expect(page.getByText('inntektsaar: 2028')).toBeVisible();

      // Approve the consent
      await consentPage.approveStandardAndWaitLogout(redirectUrl);
    });
  });
});
