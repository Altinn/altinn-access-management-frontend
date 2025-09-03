import { randomUUID } from 'crypto';
import { Token } from './Token';

export class ConsentApiRequests {
  private tokenClass: Token;

  constructor() {
    this.tokenClass = new Token();
  }

  public async postConsentRequestRaw(payload: any): Promise<{ viewUri: string }> {
    const endpoint = '/accessmanagement/api/v1/enterprise/consentrequests';
    const scopes = 'altinn:consentrequests.write';
    return this.sendPostRequest<typeof payload, { viewUri: string }>(payload, endpoint, scopes);
  }

  private async sendPostRequest<TPayload, TResponse>(
    payload: TPayload,
    endpoint: string,
    scopes: string,
  ): Promise<TResponse> {
    const baseUrl = process.env.API_BASE_URL;
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

  //Todo - move this to a separate setup class
  /**
   * Generalized consent request supporting both person and org as 'from'.
   * @param fromType 'person' or 'org'
   * @param fromId FNR for person, OrgNo for org
   * @param toType Only 'org' currently supported
   * @param toId OrgNo for recipient
   * @param validToIsoUtc ISO UTC string for validity
   * @param opts Optional resourceValue, redirectUrl, metaData
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
        en: `Playwright E2E test run at ${new Date().toISOString()}`,
        nb: 'Playwright integrasjonstest',
        nn: 'Playwright ende-til-ende test',
      },
    };

    const endpoint = '/accessmanagement/api/v1/enterprise/consentrequests';
    const scopes = 'altinn:consentrequests.write';

    return this.sendPostRequest<typeof payload, { viewUri: string }>(payload, endpoint, scopes);
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
