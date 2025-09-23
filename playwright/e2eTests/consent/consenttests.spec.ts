import { expect, Page, test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { ConsentApiRequests } from '../../api-requests/ConsentApiRequests';
import { ConsentPage, Language } from '../../pages/consent/ConsentPage';
import { fromPersons, toOrgs } from './consentTestdata';

test.describe.configure({ timeout: 30000 });

const redirectUrl = 'https://example.com/';

let api: ConsentApiRequests;
let validToTimestamp: string;
let consentPage: ConsentPage;
let fromPerson: string;
let toOrg: string;
const pickRandom = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

[
  { language: Language.NB, name: 'Norsk' },
  { language: Language.EN, name: 'English' },
].forEach(({ language, name }) => {
  test.describe(`Consent - ${name} language`, () => {
    let consentPage: ConsentPage;

    test.beforeEach(async ({ page }) => {
      api = new ConsentApiRequests();
      validToTimestamp = addTimeToNowUtc({ years: 1 });

      fromPerson = pickRandom(fromPersons);
      toOrg = pickRandom(toOrgs);
      process.env.ORG = toOrg;

      consentPage = new ConsentPage(page, language);
    });

    test(`Godta forespørsel - Standard samtykke (${name})`, async ({ page }) => {
      const consentResponse = await api.createConsentRequest({
        from: { type: 'person', id: fromPerson },
        to: { type: 'org', id: toOrg },
        validToIsoUtc: validToTimestamp,
        resourceValue: 'standard-samtykke-for-dele-data',
        redirectUrl,
        metaData: { inntektsaar: '2028' },
      });

      // Login
      await consentPage.open(consentResponse.viewUri, pidLogin(page), fromPerson);

      // Pick relevant language
      await consentPage.pickLanguage(language);

      await consentPage.expectStandardIntro();
      await expect(
        page.getByText(
          'Du samtykker til at vi kan hente og bruke dine inntektsopplysninger fra Skatteetaten',
        ),
      ).toBeVisible();
      await expect(page.getByText('Samtykket er tidsavgrenset og')).toBeVisible();

      const expected = formatUiDateTime(validToTimestamp);
      await consentPage.expectExpiry('Samtykket er', expected);

      await consentPage.approveStandardAndWaitLogout(redirectUrl);
    });
  });
});

test.beforeEach(async ({ page }) => {
  api = new ConsentApiRequests();
  validToTimestamp = addTimeToNowUtc({ years: 1 });
  consentPage = new ConsentPage(page, Language.NB);
  fromPerson = pickRandom(fromPersons);
  toOrg = pickRandom(toOrgs);
  process.env.ORG = toOrg;
});

/** helper: converts the validTo (ISO/UTC) to Oslo UI format */
function formatUiDateTime(isoString: string): string {
  const date = new Date(isoString);
  const datePart = date.toLocaleDateString('no-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/Oslo',
  });
  const timePart = date.toLocaleTimeString('no-NO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Oslo',
  });
  return `${datePart} ${timePart}`;
}

function pidLogin(page: Page) {
  return async (pid: string) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAsActorPid(pid);
  };
}

function addTimeToNowUtc(opts: {
  minutes?: number;
  seconds?: number;
  days?: number;
  years?: number;
}): string {
  const now = new Date();
  if (opts.minutes) now.setUTCMinutes(now.getUTCMinutes() + opts.minutes);
  if (opts.seconds) now.setUTCSeconds(now.getUTCSeconds() + opts.seconds);
  if (opts.days) now.setUTCDate(now.getUTCDate() + opts.days);
  if (opts.years) now.setUTCFullYear(now.getUTCFullYear() + opts.years);
  return now.toISOString();
}
