export class Token {
  private readonly username: string;
  private readonly password: string;
  private readonly org: string;
  private readonly environment: string;

  constructor(org?: string) {
    this.username = process.env.USERNAME_TEST_API || '';
    this.password = process.env.PASSWORD_TEST_API || '';
    this.org = org || process.env.ORG || '';
    this.environment = process.env.environment || '';

    if (!this.username) {
      throw new Error('API username is not defined in the environment variables.');
    }

    if (!this.password) {
      throw new Error('API password is not defined in the environment variables.');
    }

    if (!this.org) {
      throw new Error('ORG is not defined in the environment variables.');
    }

    if (!this.environment) {
      throw new Error('Environment is not defined in the environment variables.');
    }
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
      `https://altinn-testtools-token-generator.azurewebsites.net/api/GetPersonalToken?env=${process.env.environment}` +
      `&pid=${process.env.PID}` +
      `&userid=${process.env.ALTINN_USER_ID}` +
      `&partyid=${process.env.ALTINN_PARTY_ID}` +
      `&partyUuid=${process.env.ALTINN_PARTY_UUID}` +
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

  private async getAltinnToken(url: string, headers: Record<string, string>): Promise<string> {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errorMessage = await response.text(); // Fetch the full error message from the response
      throw new Error(`Failed to fetch token: ${response.statusText} - ${errorMessage}`);
    }
    return response.text();
  }

  public async generateAltinnPersonalToken(): Promise<string> {
    const url =
      `https://altinn-testtools-token-generator.azurewebsites.net/api/GetPersonalToken` +
      `?env=${process.env.ENV_NAME}` +
      `&pid=${process.env.DAGL_PID}` +
      `&userid=${process.env.DAGL_USER_ID}` +
      `&partyid=${process.env.DAGL_PARTY_ID}` +
      `&partyuuid=${process.env.DAGL_PARTY_UUID}` +
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
}
