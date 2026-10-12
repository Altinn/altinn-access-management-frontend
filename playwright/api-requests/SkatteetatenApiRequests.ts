import { buildUrl, send } from './apiRequest';

const KRAV_OG_BETALINGER_BASE = 'https://kravogbetalinger.api.skatteetaten-test.no/v1';

export async function fetchKrav(
  norskIdentifikator: string,
  consentToken: string,
): Promise<Response> {
  const url = buildUrl(KRAV_OG_BETALINGER_BASE, `finans/${norskIdentifikator}/aapnekrav`);
  return send('GET', url, { token: consentToken });
}
