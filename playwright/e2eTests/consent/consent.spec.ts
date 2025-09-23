import { expect } from '@playwright/test';
import { test } from 'playwright/fixture/pomFixture';

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

test.beforeEach(async ({ page }) => {
  api = new ConsentApiRequests();
  validToTimestamp = addTimeToNowUtc({ years: 1 });

  const pickRandom = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  // consentPage = new ConsentPage(page, Language.NB);
  fromPerson = pickRandom(fromPersons);
  toOrg = pickRandom(toOrgs);
  process.env.ORG = toOrg;
});

test.describe('Samtykke - Norsk', () => {
  test('Godta forespørsel - Standard samtykke', async ({ page, login, consentPage }) => {
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

    await consentPage.languagePicker.click();
    await consentPage.norwegian.click();

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

  test('Godta samtykke - krav-template', async ({ page, consentPage, login }) => {
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

    await consentPage.languagePicker.click();
    await consentPage.norwegian.click();

    await consentPage.expectKravIntro();
    await expect(page.getByText('Samtykket er tidsavgrenset og')).toBeVisible();

    const expected = formatUiDateTime(validToTimestamp);
    await consentPage.expectExpiry('Samtykket er', expected);

    await consentPage.approveStandardAndWaitLogout(redirectUrl);
  });

  test('Godta samtykke - Fullmakt utføre tjeneste', async ({ consentPage, page, login }) => {
    const consentResponse = await api.createConsentRequest({
      from: { type: 'person', id: fromPerson },
      to: { type: 'org', id: toOrg },
      validToIsoUtc: validToTimestamp,
      resourceValue: 'samtykke-fullmakt-utfoere-tjeneste',
      redirectUrl,
      metaData: { tiltak: '2024' },
    });

    // Go to consent to approve or reject
    await consentPage.open(consentResponse.viewUri);
    await login.loginAsActorPid(fromPerson);

    // Pick language
    await consentPage.languagePicker.click();
    await consentPage.norwegian.click();

    await consentPage.expectFullmaktIntro();
    await expect(page.getByText('Samtykke fullmakt utføre tjeneste')).toBeVisible();
    await expect(
      page.getByText('Du gir fullmakt til at en annen kan utføre denne tjenesten for deg'),
    ).toBeVisible();
    await expect(page.getByText('Tiltak: 2024')).toBeVisible();

    const expected = formatUiDateTime(validToTimestamp);
    await consentPage.expectExpiry('Fullmakten er', expected);

    await consentPage.approveFullmaktAndWaitLogout(redirectUrl);
  });

  test('Godta samtykke: Lånesøknad', async ({ consentPage, page, login }) => {
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
      page.getByText('Du samtykker til at søknadsdata kan brukes i forbindelse med låneprosessen'),
    ).toBeVisible();
    await expect(page.getByText('Rente: 4.2')).toBeVisible();
    await expect(page.getByText('utloepsar: 2027')).toBeVisible();
    await expect(page.getByText('Bank: Testbanken E2E')).toBeVisible();
    await expect(
      page.getByText('Samtykket gjelder én gangs utlevering av opplysningene'),
    ).toBeVisible();

    await consentPage.approveStandardAndWaitLogout(redirectUrl);
  });

  test('Godkjenn samtykke for template: Enkelt samtykke', async ({ consentPage, page, login }) => {
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

  test('Reject consent', async ({ consentPage, login }) => {
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
