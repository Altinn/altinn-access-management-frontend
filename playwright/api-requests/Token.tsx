import { env } from 'playwright/util/helper';

export class Token {
  private platformToken: string;
  private readonly username: string;
  private readonly password: string;
  private readonly environment: string;

  constructor() {
    this.username = env('USERNAME_TEST_API');
    this.password = env('PASSWORD_TEST_API');
    this.environment = env('ENV_NAME');
    this.platformToken = '';
  }

  public async getEnterpriseAltinnToken(orgNo: string, scopes: string): Promise<string> {
    const url =
      `https://altinn-testtools-token-generator.azurewebsites.net/api/GetEnterpriseToken` +
      `?orgNo=${orgNo}&env=${this.environment}&scopes=${scopes}`;

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
  public async getPersonalTokenByPid(pid: string): Promise<string> {
    const person = await this.getIds(pid);
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
      throw new Error(`Token retrieval failed for "getPersonalTokenByPid(${pid})"`);
    }
    return token;
  }

  /**
   * Henter userId, partyId og partyUuid for en gitt bruker eller organisasjon
   * @returns json objekt med info om en bruker eller organisasjon
   */
  public async getIds(pidOrOrgNo: string) {
    const url = `${env('API_BASE_URL')}/register/api/v1/access-management/parties/query?fields=person,party,user`;
    const subscriptionKey = env(`${env('ENV_NAME').toUpperCase()}_REGISTER_SUBSCRIPTION_KEY`);
    const platformToken = await this.getPlatformToken();
    var payload;
    if (pidOrOrgNo.length == 9) {
      payload = { data: [`urn:altinn:organization:identifier-no:${pidOrOrgNo}`] };
    } else {
      payload = { data: [`urn:altinn:person:identifier-no:${pidOrOrgNo}`] };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        PlatformAccessToken: platformToken,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch status for "getIds(${pidOrOrgNo})". Status: ${response.status}`,
      );
    }
    const responseData = await response.json();
    return await responseData.data[0];
  }

  /**
   * Samme oppslag som {@link getIds}, men for mange identifikatorer om gangen.
   *
   * Register tar en liste med urn-er i samme kall, så et datasett på noen hundre
   * personer og virksomheter koster noen få kall i stedet for ett per rad. Lista
   * deles i bolker, siden kallet har en øvre grense.
   *
   * @param pidsOrOrgNos - Fødselsnummer og organisasjonsnummer om hverandre. Lengde 9 leses som orgnr.
   * @param bolkStoerrelse - Hvor mange identifikatorer per kall.
   * @returns Oppslag fra identifikator til det Register svarte. Identifikatorer Register ikke kjenner mangler i kartet.
   */
  public async getIdsBulk(
    pidsOrOrgNos: string[],
    bolkStoerrelse = 40,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<Map<string, any>> {
    const url = `${env('API_BASE_URL')}/register/api/v1/access-management/parties/query?fields=person,party,user`;
    const subscriptionKey = env(`${env('ENV_NAME').toUpperCase()}_REGISTER_SUBSCRIPTION_KEY`);
    const platformToken = await this.getPlatformToken();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultat = new Map<string, any>();

    for (let i = 0; i < pidsOrOrgNos.length; i += bolkStoerrelse) {
      const bolk = pidsOrOrgNos.slice(i, i + bolkStoerrelse);
      const payload = {
        data: bolk.map((id) =>
          id.length === 9
            ? `urn:altinn:organization:identifier-no:${id}`
            : `urn:altinn:person:identifier-no:${id}`,
        ),
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          PlatformAccessToken: platformToken,
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch status for "getIdsBulk" (${bolk.length} identifikatorer). Status: ${response.status}`,
        );
      }

      const responseData = await response.json();

      // Svaret er ikke sortert som forespørselen, og ukjente identifikatorer
      // faller helt ut, så radene kobles tilbake på identifikatoren de bærer.
      for (const part of responseData.data ?? []) {
        const identifikator = part.organizationIdentifier ?? part.personIdentifier;
        if (identifikator) resultat.set(identifikator, part);
      }
    }

    return resultat;
  }

  /**
   * Retrieves the party UUID for a given identifier by delegating to the appropriate lookup.
   *
   * @param pidOrOrg - A personal identifier or organization number; values with length 9 are treated as organization numbers.
   * @returns A promise that resolves to the party UUID associated with the provided identifier.
   */
  public async getPartyUuid(pidOrOrg: string) {
    return (await this.getIds(pidOrOrg)).partyUuid;
  }

  public async getLastName(pid: string) {
    return (await this.getIds(pid)).lastName;
  }

  /**
   * Lager platform token som brukes til å slå opp blant annet userId, partyId, partyUuid.
   * @returns Platform Access Token
   */
  public async getPlatformToken() {
    if (this.platformToken != '') {
      return this.platformToken;
    }

    const url = `https://altinn-testtools-token-generator.azurewebsites.net/api/GetPlatformAccessToken?env=${env('ENV_NAME')}&app=testtjeneste&ttl=60000`;
    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    const headers = {
      Authorization: `Basic ${auth}`,
    };

    const token = await this.getAltinnToken(url, headers);

    if (!token) {
      throw new Error('Token retrieval failed for Platform Access token');
    }

    this.platformToken = token;
    return this.platformToken;
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
