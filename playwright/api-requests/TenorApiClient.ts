/**
 * TenorApiClient
 *
 * Henter dagligledere fra Skatteetatens Tenor testdatatjeneste.
 * Bruker Maskinporten for autentisering (scope: skatteetaten:testnorge/testdata.read).
 *
 * Pipeline:
 *   1. Søk i brreg-er-fr etter orgnummer med dagligLeder
 *   2. Hent dagligLeder fra brreg PPE (navn + fødselsdato)
 *   3. Slå opp fullt 11-sifret PID fra Tenor freg via navn + fødselsdato
 */

import { MaskinportenToken } from './MaskinportenToken';

const TENOR_SCOPE = 'skatteetaten:testnorge/testdata.read';
const TENOR_BASE = 'https://testdata.api.skatteetaten.no/api/testnorge/v2';
const BRREG_PPE_BASE = 'https://data.ppe.brreg.no/enhetsregisteret/api';

export interface TenorDagligLeder {
  orgNr: string;
  orgName: string;
  pid: string;
  name: string;
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

  async searchOrgIds(size = 20, page = 0): Promise<string[]> {
    const params = new URLSearchParams({
      kql: 'dagligLeder:*',
      size: String(size),
      page: String(page),
    });
    const data = (await this.tenorGet(`/soek/brreg-er-fr?${params}`)) as {
      dokumentListe: Array<{ tenorMetadata: { id: string } }>;
    };
    return data.dokumentListe.map((d) => d.tenorMetadata.id);
  }

  async fetchDagligLeder(
    orgNr: string,
  ): Promise<{ orgName: string; dagligLeder: BrregPerson } | null> {
    const [orgRes, rolesRes] = await Promise.all([
      fetch(`${BRREG_PPE_BASE}/enheter/${orgNr}`),
      fetch(`${BRREG_PPE_BASE}/enheter/${orgNr}/roller`),
    ]);

    if (!orgRes.ok || !rolesRes.ok) return null;

    const orgData = (await orgRes.json()) as { navn: string };
    const rolesData = (await rolesRes.json()) as { rollegrupper: BrregRollegruppe[] };

    const daglGroup = rolesData.rollegrupper?.find((g) => g.type.kode === 'DAGL');
    const dagligLeder = daglGroup?.roller?.find((r) => !r.fratraadt && !r.avregistrert)?.person;

    if (!dagligLeder || dagligLeder.erDoed) return null;

    return { orgName: orgData.navn, dagligLeder };
  }

  async resolvePid(
    fornavn: string,
    etternavn: string,
    foedselsdato: string,
  ): Promise<string | null> {
    const params = new URLSearchParams({
      kql: `fornavn:"${fornavn}" and etternavn:"${etternavn}" and foedselsdato:"${foedselsdato}"`,
      size: '1',
    });
    const data = (await this.tenorGet(`/soek/freg?${params}`)) as {
      dokumentListe: Array<{ tenorMetadata: { id: string } }>;
    };
    return data.dokumentListe?.[0]?.tenorMetadata?.id ?? null;
  }

  async collectDagligLedere(count: number): Promise<TenorDagligLeder[]> {
    const results: TenorDagligLeder[] = [];
    let page = 0;

    while (results.length < count) {
      const orgIds = await this.searchOrgIds(20, page);
      if (orgIds.length === 0) break;

      for (const orgNr of orgIds) {
        if (results.length >= count) break;

        const data = await this.fetchDagligLeder(orgNr);
        if (!data) continue;

        const { orgName, dagligLeder } = data;
        const pid = await this.resolvePid(
          dagligLeder.navn.fornavn,
          dagligLeder.navn.etternavn,
          dagligLeder.fodselsdato,
        );

        if (!pid) continue;

        results.push({
          orgNr,
          orgName,
          pid,
          name: `${dagligLeder.navn.fornavn} ${dagligLeder.navn.etternavn}`,
        });

        console.log(`[${results.length}/${count}] ${orgNr} ${orgName}: PID=${pid}`);
      }

      page++;
    }

    return results;
  }
}
