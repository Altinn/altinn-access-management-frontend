/**
 * TenorApiClient
 *
 * Fetches test user data from Skatteetaten's Tenor test data service.
 * Uses Maskinporten for auth (scope: skatteetaten:testnorge/testdata.read).
 *
 * Pipeline:
 *   1. Search Tenor brreg-er-fr for orgs with dagligLeder + kontaktpersoner
 *   2. Fetch roles from brreg PPE to get name + birth date
 *   3. Resolve full 11-digit PID from Tenor freg by name + birth date
 */

import { MaskinportenToken } from './MaskinportenToken';

const TENOR_SCOPE = 'skatteetaten:testnorge/testdata.read';
const TENOR_BASE = 'https://testdata.api.skatteetaten.no/api/testnorge/v2';
const BRREG_PPE_BASE = 'https://data.ppe.brreg.no/enhetsregisteret/api';

export interface TenorTestUser {
  orgNr: string;
  orgName: string;
  dagligLeder: {
    pid: string;
    name: string;
  };
  kontaktperson: {
    pid: string;
    name: string;
  };
}

interface BrregPerson {
  fodselsdato: string;
  navn: { fornavn: string; etternavn: string };
  erDoed: boolean;
}

interface BrregRollegruppe {
  type: { kode: string };
  roller: Array<{ person: BrregPerson; fratraadt: boolean; avregistrert: boolean }>;
}

export class TenorApiClient {
  private maskinporten: MaskinportenToken;
  private tenorToken: string | null = null;

  constructor(clientIdEnv = 'MASKINPORTEN_CLIENT_ID', jwkEnv = 'MASKINPORTEN_JWK') {
    this.maskinporten = new MaskinportenToken(clientIdEnv, jwkEnv);
  }

  private async getToken(): Promise<string> {
    if (!this.tenorToken) {
      this.tenorToken = await this.maskinporten.getMaskinportenToken(TENOR_SCOPE);
    }
    return this.tenorToken;
  }

