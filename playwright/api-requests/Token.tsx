import { env } from 'playwright/util/helper';

export class Token {
  private readonly username: string;
  private readonly password: string;
  private readonly org: string;
  private readonly environment: string;

  constructor(org?: string) {
    this.username = env('USERNAME_TEST_API');
    this.password = env('PASSWORD_TEST_API');
    this.org = org || env('ORG');
    this.environment = env('ENV_NAME');
  }

  public get orgNo(): string {
    return this.org;
  }

  /**
   * Fetches an enterprise Altinn token for a specific organization and environment.
   * @param scopes Scopes required for the token.
   * @returns The enterprise Altinn token as a string.
   */
  public async getEnterpriseAltinnToken(scopes: string): Promise<string> {
    // Construct the URL for fetching the enterprise Altinn test token
    const url =
      `https://altinn-testtools-token-generator.azurewebsites.net/api/GetEnterpriseToken` +
      `?orgNo=${this.org}&env=${this.environment}&scopes=${scopes}`;

    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    const headers = {
      Authorization: `Basic ${auth}`,
    };

    // Retrieve the token
    const token = await this.getAltinnToken(url, headers);
    if (!token) {
      throw new Error('Token retrieval failed for Enterprise Altinn token');
    }

    return token;
  }

  /**
   * Used for fetching an Altinn test token for a specific role
   * @returns The Altinn test token as a string
   */
  public async getPersonalAltinnToken(): Promise<string> {
    const url =
      `https://altinn-testtools-token-generator.azurewebsites.net/api/GetPersonalToken?env=${this.environment}` +
      `&pid=${env('PID')}` +
      `&userid=${env('ALTINN_USER_ID')}` +
      `&partyid=${env('ALTINN_PARTY_ID')}` +
      `&partyUuid=${env('ALTINN_PARTY_UUID')}` +
      `&authLvl=3&ttl=3000` +
      `&scopes=altinn:portal/enduser`;

    // Retrieve the token
    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    const headers = {
      Authorization: `Basic ${auth}`,
    };

    const token = await this.getAltinnToken(url, headers);
    if (!token) {
      throw new Error('Token retrieval failed for Altinn token');
    }
    return token;
  }

  public async generateAltinnPersonalToken(): Promise<string> {
    const url =
      `https://altinn-testtools-token-generator.azurewebsites.net/api/GetPersonalToken` +
      `?env=${env('ENV_NAME')}` +
      `&pid=${env('DAGL_PID')}` +
      `&userid=${env('DAGL_USER_ID')}` +
      `&partyid=${env('DAGL_PARTY_ID')}` +
      `&partyuuid=${env('DAGL_PARTY_UUID')}` +
      `&authLvl=3&ttl=3000&scopes=altinn:portal/enduser`;

    const authHeader = Buffer.from(`${this.username}:${this.password}`).toString('base64');

    const response = await fetch(url, {
      headers: { Authorization: `Basic ${authHeader}` },
    });

    const token = await response.text();

    if (!token || !token.startsWith('ey')) {
      throw new Error('Invalid token received from Altinn');
    }

    return token;
  }
  catch(err: unknown) {
    console.error('Error retrieving Altinn token:', err);
    throw err;
  }

  public async getPersonalCleanupAltinnToken(person: {
    PID?: string;
    UserId?: string;
    PartyId?: string;
    PartyUUID?: string;
  }): Promise<string> {
    const url =
      `https://altinn-testtools-token-generator.azurewebsites.net/api/GetPersonalToken?env=${this.environment}` +
      `&pid=${person.PID || ''}` +
      `&userid=${person.UserId || ''}` +
      `&partyid=${person.PartyId || ''}` +
      `&partyUuid=${person.PartyUUID || ''}` +
      `&authLvl=3&ttl=3000` +
      `&scopes=altinn:portal/enduser`;

    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    const headers = {
      Authorization: `Basic ${auth}`,
    };

    const token = await this.getAltinnToken(url, headers);
    if (!token) {
      throw new Error('Token retrieval failed for Altinn token');
    }
    return token;
  }

  /**
   * Tar imot en PID og returnerer en personal token
   * @returns personal token
   */
  public async getPersonalAltinnTokenWithOnlyPid(pid: string): Promise<string> {
    const person = (await this.getUserIdPartyIdUuidForUser(pid)).data[0];
    const url =
      `https://altinn-testtools-token-generator.azurewebsites.net/api/GetPersonalToken?env=${this.environment}` +
      `&pid=${pid}` +
      `&userid=${person.user.userId}` +
      `&partyid=${person.partyId}` +
      `&partyUuid=${person.partyUuid}` +
      `&authLvl=3&ttl=3000` +
      `&scopes=altinn:portal/enduser`;

    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    const headers = {
      Authorization: `Basic ${auth}`,
    };

    const token = await this.getAltinnToken(url, headers);
    if (!token) {
      throw new Error('Token retrieval failed for Altinn token');
    }
    return token;
  }

  /**
   * Henter userId, partyId og partyUuid for en gitt bruker
   * @returns json objekt med info om en bruker
   */
  public async getUserIdPartyIdUuidForUser(pid: string) {
    const url = `${env('API_BASE_URL')}/register/api/v1/access-management/parties/query?fields=person,party,user`;
    const subscriptionKey = env('AT23_REGISTER_SUBSCRIPTION_KEY');
    const token = await this.getPlatformToken();
    const payload = {
      data: [`urn:altinn:person:identifier-no:${pid}`],
    };
    const body = JSON.stringify(payload);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        PlatformAccessToken: token,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch status for request. Status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Lager platform token som brukes til å slå opp blant annet userId, partyId, partyUuid.
   * @returns Platform Access Token
   */
  private async getPlatformToken() {
    const url = `https://altinn-testtools-token-generator.azurewebsites.net/api/GetPlatformAccessToken?env=${env('ENV_NAME')}&app=testtjeneste&ttl=60000`;
    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    const headers = {
      Authorization: `Basic ${auth}`,
    };

    const token = await this.getAltinnToken(url, headers);

    if (!token) {
      throw new Error('Token retrieval failed for Platform Access token');
    }
    return token;
  }

  private async getAltinnToken(url: string, headers: Record<string, string>): Promise<string> {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errorMessage = await response.text(); // Fetch the full error message from the response
      throw new Error(`Failed to fetch token: ${response.statusText} - ${errorMessage}`);
    }
    return response.text();
  }
}
