export class TokenGenerator {
  private username: string;
  private password: string;

  constructor() {
    if (!process.env.API_USER || !process.env.API_PASS) {
      throw new Error('API_USER and API_PASS must be set in environment variables');
    }
    this.username = process.env.API_USER;
    this.password = process.env.API_PASS;
  }

  /**
   * Generate Altinn token for your test user
   */
  public async generateAltinnPersonalToken(): Promise<string> {
    const url =
      `https://altinn-testtools-token-generator.azurewebsites.net/api/GetPersonalToken` +
      `?env=${process.env.environment}` +
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
