import { expect } from '@playwright/test';
import { test } from 'playwright/fixture/pomFixture';

import { ConsentApiRequests } from 'playwright/api-requests/ConsentApiRequests';
import { Language } from 'playwright/pages/consent/ConsentPage';
import { addTimeToNowUtc, formatUiDateTime, pickRandom } from 'playwright/util/helper';
import { fromPersons, toOrgs } from './helper/consentTestdata';

const REDIRECT_URL = 'https://example.com/';
const APPROVED_REDIRECT_URL = `${REDIRECT_URL}?Status=OK`;
const REJECTED_REDIRECT_URL = `${REDIRECT_URL}?Status=Failed&ErrorMessage=User+did+not+give+consent`;

const LANGUAGES = [Language.NB, Language.NN, Language.EN];
const MOBILE_VIEWPORT = { width: 375, height: 667 };

LANGUAGES.forEach((language) => {
  test.describe(`Samtykke - fra person til org (${language})`, () => {
    test.use({
      language,
      viewport: MOBILE_VIEWPORT,
    });
    test(`Standard samtykke`, async ({ login, consentPage }) => {
      const fromPerson = pickRandom(fromPersons);
      const toOrg = pickRandom(toOrgs);
      const validTo = addTimeToNowUtc({ days: 2 });
      const api = new ConsentApiRequests(toOrg);

      const consentResponse = await test.step('Create consent request', async () => {
        return await api.createConsentRequest({
          from: { type: 'person', id: fromPerson },
          to: { type: 'org', id: toOrg },
          validToIsoUtc: validTo,
          resourceValue: 'standard-samtykke-for-dele-data',
          redirectUrl: REDIRECT_URL,
          metaData: { inntektsaar: '2028' },
        });
      });

      await test.step('Open consent page and login', async () => {
        await consentPage.open(consentResponse.viewUri);
        await login.loginNotChoosingActor(fromPerson);
      });

      await test.step('Pick language', async () => {
        await consentPage.pickLanguage(consentPage.language);
      });

      await test.step('Verify consent UI and expiry', async () => {
        await consentPage.expectStandardIntro();
        await expect(consentPage.textIncomeData).toBeVisible();
        const expected = formatUiDateTime(validTo);
        await consentPage.expectExpiry(expected);
      });

      await test.step('Approve consent', async () => {
        await consentPage.approveStandardAndWaitLogout(APPROVED_REDIRECT_URL);
      });
    });

    test(`Krav-template`, async ({ page, consentPage, login }) => {
      const fromPerson = pickRandom(fromPersons);
      const toOrg = pickRandom(toOrgs);
      const validTo = addTimeToNowUtc({ days: 2 });
      const api = new ConsentApiRequests(toOrg);

      const consentResponse = await test.step('Create consent request', async () => {
        return await api.createConsentRequest({
          from: { type: 'person', id: fromPerson },
          to: { type: 'org', id: toOrg },
          validToIsoUtc: validTo,
          resourceValue: 'samtykke-brukerstyrt-tilgang',
          redirectUrl: REDIRECT_URL,
          metaData: { brukerdata: 'AutomatisertTiltakE2E' },
        });
      });

      await test.step('Open consent page and login', async () => {
        await consentPage.open(consentResponse.viewUri);
        await login.loginNotChoosingActor(fromPerson);
      });

      await test.step('Pick language', async () => {
        await consentPage.pickLanguage(consentPage.language);
      });

      await test.step('Verify consent UI and expiry', async () => {
        await consentPage.expectKravIntro();
        const expected = formatUiDateTime(validTo);
        await consentPage.expectExpiry(expected);
      });

      await test.step('Approve consent', async () => {
        await consentPage.approveStandardAndWaitLogout(APPROVED_REDIRECT_URL);
      });
    });

    test(`Fullmakt utføre tjeneste`, async ({ consentPage, page, login }) => {
      const fromPerson = pickRandom(fromPersons);
      const toOrg = pickRandom(toOrgs);
      const validTo = addTimeToNowUtc({ days: 2 });
      const api = new ConsentApiRequests(toOrg);

      const consentResponse = await test.step('Create consent request', async () => {
        return await api.createConsentRequest({
          from: { type: 'person', id: fromPerson },
          to: { type: 'org', id: toOrg },
          validToIsoUtc: validTo,
          resourceValue: 'samtykke-fullmakt-utfoere-tjeneste',
          redirectUrl: REDIRECT_URL,
          metaData: { tiltak: '2024' },
        });
      });

      await test.step('Open consent page and login', async () => {
        await consentPage.open(consentResponse.viewUri);
        await login.loginNotChoosingActor(fromPerson);
      });

      await test.step('Pick language', async () => {
        await consentPage.pickLanguage(consentPage.language);
      });

      await test.step('Verify consent UI and expiry', async () => {
        await consentPage.expectFullmaktIntro();
        await expect(consentPage.textFullmaktHeading).toBeVisible();
        await expect(consentPage.textFullmaktService).toBeVisible();
        await expect(page.getByText('Tiltak: 2024')).toBeVisible();
        const expected = formatUiDateTime(validTo);
        await consentPage.expectFullmaktExpiry();
        await consentPage.expectExpiryDate(expected);
      });

      await test.step('Approve consent', async () => {
        await consentPage.approveFullmaktAndWaitLogout(APPROVED_REDIRECT_URL);
      });
    });

    test(`Lånesøknad`, async ({ consentPage, page, login }) => {
      const fromPerson = pickRandom(fromPersons);
      const toOrg = pickRandom(toOrgs);
      const validTo = addTimeToNowUtc({ days: 2 });
      const api = new ConsentApiRequests(toOrg);

      const consentResponse = await test.step('Create consent request', async () => {
        return await api.createConsentRequest({
          from: { type: 'person', id: fromPerson },
          to: { type: 'org', id: toOrg },
          validToIsoUtc: validTo,
          resourceValue: 'samtykke-laanesoeknad',
          redirectUrl: REDIRECT_URL,
          metaData: { rente: '4.2', banknavn: 'Testbanken E2E', utloepsar: '2027' },
        });
      });

      await test.step('Open consent page and login', async () => {
        await consentPage.open(consentResponse.viewUri);
        await login.loginNotChoosingActor(fromPerson);
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
        await consentPage.approveStandardAndWaitLogout(APPROVED_REDIRECT_URL);
      });
    });

    test(`Enkelt samtykke`, async ({ consentPage, page, login }) => {
      const fromPerson = pickRandom(fromPersons);
      const toOrg = pickRandom(toOrgs);
      const validTo = addTimeToNowUtc({ days: 2 });
      const api = new ConsentApiRequests(toOrg);

      const consentResponse = await test.step('Create consent request', async () => {
        return await api.createConsentRequest({
          from: { type: 'person', id: fromPerson },
          to: { type: 'org', id: toOrg },
          validToIsoUtc: validTo,
          resourceValue: 'enkelt-samtykke',
          redirectUrl: REDIRECT_URL,
          metaData: { simpletag: 'E2E Playwright metadata for simpletag' },
        });
      });

      await test.step('Open consent page and login', async () => {
        await consentPage.open(consentResponse.viewUri);
        await login.loginNotChoosingActor(fromPerson);
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
        await consentPage.approveStandardAndWaitLogout(APPROVED_REDIRECT_URL);
      });
    });

    test(`Avvis samtykke`, async ({ consentPage, login }) => {
      const fromPerson = pickRandom(fromPersons);
      const toOrg = pickRandom(toOrgs);
      const validTo = addTimeToNowUtc({ days: 2 });
      const api = new ConsentApiRequests(toOrg);

      const consentResponse = await test.step('Create consent request', async () => {
        return await api.createConsentRequest({
          from: { type: 'person', id: fromPerson },
          to: { type: 'org', id: toOrg },
          validToIsoUtc: validTo,
          resourceValue: 'enkelt-samtykke',
          redirectUrl: REDIRECT_URL,
          metaData: { simpletag: 'E2E reject test' },
        });
      });

      await test.step('Open consent page and login', async () => {
        await consentPage.open(consentResponse.viewUri);
        await login.loginNotChoosingActor(fromPerson);
      });

      await test.step('Pick language', async () => {
        await consentPage.pickLanguage(consentPage.language);
      });

      await test.step('Verify consent request heading', async () => {
        await expect(consentPage.textConsentRequestHeading).toBeVisible();
      });

      await test.step('Reject consent', async () => {
        await consentPage.rejectStandardAndWaitLogout(REJECTED_REDIRECT_URL);
      });
    });
  });
});
