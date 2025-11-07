import type { Page } from '@playwright/test';
import { ConsentApiRequests } from '../../../api-requests/ConsentApiRequests';
import { MaskinportenToken } from '../../../api-requests/MaskinportenToken';
import type { LoginPage } from '../../../pages/LoginPage';
import type { ConsentPage } from '../../../pages/consent/ConsentPage';

const REDIRECT_URL = 'https://example.com/';

export interface ConsentScenario {
  api: ConsentApiRequests;
  mpToken: MaskinportenToken;
  fromPerson: string;
  toOrg: string;
  validTo: string;
  page: Page;
  login: LoginPage;
  consentPage: ConsentPage;
  resourceValue: string;
  metaData?: Record<string, string>;
}

/**
 * Create and approve a consent using Maskinporten authentication
 */
export async function createAndApproveConsent(opts: ConsentScenario) {
  const { api, mpToken, fromPerson, toOrg, validTo, login, consentPage, resourceValue, metaData } =
    opts;

  const resp = await api.createConsentRequestWithMaskinporten(
    {
      from: { type: 'person', id: fromPerson },
      to: { type: 'org', id: toOrg },
      validToIsoUtc: validTo,
      resourceValue,
      redirectUrl: REDIRECT_URL,
      metaData,
    },
    mpToken,
  );

  await consentPage.open(resp.viewUri);
  await login.loginNotChoosingActor(fromPerson);
  await consentPage.pickLanguage(consentPage.language);
  return resp;
}

/**
 * Extract consent request ID from view URI
 */
export function getConsentRequestId(viewUri: string): string {
  const id = new URL(viewUri).searchParams.get('id');
  if (!id) throw new Error('Could not extract consent request ID from viewUri');
  return id;
}
