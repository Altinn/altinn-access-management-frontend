import { randomUUID } from 'crypto';
import { Token } from './Token';
import { MaskinportenToken } from './MaskinportenToken';
import { env } from 'playwright/util/helper';

export class ConsentApiRequests {
  private tokenClass: Token;

  constructor(org?: string) {
    this.tokenClass = new Token(org);
  }

  private async sendPostRequest<TPayload, TResponse>(
    payload: TPayload,
    endpoint: string,
    scopes: string,
  ): Promise<TResponse> {
    const baseUrl = env('API_BASE_URL');
    let url = baseUrl + endpoint;

    const token = await this.tokenClass.getEnterpriseAltinnToken(scopes);

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

  private async sendPostRequestWithMaskinporten<TPayload, TResponse>(
    payload: TPayload,
    endpoint: string,
    scopes: string,
    maskinportenToken: MaskinportenToken,
  ): Promise<TResponse> {
    const baseUrl = env('API_BASE_URL');
    let url = baseUrl + endpoint;

    const token = await maskinportenToken.getMaskinportenToken(scopes);

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

  //
  /**
   * Generalized consent request supporting both person and org as 'from'.
   * @param fromType 'person' or 'org'
   * @param validToIsoUtc ISO UTC string for validity
   */
  public async createConsentRequest({
    from,
    to,
    validToIsoUtc,
    resourceValue = 'enkelt-samtykke',
    redirectUrl = 'https://vg.no',
    metaData = { simpletag: 'playwright-e2e-metadata' },
  }: CreateConsentRequestParams): Promise<{ viewUri: string }> {
    const requestId = randomUUID();

    const urnPrefix: Record<FromParty['type'] | ToParty['type'], string> = {
      person: 'urn:altinn:person:identifier-no:',
      org: 'urn:altinn:organization:identifier-no:',
    };

    const fromUrn = `${urnPrefix[from.type]}${from.id}`;
    const toUrn = `${urnPrefix[to.type]}${to.id}`; // to.type er 'org' per type-def

    const payload = {
      id: requestId,
      from: fromUrn,
      to: toUrn,
      validTo: validToIsoUtc,
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

    const endpoint = '/accessmanagement/api/v1/enterprise/consentrequests';
    const scopes = 'altinn:consentrequests.write';

    return this.sendPostRequest<typeof payload, { viewUri: string }>(payload, endpoint, scopes);
  }

  /**
   * Create a consent request using Maskinporten authentication
   * @param params Same as createConsentRequest
   * @param maskinportenToken A MaskinportenToken instance
   * @returns The view URI for the consent request
   */
  public async createConsentRequestWithMaskinporten(
    params: CreateConsentRequestParams,
    maskinportenToken: MaskinportenToken,
  ): Promise<{ viewUri: string }> {
    const requestId = randomUUID();

    const urnPrefix: Record<FromParty['type'] | ToParty['type'], string> = {
      person: 'urn:altinn:person:identifier-no:',
      org: 'urn:altinn:organization:identifier-no:',
    };

    const fromUrn = `${urnPrefix[params.from.type]}${params.from.id}`;
    const toUrn = `${urnPrefix[params.to.type]}${params.to.id}`;

    const payload = {
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
              value: params.resourceValue || 'enkelt-samtykke',
            },
          ],
          metaData: params.metaData || { simpletag: 'playwright-e2e-metadata' },
        },
      ],
      redirectUrl: params.redirectUrl || 'https://vg.no',
      requestMessage: {
        en: `Playwright end to end test request message english`,
        nb: 'Playwright ende-til-ende test request message bokmål',
        nn: 'Playwright ende-til-ende test request message nynorsk',
      },
    };

    const endpoint = '/accessmanagement/api/v1/enterprise/consentrequests';
    const scopes = 'altinn:consentrequests.write';

    return this.sendPostRequestWithMaskinporten<typeof payload, { viewUri: string }>(
      payload,
      endpoint,
      scopes,
      maskinportenToken,
    );
  }

  /**
   * Get consent token using Maskinporten
   * @param consentRequestId The ID of the approved consent request
   * @param fromPersonId The person ID (not in URN format, just the ID)
   * @param maskinportenToken A MaskinportenToken instance
   * @returns The consent access token
   */
  async getConsentTokenWithMaskinporten(
    consentRequestId: string,
    fromPersonId: string,
    maskinportenToken: MaskinportenToken,
  ): Promise<string> {
    // Convert person ID to URN format
    const fromPersonUrn = `urn:altinn:person:identifier-no:${fromPersonId}`;

    return await maskinportenToken.getConsentToken(consentRequestId, fromPersonUrn);
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
