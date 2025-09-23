import { expect } from '@playwright/test';
import { test } from 'playwright/fixture/pomFixture';
import { ConsentApiRequests } from '../../api-requests/ConsentApiRequests';
import { fromPersons, toOrgs } from './consentTestdata';
import { Language } from 'playwright/pages/consent/ConsentPage';
import { addTimeToNowUtc, formatUiDateTime } from 'playwright/util/helper';

test.describe.configure({ timeout: 30000 });

const redirectUrl = 'https://example.com/';

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

test.describe('Samtykke - English', () => {
  test.use({ language: Language.EN }); // all tests in this file run in EN
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

    await consentPage.pickLanguage(consentPage.language);

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