  private async tenorGet(path: string): Promise<unknown> {
    const token = await this.getToken();
    const res = await fetch(`${TENOR_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error(`Tenor API ${path}: ${res.status} ${await res.text()}`);
    }
    return res.json();
  }

  /** Search brreg-er-fr for org numbers that have both dagligLeder and kontaktpersoner. */
  async searchOrgIds(size = 20, page = 0): Promise<string[]> {
    const params = new URLSearchParams({
      kql: 'dagligLeder:* and kontaktpersoner:*',
      size: String(size),
      page: String(page),
    });
    const data = (await this.tenorGet(`/soek/brreg-er-fr?${params}`)) as {
      dokumentListe: Array<{ tenorMetadata: { id: string } }>;
    };
    return data.dokumentListe.map((d) => d.tenorMetadata.id);
  }

  /**
   * Fetch dagligLeder + kontaktperson for a given org number from the brreg PPE roles API.
   * Returns null if the org doesn't have both roles, or if either person is dead.
   */
  async fetchRoles(
    orgNr: string,
  ): Promise<{ orgName: string; dagligLeder: BrregPerson; kontaktperson: BrregPerson } | null> {
    const [orgRes, rolesRes] = await Promise.all([
      fetch(`${BRREG_PPE_BASE}/enheter/${orgNr}`),
      fetch(`${BRREG_PPE_BASE}/enheter/${orgNr}/roller`),
    ]);

    if (!orgRes.ok || !rolesRes.ok) return null;

    const orgData = (await orgRes.json()) as { navn: string };
    const rolesData = (await rolesRes.json()) as { rollegrupper: BrregRollegruppe[] };

    const daglGroup = rolesData.rollegrupper?.find((g) => g.type.kode === 'DAGL');
    const kontGroup = rolesData.rollegrupper?.find((g) => g.type.kode === 'KONT');

    const dagligLeder = daglGroup?.roller?.find((r) => !r.fratraadt && !r.avregistrert)?.person;
    const kontaktperson = kontGroup?.roller?.find((r) => !r.fratraadt && !r.avregistrert)?.person;

    if (!dagligLeder || !kontaktperson || dagligLeder.erDoed || kontaktperson.erDoed) {
      return null;
    }

    return { orgName: orgData.navn, dagligLeder, kontaktperson };
  }

  /** Resolve a full 11-digit PID from Tenor freg by first name, last name, and birth date. */
  async resolvePid(
    fornavn: string,
    etternavn: string,
    foedselsdato: string,
  ): Promise<string | null> {
    const params = new URLSearchParams({
      kql: `fornavn:${fornavn} and etternavn:${etternavn} and foedselsdato:${foedselsdato}`,
      size: '1',
    });
    const data = (await this.tenorGet(`/soek/freg?${params}`)) as {
      dokumentListe: Array<{ tenorMetadata: { id: string } }>;
    };
    return data.dokumentListe?.[0]?.tenorMetadata?.id ?? null;
  }

  /**
   * Collect `count` usable test user pairs: (orgNr, dagligLederPid, kontaktpersonPid).
   * Searches multiple pages if needed to fill the requested count.
   */
  async collectTestUsers(count: number): Promise<TenorTestUser[]> {
    const results: TenorTestUser[] = [];
    let page = 0;

    while (results.length < count) {
      const orgIds = await this.searchOrgIds(20, page);
      if (orgIds.length === 0) break;

      for (const orgNr of orgIds) {
        if (results.length >= count) break;

        const roles = await this.fetchRoles(orgNr);
        if (!roles) continue;

        const { orgName, dagligLeder, kontaktperson } = roles;

        const [daglPid, kontPid] = await Promise.all([
          this.resolvePid(
            dagligLeder.navn.fornavn,
            dagligLeder.navn.etternavn,
            dagligLeder.fodselsdato,
          ),
          this.resolvePid(
            kontaktperson.navn.fornavn,
            kontaktperson.navn.etternavn,
            kontaktperson.fodselsdato,
          ),
        ]);

        if (!daglPid || !kontPid) continue;

        results.push({
          orgNr,
          orgName,
          dagligLeder: {
            pid: daglPid,
            name: `${dagligLeder.navn.fornavn} ${dagligLeder.navn.etternavn}`,
          },
          kontaktperson: {
            pid: kontPid,
            name: `${kontaktperson.navn.fornavn} ${kontaktperson.navn.etternavn}`,
          },
        });

        console.log(
          `[${results.length}/${count}] ${orgNr} ${orgName}: DAGL=${daglPid}, KONT=${kontPid}`,
        );
      }

      page++;
    }

    return results;
  }

  /**
   * Find a person in Tenor who has beregnetSkatt data for the given inntektsaar.
   * Uses the freg dataset with a KQL filter on tenorRelasjoner.beregnetSkatt.
   */
  async findPersonWithBeregnetSkatt(inntektsaar: number): Promise<string> {
    const params = new URLSearchParams({
      kql: `tenorRelasjoner.beregnetSkatt:{pensjonsgivendeInntekt:true and inntektsaar:${inntektsaar}}`,
      size: '5',
    });
    const data = (await this.tenorGet(`/soek/freg?${params}`)) as {
      dokumentListe: Array<{ tenorMetadata: { id: string } }>;
    };
    const pid = data.dokumentListe?.[0]?.tenorMetadata?.id;
    if (!pid) {
      throw new Error(`No person found with beregnetSkatt for inntektsaar ${inntektsaar}`);
    }
    return pid;
  }

  /**
   * Find a person in Tenor who has samletReskontroinnsyn (krav og betalinger) data.
   */
  async findPersonWithSamletReskontroinnsyn(): Promise<string> {
    const params = new URLSearchParams({
      kql: 'tenorRelasjoner.samletReskontroinnsyn:{harKrav:*}',
      size: '5',
    });
    const data = (await this.tenorGet(`/soek/freg?${params}`)) as {
      dokumentListe: Array<{ tenorMetadata: { id: string } }>;
    };
    const pid = data.dokumentListe?.[0]?.tenorMetadata?.id;
    if (!pid) {
      throw new Error('No person found with samletReskontroinnsyn data');
    }
    return pid;
  }

  /**
   * Find an org in Tenor that has beregnetSkatt data for the given inntektsaar,
   * and resolve a dagligLeder PID who can approve consent on behalf of the org.
   */
  async findOrgWithBeregnetSkatt(
    inntektsaar: number,
  ): Promise<{ orgNr: string; dagligLederPid: string }> {
    const params = new URLSearchParams({
      kql: `tenorRelasjoner.beregnetSkatt:{inntektsaar:${inntektsaar}} and dagligLeder:*`,
      size: '20',
    });
    const data = (await this.tenorGet(`/soek/brreg-er-fr?${params}`)) as {
      dokumentListe: Array<{ tenorMetadata: { id: string } }>;
    };

    for (const doc of data.dokumentListe ?? []) {
      const orgNr = doc.tenorMetadata.id;
      const roles = await this.fetchRoles(orgNr);
      if (!roles) continue;

      const { dagligLeder } = roles;
      const pid = await this.resolvePid(
        dagligLeder.navn.fornavn,
        dagligLeder.navn.etternavn,
        dagligLeder.fodselsdato,
      );
      if (!pid) continue;

      return { orgNr, dagligLederPid: pid };
    }

    throw new Error(`No org found with beregnetSkatt for inntektsaar ${inntektsaar}`);
  }

  /**
   * Find an org in Tenor that has samletReskontroinnsyn (krav og betalinger) data,
   * and resolve a dagligLeder PID who can approve consent on behalf of the org.
   */
  async findOrgWithSamletReskontroinnsyn(): Promise<{ orgNr: string; dagligLederPid: string }> {
    for (let page = 0; page < 10; page++) {
      const params = new URLSearchParams({
        kql: 'tenorRelasjoner.samletReskontroinnsyn:{harKrav:*}',
        size: '50',
        page: String(page),
      });
      const data = (await this.tenorGet(`/soek/brreg-er-fr?${params}`)) as {
        dokumentListe: Array<{ tenorMetadata: { id: string } }>;
      };

      for (const doc of data.dokumentListe ?? []) {
        const orgNr = doc.tenorMetadata.id;

        const rolesRes = await fetch(`${BRREG_PPE_BASE}/enheter/${orgNr}/roller`);
        if (!rolesRes.ok) continue;
        const rolesData = (await rolesRes.json()) as { rollegrupper: BrregRollegruppe[] };

        const daglGroup = rolesData.rollegrupper?.find((g) => g.type.kode === 'DAGL');
        const dagligLeder = daglGroup?.roller?.find((r) => !r.fratraadt && !r.avregistrert)?.person;
        if (!dagligLeder || dagligLeder.erDoed) continue;

        const pid = await this.resolvePid(
          dagligLeder.navn.fornavn,
          dagligLeder.navn.etternavn,
          dagligLeder.fodselsdato,
        );
        if (!pid) continue;

        return { orgNr, dagligLederPid: pid };
      }
    }

    throw new Error('No org found with samletReskontroinnsyn data');
  }
}
