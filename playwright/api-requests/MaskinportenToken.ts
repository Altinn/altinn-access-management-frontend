import { env } from '../util/helper';
import { createMaskinportenGrantAssertion, createConsentAuthorizationJWT } from '../util/jwtHelper';

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
   * @returns The access token as a string
   */
  async getMaskinportenToken(scope: string): Promise<string> {
    const assertion = createMaskinportenGrantAssertion(
      this.clientId,
      scope,
      this.tokenEndpoint,
      this.jwk,
    );

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
    });

    const status = response.status;
    const statusText = response.statusText;
    const responseBody = await response.text();

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Maskinporten token: ${status} ${statusText} - ${responseBody}`,
      );
    }

    let tokenData;
    try {
      tokenData = JSON.parse(responseBody);
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
      throw new Error(
        `Failed to parse Maskinporten token response as JSON: ${errorMessage}. Status: ${status} ${statusText}. Response body: ${responseBody}`,
      );
    }
    return tokenData.access_token;
  }

  /**
   * Fetch a consent token from Maskinporten
   * @param consentRequestId The ID of the approved consent request
   * @param fromPersonId The person ID in URN format (e.g., urn:altinn:person:identifier-no:21818297804)
   * @param consumerOrg Optional organization number for "behalf of" scenarios
   * @returns The consent access token as a string
   */
  async getConsentToken(
    consentRequestId: string,
    fromPersonId: string,
    consumerOrg?: string,
  ): Promise<string> {
    const assertion = createConsentAuthorizationJWT(
      this.clientId,
      consentRequestId,
      fromPersonId,
      this.jwk,
      consumerOrg,
    );

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to fetch consent token: ${response.status} ${errorBody}`);
    }

    const tokenData = await response.json();
    return tokenData.access_token;
  }

  /**
   * Get the client ID
   * @returns The Maskinporten client ID
   */
  getClientId(): string {
    return this.clientId;
  }
}
