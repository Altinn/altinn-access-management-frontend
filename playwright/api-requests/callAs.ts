import { type HttpMethod, sendJson } from './apiRequest';
import { Token } from './Token';

/** Token's caches live at module level, so one shared instance is all the clients need. */
export const token = new Token();

export function partyUuid(pidOrOrgNo: string): Promise<string> {
  return token.getPartyUuid(pidOrOrgNo);
}

/** Calls the endpoint as the person `pid`, with a personal (enduser) token. `body` is sent as JSON. */
export async function asUser<T = unknown>(
  pid: string,
  method: HttpMethod,
  url: string,
  body?: unknown,
): Promise<T> {
  return sendJson<T>(method, url, { json: body, token: await token.getPersonalTokenByPid(pid) });
}

/** Calls the endpoint as the organisation `orgNo`, with an enterprise token for `scopes`. `body` is sent as JSON. */
export async function asEnterprise<T = unknown>(
  orgNo: string,
  scopes: string,
  method: HttpMethod,
  url: string,
  body?: unknown,
): Promise<T> {
  return sendJson<T>(method, url, {
    json: body,
    token: await token.getEnterpriseAltinnToken(orgNo, scopes),
  });
}
