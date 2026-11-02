import { env } from 'playwright/util/helper';

import { buildUrl, send, sendJson } from './apiRequest';

const TOKEN_GENERATOR = 'https://altinn-testtools-token-generator.azurewebsites.net/api';

/** A party as returned by the register's parties query (`fields=person,party,user`). */
export interface RegisterParty {
  partyUuid: string;
  partyId: number;
  lastName?: string;
  user?: { userId: number };
  [field: string]: unknown;
}

/*
 * Register data for a test party does not change during a run, so lookups are shared by every
 * Token in the worker instead of repeated for each API call. A failed lookup is dropped so the
 * next call tries again.
 */
const parties = new Map<string, Promise<RegisterParty>>();
let platformToken: Promise<string> | undefined;

/**
 * Generated tokens are reused for a while instead of fetched for every API call. Well inside the
 * shortest token lifetime, and longer than a full run takes.
 */
const TOKEN_MAX_AGE_MS = 10 * 60_000;
const tokens = new Map<string, { token: Promise<string>; created: number }>();

function cachedToken(key: string, create: () => Promise<string>): Promise<string> {
  const cached = tokens.get(key);
  if (cached && Date.now() - cached.created < TOKEN_MAX_AGE_MS) return cached.token;

  const token = create();
  tokens.set(key, { token, created: Date.now() });
  token.catch(() => tokens.delete(key));
  return token;
}

export class Token {
  private readonly username = env('USERNAME_TEST_API');
  private readonly password = env('PASSWORD_TEST_API');
  private readonly environment = env('ENV_NAME');

  public async getEnterpriseAltinnToken(orgNo: string, scopes: string): Promise<string> {
    return cachedToken(`enterprise:${orgNo}:${scopes}`, () =>
      this.generateToken('GetEnterpriseToken', { orgNo, env: this.environment, scopes }),
    );
  }

  public async getPersonalCleanupAltinnToken(person: {
    PID?: string;
    UserId?: string;
    PartyId?: string;
    PartyUUID?: string;
  }): Promise<string> {
    return this.personalToken({
      pid: person.PID ?? '',
      userid: person.UserId ?? '',
      partyid: person.PartyId ?? '',
      partyUuid: person.PartyUUID ?? '',
    });
  }

  /**
   * Tar imot en PID og returnerer en personal token
   * @returns personal token
   */
  public async getPersonalTokenByPid(pid: string): Promise<string> {
    return cachedToken(`personal:${pid}`, () => this.createPersonalToken(pid));
  }

  private async createPersonalToken(pid: string): Promise<string> {
    const person = await this.getIds(pid);

    // A party without a user is an organisation, not a person — a personal token
    // cannot be built from it. Caught here so the error names the real problem.
    if (!person.user?.userId) {
      throw new Error(
        `Party "${pid}" has no user in ${this.environment}, so no personal token can be created. ` +
          `A personal token needs a person's PID — an organisation number will not work.`,
      );
    }
    return this.personalToken({
      pid,
      userid: String(person.user.userId),
      partyid: String(person.partyId),
      partyUuid: person.partyUuid,
    });
  }

  /**
   * Henter userId, partyId og partyUuid for en gitt bruker eller organisasjon
   * @returns json objekt med info om en bruker eller organisasjon
   */
  public async getIds(pidOrOrgNo: string): Promise<RegisterParty> {
    let party = parties.get(pidOrOrgNo);
    if (!party) {
      party = this.lookUpParty(pidOrOrgNo);
      parties.set(pidOrOrgNo, party);
      party.catch(() => parties.delete(pidOrOrgNo));
    }
    return party;
  }

  /**
   * Retrieves the party UUID for a given identifier.
   *
   * @param pidOrOrg - A personal identifier or organization number; values with length 9 are treated as organization numbers.
   */
  public async getPartyUuid(pidOrOrg: string): Promise<string> {
    return (await this.getIds(pidOrOrg)).partyUuid;
  }

  public async getLastName(pid: string): Promise<string> {
    const { lastName } = await this.getIds(pid);
    if (!lastName) throw new Error(`Party "${pid}" has no last name — is it an organisation?`);
    return lastName;
  }

  /**
   * Lager platform token som brukes til å slå opp blant annet userId, partyId, partyUuid.
   * @returns Platform Access Token
   */
  public async getPlatformToken(): Promise<string> {
    if (!platformToken) {
      platformToken = this.generateToken('GetPlatformAccessToken', {
        env: this.environment,
        app: 'testtjeneste',
        ttl: 60000,
      });
      platformToken.catch(() => (platformToken = undefined));
    }
    return platformToken;
  }

  private async lookUpParty(pidOrOrgNo: string): Promise<RegisterParty> {
    const isOrg = pidOrOrgNo.length === 9;
    const urn = isOrg
      ? `urn:altinn:organization:identifier-no:${pidOrOrgNo}`
      : `urn:altinn:person:identifier-no:${pidOrOrgNo}`;

    const response = await sendJson<{ data?: RegisterParty[] }>(
      'POST',
      buildUrl(env('API_BASE_URL'), 'register/api/v1/access-management/parties/query', {
        fields: 'person,party,user',
      }),
      {
        headers: {
          PlatformAccessToken: await this.getPlatformToken(),
          'Ocp-Apim-Subscription-Key': env(
            `${this.environment.toUpperCase()}_REGISTER_SUBSCRIPTION_KEY`,
          ),
        },
        json: { data: [urn] },
      },
    );

    // The register answers 200 with an empty `data` array for an identifier it
    // does not know — almost always a typo'd or unfilled test-data identifier.
    const party = response?.data?.[0];
    if (!party) {
      throw new Error(
        `No party found for ${isOrg ? 'organisation number' : 'PID'} "${pidOrOrgNo}" in ${this.environment}. ` +
          `Check that it exists in this environment's register and that the test data is filled in.`,
      );
    }
    return party;
  }

  private personalToken(ids: { pid: string; userid: string; partyid: string; partyUuid: string }) {
    return this.generateToken('GetPersonalToken', {
      env: this.environment,
      ...ids,
      authLvl: 3,
      ttl: 3000,
      scopes: 'altinn:portal/enduser',
    });
  }

  private async generateToken(
    endpoint: string,
    query: Record<string, string | number>,
  ): Promise<string> {
    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    const response = await send('GET', buildUrl(TOKEN_GENERATOR, endpoint, query), {
      headers: { Authorization: `Basic ${auth}` },
    });
    const token = await response.text();
    if (!token) throw new Error(`Token generator returned an empty token from ${endpoint}`);
    return token;
  }
}
