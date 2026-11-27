import { env } from '../util/helper';
import { createMaskinportenGrantAssertion, createConsentAuthorizationJWT } from '../util/jwtHelper';

import { sendJson } from './apiRequest';

/**
 * MaskinportenToken Class
 *
 * Handles authentication with Maskinporten for integration testing.
 * Provides methods to fetch access tokens and consent tokens.
 *
 * @param clientIdEnv Environment variable name for the Maskinporten client ID (e.g., 'MASKINPORTEN_CLIENT_ID')
 * @param jwkEnv Environment variable name for the JWK private key (e.g., 'MASKINPORTEN_JWK')
 */
export class MaskinportenToken {
  private readonly clientId: string;
  private readonly jwk: JsonWebKey;
  private readonly tokenEndpoint: string;

  /**
   * Creates a new MaskinportenToken instance
   * @param clientIdEnv Environment variable name for the Maskinporten client ID
   * @param jwkEnv Environment variable name for the JWK private key in JSON string format
   */
  constructor(clientIdEnv: string, jwkEnv: string) {
    this.clientId = env(clientIdEnv);

    // Parse JWK (JSON string)
    const jwkString = env(jwkEnv);

    try {
      this.jwk = JSON.parse(jwkString) as JsonWebKey;
    } catch (error) {
      throw new Error(
        `Failed to parse ${jwkEnv} as JSON: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    this.tokenEndpoint = 'https://test.maskinporten.no/token';
  }

  /**
   * Fetch an access token from Maskinporten
   * @param scope The requested scope (e.g., 'altinn:consentrequests.write')
   * @param consumerOrg Optional organization number for "behalf of" scenarios
   * @returns The access token as a string
   */
  async getMaskinportenToken(scope: string, consumerOrg?: string): Promise<string> {
    const assertion = createMaskinportenGrantAssertion(
      this.clientId,
      scope,
      this.tokenEndpoint,
      this.jwk,
      consumerOrg,
    );

    return this.requestToken(assertion);
  }

  /**
   * Fetch a consent token from Maskinporten
   * @param consentRequestId The ID of the approved consent request
   * @param fromPartyUrn The consenting party URN (person or org)
   * @param consumerOrg Optional organization number for "behalf of" scenarios
   * @param scope The Maskinporten scope for the consent token. Default: 'altinn:consentrequests.write'
   * @returns The consent access token as a string
   */
  async getConsentToken(
    consentRequestId: string,
    fromPartyUrn: string,
    consumerOrg?: string,
    scope?: string,
  ): Promise<string> {
    const assertion = createConsentAuthorizationJWT(
      this.clientId,
      consentRequestId,
      fromPartyUrn,
      this.jwk,
      consumerOrg,
      scope,
    );

    return this.requestToken(assertion);
  }

  private async requestToken(assertion: string): Promise<string> {
    const { access_token } = await sendJson<{ access_token: string }>('POST', this.tokenEndpoint, {
      form: { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion },
    });
    return access_token;
  }

  /**
   * Get the client ID
   * @returns The Maskinporten client ID
   */
  getClientId(): string {
    return this.clientId;
  }
}
