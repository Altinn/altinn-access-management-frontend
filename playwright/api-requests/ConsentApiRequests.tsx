import { randomUUID } from 'crypto';
import { Token } from './Token';
import { MaskinportenToken } from './MaskinportenToken';
import { env, addTimeToNowUtc } from 'playwright/util/helper';

export class ConsentApiRequests {
  private tokenClass: Token;

  constructor(org?: string) {
    this.tokenClass = new Token(org);
  }

  /**
   * Unified helper method for POST requests that handles token acquisition and HTTP request logic.
   * @param payload The request payload
   * @param endpoint The API endpoint
   * @param getToken Async function that returns the authentication token
   * @returns The parsed JSON response
   */
  private async sendPostRequestInternal<TPayload, TResponse>(
    payload: TPayload,
    endpoint: string,
    getToken: () => Promise<string>,
  ): Promise<TResponse> {
    const baseUrl = env('API_BASE_URL');
    let url = baseUrl + endpoint;

    const token = await getToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`HTTP Error! Status: ${response.status}, Body: ${errorBody}`);
      throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorBody}`);
    }

    return (await response.json()) as TResponse;
  }

  private async sendPostRequest<TPayload, TResponse>(
    payload: TPayload,
    endpoint: string,
    scopes: string,
  ): Promise<TResponse> {
    return this.sendPostRequestInternal<TPayload, TResponse>(payload, endpoint, () =>
      this.tokenClass.getEnterpriseAltinnToken(scopes),
    );
  }

  private async sendPostRequestWithMaskinporten<TPayload, TResponse>(
    payload: TPayload,
    endpoint: string,
    scopes: string,
    maskinportenToken: MaskinportenToken,
    consumerOrg?: string,
  ): Promise<TResponse> {
    return this.sendPostRequestInternal<TPayload, TResponse>(payload, endpoint, () =>
      maskinportenToken.getMaskinportenToken(scopes, consumerOrg),
    );
  }

  /**
   * Builds the consent request payload from parameters.
   * @param params The consent request parameters
   * @returns The complete payload object for the consent request
   */
  private buildConsentRequestPayload(params: CreateConsentRequestParams) {
    const requestId = randomUUID();

    const urnPrefix: Record<FromParty['type'] | ToParty['type'], string> = {
      person: 'urn:altinn:person:identifier-no:',
      org: 'urn:altinn:organization:identifier-no:',
    };

    const fromUrn = `${urnPrefix[params.from.type]}${params.from.id}`;
    const toUrn = `${urnPrefix[params.to.type]}${params.to.id}`;

    const resourceValue = params.resourceValue || 'enkelt-samtykke';
    const redirectUrl = params.redirectUrl || 'https://vg.no';
    const metaData = params.metaData || { simpletag: 'playwright-e2e-metadata' };

    return {
      id: requestId,
      from: fromUrn,
      to: toUrn,
      validTo: params.validToIsoUtc,
      consentRights: [
        {
          action: ['consent'],
          resource: [
            {
              type: 'urn:altinn:resource',
              value: resourceValue,
            },
          ],
          metaData,
        },
      ],
      redirectUrl,
      requestMessage: {
        en: `Playwright end to end test request message english`,
        nb: 'Playwright ende-til-ende test request message bokmål',
        nn: 'Playwright ende-til-ende test request message nynorsk',
      },
    };
  }

  //
  /**
   * Generalized consent request supporting both person and org as 'from'.
   * @param fromType 'person' or 'org'
   * @param validToIsoUtc ISO UTC string for validity
   */
  public async createConsentRequest(
    params: CreateConsentRequestParams,
  ): Promise<{ viewUri: string }> {
    const payload = this.buildConsentRequestPayload(params);

    const endpoint = '/accessmanagement/api/v1/enterprise/consentrequests';
    const scopes = 'altinn:consentrequests.write';

    return this.sendPostRequest<typeof payload, { viewUri: string }>(payload, endpoint, scopes);
  }

  /**
   * Create a consent request using Maskinporten authentication
   * @param from The party creating the consent request
   * @param to The organization receiving the consent request
   * @param clientIdEnv Environment variable name for the Maskinporten client ID
   * @param jwkEnv Environment variable name for the JWK private key
   * @param consumerOrg Optional organization number for "behalf of" scenarios
   * @returns The view URI for the consent request
   */
  public async createConsentRequestWithMaskinporten(
    from: FromParty,
    to: ToParty,
    clientIdEnv: string,
    jwkEnv: string,
    consumerOrg?: string,
  ): Promise<{ viewUri: string }> {
    // Set default values for fields not needed in test
    const validToIsoUtc = addTimeToNowUtc({ days: 5 });
    const resourceValue = 'standard-samtykke-for-dele-data';
    const redirectUrl = 'https://example.com/';
    const metaData = { inntektsaar: '2028' };

    const params: CreateConsentRequestParams = {
      from,
      to,
      validToIsoUtc,
      resourceValue,
      redirectUrl,
      metaData,
    };

    const payload = this.buildConsentRequestPayload(params);

    const endpoint = '/accessmanagement/api/v1/enterprise/consentrequests';
    const scopes = 'altinn:consentrequests.write';

    // Create MaskinportenToken instance to fetch the access token
    const maskinportenToken = new MaskinportenToken(clientIdEnv, jwkEnv);
    return this.sendPostRequestWithMaskinporten<typeof payload, { viewUri: string }>(
      payload,
      endpoint,
      scopes,
      maskinportenToken,
      consumerOrg,
    );
  }

  /**
   * Get consent token using Maskinporten
   * @param consentRequestId The ID of the approved consent request
   * @param fromPersonId The person ID (not in URN format, just the ID)
   * @param clientIdEnv Environment variable name for the Maskinporten client ID
   * @param jwkEnv Environment variable name for the JWK private key
   * @param consumerOrg Optional organization number for "behalf of" scenarios
   * @returns The consent access token
   */
  async getConsentTokenWithMaskinporten(
    consentRequestId: string,
    fromPersonId: string,
    clientIdEnv: string,
    jwkEnv: string,
    consumerOrg?: string,
  ): Promise<string> {
    // Convert person ID to URN format
    const fromPersonUrn = `urn:altinn:person:identifier-no:${fromPersonId}`;

    // Create MaskinportenToken instance to fetch the consent token
    const maskinportenToken = new MaskinportenToken(clientIdEnv, jwkEnv);
    return await maskinportenToken.getConsentToken(consentRequestId, fromPersonUrn, consumerOrg);
  }
}

interface CreateConsentRequestParams {
  from: FromParty;
  to: ToParty;
  validToIsoUtc: string;
  resourceValue?: string;
  redirectUrl?: string;
  metaData?: Record<string, string>;
}

type FromParty = { type: 'person' | 'org'; id: string };
type ToParty = { type: 'org'; id: string };
