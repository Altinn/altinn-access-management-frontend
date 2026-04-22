const KRAV_OG_BETALINGER_BASE = 'https://kravogbetalinger.api.skatteetaten-test.no/v1';

export async function fetchKrav(
  norskIdentifikator: string,
  consentToken: string,
): Promise<Response> {
  const url = `${KRAV_OG_BETALINGER_BASE}/finans/${norskIdentifikator}/aapnekrav`;
  return fetch(url, { headers: { Authorization: `Bearer ${consentToken}` } });
}
