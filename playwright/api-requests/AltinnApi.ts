import { type HttpMethod, type RequestOptions, sendJson } from './apiRequest';
import { Token } from './Token';

type CallOptions = Omit<RequestOptions, 'token'>;

/**
 * Base for the API clients: resolves parties and tokens, and sends the call as an end user or
 * as an enterprise. Subclasses only describe endpoints — URLs, payloads and what to return.
 */
export abstract class AltinnApi {
  protected readonly tokenClass = new Token();

  protected partyUuid(pidOrOrgNo: string): Promise<string> {
    return this.tokenClass.getPartyUuid(pidOrOrgNo);
  }

  /** Calls the endpoint as the person `pid`, with a personal (enduser) token. */
  protected async asUser<T = unknown>(
    pid: string,
    method: HttpMethod,
    url: string,
    options?: CallOptions,
  ): Promise<T> {
    const token = await this.tokenClass.getPersonalTokenByPid(pid);
    return sendJson<T>(method, url, { ...options, token });
  }

  /** Calls the endpoint as the organisation `orgNo`, with an enterprise token for `scopes`. */
  protected async asEnterprise<T = unknown>(
    orgNo: string,
    scopes: string,
    method: HttpMethod,
    url: string,
    options?: CallOptions,
  ): Promise<T> {
    const token = await this.tokenClass.getEnterpriseAltinnToken(orgNo, scopes);
    return sendJson<T>(method, url, { ...options, token });
  }
}
