import { Token } from 'playwright/api-requests/Token';
import { env } from 'playwright/util/helper';

export interface RegisterParty {
  partyUuid: string;
  partyId: number;
  personIdentifier?: string;
  organizationIdentifier?: string;
  user?: { userId?: number; [key: string]: unknown };
  [key: string]: unknown;
}

/** Read-only Register lookup. Construct only when --register is requested. */
export class RegisterApiRequests {
  private readonly token: Token;

  constructor(environment: string) {
    if (env('ENV_NAME').toLowerCase() !== environment.toLowerCase()) {
      throw new Error('Register ENV_NAME must match the requested --env.');
    }
    this.token = new Token();
  }

  async lookup(identifiers: string[]): Promise<Map<string, RegisterParty>> {
    const unique = [...new Set(identifiers)];
    if (unique.some((id) => !/^(\d{9}|\d{11})$/.test(id))) {
      throw new Error('Register lookup requires 9-digit orgnr or 11-digit personal identifiers.');
    }
    const parties = new Map<string, RegisterParty>();
    if (unique.length === 0) return parties;

    const url = new URL(`${env('API_BASE_URL')}/register/api/v1/access-management/parties/query`);
    url.searchParams.set('fields', 'party,person,organization,user');
    const headers = {
      PlatformAccessToken: await this.token.getPlatformToken(),
      'Ocp-Apim-Subscription-Key': env(
        `${env('ENV_NAME').toUpperCase()}_REGISTER_SUBSCRIPTION_KEY`,
      ),
      'Content-Type': 'application/json',
    };
    for (let offset = 0; offset < unique.length; offset += 100) {
      const batch = unique.slice(offset, offset + 100);
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          data: batch.map((id) =>
            id.length === 9
              ? `urn:altinn:organization:identifier-no:${id}`
              : `urn:altinn:person:identifier-no:${id}`,
          ),
        }),
      });
      if (!response.ok) throw new Error(`Register lookup failed (HTTP ${response.status}).`);
      const body = await response.json();
      if (!Array.isArray(body.data)) throw new Error('Register returned an invalid party list.');
      for (const party of body.data as RegisterParty[]) {
        const id = party.personIdentifier ?? party.organizationIdentifier;
        if (!id || !batch.includes(id) || !party.partyUuid || !party.partyId) {
          throw new Error(
            'Register returned a party without the requested identifier or Altinn IDs.',
          );
        }
        parties.set(id, party);
      }
    }
    return parties;
  }
}
