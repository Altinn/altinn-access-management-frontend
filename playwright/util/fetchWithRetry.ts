/**
 * Drop-in replacement for `fetch` used by the API clients that prepare and clean up test data.
 *
 * Retries only 503 Service Unavailable: the backend did not process the request, so repeating
 * it is safe for every method — also POSTs that create connections or delegations. Other errors,
 * 500 in particular, usually mean a real bug and are returned to the caller unchanged.
 *
 * If the backend still answers 503 after the last retry, a `TestSetupError` is thrown, so the
 * test fails right away and the report says the environment was the problem, not the UI.
 */

const RETRIES = 3;
/** Backoff 1s, 2s, 4s — 7s worst case, well inside the 90s test timeout. */
const DELAY_MS = 1_000;

export class TestSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TestSetupError';
  }
}

export async function fetchWithRetry(input: string | URL, init: RequestInit = {}) {
  const method = (init.method ?? 'GET').toUpperCase();
  // Query strings carry test PIDs and long URNs; the path is enough to identify the call.
  const { host, pathname } = new URL(input);
  const label = `${method} ${host}${pathname}`;

  for (let attempt = 0; ; attempt++) {
    const response = await fetch(input, init);
    if (response.status !== 503) return response;

    const body = await response.text();
    if (attempt === RETRIES) {
      throw new TestSetupError(
        `Testoppsett feilet: ${label} svarte 503 etter ${RETRIES + 1} forsøk. ` +
          `Miljøet var utilgjengelig — dette er ikke en feil i UI-et. Svar: ${body}`,
      );
    }

    const delay = DELAY_MS * 2 ** attempt;
    console.warn(`[fetchWithRetry] ${label} svarte 503, prøver igjen om ${delay}ms.`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
