import type { Page } from '@playwright/test';
import { test, expect } from '@playwright/test';

import { LoginPage } from '../../pages/LoginPage';
import { ApiRequests } from '../../api-requests/ApiRequests';

test.describe.configure({ timeout: 30000 });

test.describe('Consent', () => {
  const fromPersons = ['19873348707', '27897699724']; // Add more as needed
  const toOrgs = ['312285967', '312119358', '310155837', '311517678']; // Add more as needed

  function pickRandom(arr: string[]) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  const redirectUrl = 'https://example.com/';
  let loginPage: LoginPage;
  let consentUrl: string;
  const samtykkeButtonStandard = { name: 'Ja, jeg gir samtykke' };

  test('Godta forespørsel - Standard samtykke', async ({ page }) => {
    const api = new ApiRequests();
    const validToTimestamp = addTimeToNowUtc({ years: 1 });

    const fromPerson = pickRandom(fromPersons);
    const toOrg = pickRandom(toOrgs);
    process.env.ORG = toOrg;

    const consentResponse = await api.createConsentRequest({
      from: { type: 'person', id: fromPerson },
      to: { type: 'org', id: toOrg },
      validToIsoUtc: validToTimestamp,
      resourceValue: 'standard-samtykke-for-dele-data',
      redirectUrl,
      metaData: { inntektsaar: '2035' },
    });

    await LoginUser({ page, consentResponse, fromPerson });
    await ConsentSayYes(page);
  });

  test('Godta samtykke - krav-template', async ({ page }) => {
    const api = new ApiRequests();
    const validToTimestamp = addTimeToNowUtc({ years: 1 });
    const fromPerson = pickRandom(fromPersons);
    const toOrg = pickRandom(toOrgs);
    process.env.ORG = toOrg;

    const consentResponse = await api.createConsentRequest({
      from: { type: 'person', id: fromPerson },
      to: { type: 'org', id: toOrg },
      validToIsoUtc: validToTimestamp,
      resourceValue: 'samtykke-brukerstyrt-tilgang',
      redirectUrl,
      metaData: { brukerdata: 'AutomatisertTiltakE2E' },
    });

    await LoginUser({ page, consentResponse, fromPerson });
    await ConsentSayYes(page);
  });

  test('Godta samtykke - Fullmakt utføre tjeneste', async ({ page }) => {
    const api = new ApiRequests();
    const validToTimestamp = addTimeToNowUtc({ years: 1 });
    const fromPerson = pickRandom(fromPersons);
    const toOrg = pickRandom(toOrgs);
    process.env.ORG = toOrg;

    const consentResponse = await api.createConsentRequest({
      from: { type: 'person', id: fromPerson },
      to: { type: 'org', id: toOrg },
      validToIsoUtc: validToTimestamp,
      resourceValue: 'samtykke-fullmakt-utfoere-tjeneste',
      redirectUrl,
      metaData: { tiltak: '2024' },
    });

    await LoginUser({ page, consentResponse, fromPerson });
    await page.getByRole('button', samtykkeButtonStandard).click();
    await waitForRedirects(page, [/login\.test\.idporten\.no\/logout\/success/i, /example\.com/i]);
  });

  test('Approve consent: Lånesøknad', async ({ page }) => {
    const api = new ApiRequests();
    const validToTimestamp = addTimeToNowUtc({ years: 1 });
    const fromPerson = pickRandom(fromPersons);
    const toOrg = pickRandom(toOrgs);
    process.env.ORG = toOrg;

    const consentResponse = await api.createConsentRequest({
      from: { type: 'person', id: fromPerson },
      to: { type: 'org', id: toOrg },
      validToIsoUtc: validToTimestamp,
      resourceValue: 'samtykke-laanesoeknad',
      redirectUrl,
      metaData: { rente: '4.2', banknavn: 'Testbanken E2E', utloepsar: '2027' },
    });

    await LoginUser({ page, consentResponse, fromPerson });
    await ConsentSayYes(page);
  });

  test('Approve consent for template: Enkelt samtykke', async ({ page }) => {
    const api = new ApiRequests();
    const validToTimestamp = addTimeToNowUtc({ years: 1 });
    const fromPerson = pickRandom(fromPersons);
    const toOrg = pickRandom(toOrgs);
    process.env.ORG = toOrg;

    const consentResponse = await api.createConsentRequest({
      from: { type: 'person', id: fromPerson },
      to: { type: 'org', id: toOrg },
      validToIsoUtc: validToTimestamp,
      resourceValue: 'enkelt-samtykke',
      redirectUrl,
      metaData: { simpletag: 'E2E enkelt samtykke test' },
    });

    await LoginUser({ page, consentResponse, fromPerson });
    await ConsentSayYes(page);
  });

  test('Reject consent', async ({ page }) => {
    const api = new ApiRequests();
    const validToTimestamp = addTimeToNowUtc({ years: 1 });
    const fromPerson = pickRandom(fromPersons);
    const toOrg = pickRandom(toOrgs);
    process.env.ORG = toOrg;

    const consentResponse = await api.createConsentRequest({
      from: { type: 'person', id: fromPerson },
      to: { type: 'org', id: toOrg },
      validToIsoUtc: validToTimestamp,
      resourceValue: 'enkelt-samtykke',
      redirectUrl,
      metaData: { simpletag: 'E2E reject test' },
    });

    await runConsentRejectionTest({ page, consentResponse, fromPerson });
  });

  async function LoginUser({
    page,
    consentResponse,
    fromPerson,
  }: {
    page: Page;
    consentResponse: { viewUri: string };
    fromPerson: string;
  }) {
    loginPage = new LoginPage(page);
    expect(consentResponse.viewUri).toBeTruthy();
    consentUrl = consentResponse.viewUri + '&DONTCHOOSEREPORTEE=TRUE';
    await page.goto(consentUrl);
    await loginPage.loginAsActorPid(fromPerson);
  }

  async function ConsentSayYes(page: Page) {
    await page.getByRole('button', samtykkeButtonStandard).click();
    await waitForRedirects(page, [/login\.test\.idporten\.no\/logout\/success/i, /example\.com/i]);
  }

  async function runConsentRejectionTest({
    page,
    consentResponse,
    fromPerson,
  }: {
    page: Page;
    consentResponse: { viewUri: string };
    fromPerson: string;
  }) {
    loginPage = new LoginPage(page);
    expect(consentResponse.viewUri).toBeTruthy();
    consentUrl = consentResponse.viewUri + '&DONTCHOOSEREPORTEE=TRUE';
    await page.goto(consentUrl);
    await loginPage.loginAsActorPid(fromPerson);
    const header = await page.getByRole('heading', { name: 'Forespørsel om samtykke' });
    await expect(header).toBeVisible();
    await page.getByRole('button', { name: 'Nei, jeg gir ikke samtykke' }).click();
    await waitForRedirects(page, [/login\.test\.idporten\.no\/logout\/success/i, /example\.com/i]);
  }
});

async function waitForRedirects(p: Page, patterns: RegExp[], timeout = 15000) {
  for (const re of patterns) {
    await p.waitForURL(re, { timeout });
  }
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

  return now.toISOString(); // "YYYY-MM-DDTHH:mm:ss.sssZ"
}
