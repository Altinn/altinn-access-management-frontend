/**
 * Retries a request while it fails transiently. Same rules as `withRetries` in
 * altinn-platform-validation-tests (K6/api/building-blocks/common/retry.js).
 */

/** Statuses that mean the request never got a verdict from the API. */
const TRANSIENT_STATUSES = [408, 429, 502, 503, 504];

/** Retries on top of the original request, with backoff 1s, 2s, 4s. */
const RETRIES = 3;
const DELAY_MS = 1_000;
const MAX_DELAY_MS = 8_000;

/**
 * A request that never reached the API: fetch's "fetch failed" (connection reset, DNS failure)
 * or a per-attempt timeout. Anything else fetch throws, such as a GET with a body, is a bug in
 * the test code and is not retried.
 */
function isNetworkError(error: unknown): boolean {
  return (
    error instanceof Error && (error.message === 'fetch failed' || error.name === 'TimeoutError')
  );
}

/**
 * Sends a request and retries it while it fails transiently. A network error
 * (connection reset, DNS failure, timeout) counts as transient too — that is what
 * K6 reports as status 0.
 *
 * Any other response is returned as it is, so the caller stays the only place that
 * decides which statuses it accepts. The last response is always returned.
 */
export async function withRetries(
  sendRequest: () => Promise<Response>,
  label: string,
): Promise<Response> {
  for (let used = 0; ; used++) {
    let failure: string;
    try {
      const response = await sendRequest();
      if (!TRANSIENT_STATUSES.includes(response.status) || used === RETRIES) {
        return response;
      }
      failure = `status ${response.status}`;
      await response.body?.cancel();
    } catch (error) {
      if (!isNetworkError(error) || used === RETRIES) throw error;
      failure = String(error);
    }

    const delay = Math.min(DELAY_MS * 2 ** used, MAX_DELAY_MS);
    console.warn(
      `${label} - transient failure (${failure}). Retrying in ${delay}ms (retry ${used + 1} of ${RETRIES}).`,
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
