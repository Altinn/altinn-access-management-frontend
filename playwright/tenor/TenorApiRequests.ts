import { MaskinportenToken } from 'playwright/api-requests/MaskinportenToken';
import { addTimeToNowUtc } from 'playwright/util/helper';

/**
 * Klient mot Tenor testdatasøk (Skatteetaten).
 *
 * Søk gjøres med Kibana Query Language (KQL) mot syntetisk Folkeregister
 * (kilde `freg`). Autentisering skjer via Maskinporten med scope
 * `skatteetaten:testnorge/testdata.read` — vi gjenbruker playwright-
 * prosjektets `MaskinportenToken` for å hente token.
 *
 * Endpoint og søkemønster følger referanseoppsettet i
 * https://github.com/Nyeng/tenor-testdata (lib/tenor.ts).
 */
const TENOR_BASE_URL = 'https://testdata.api.skatteetaten.no';
const TENOR_FREG_PATH = '/api/testnorge/v2/soek/freg';
const TENOR_SCOPE = 'skatteetaten:testnorge/testdata.read';

/** Antall år en person må være for å regnes som myndig. */
const MYNDIGHETSALDER = 18;

interface TenorDocument {
  tenorMetadata?: {
    id?: string;
    kildedata?: string;
  };
}

interface TenorResponse {
  dokumentListe?: TenorDocument[];
}

/** En testperson hentet fra Tenor. */
export interface TenorTestperson {
  /** Fødselsnummer (11 siffer). */
  foedselsnummer: string;
  /** Fornavn fra gjeldende navn i Folkeregisteret. */
  fornavn?: string;
  /** Mellomnavn fra gjeldende navn i Folkeregisteret. */
  mellomnavn?: string;
  /** Etternavn fra gjeldende navn i Folkeregisteret. */
  etternavn?: string;
  /** Fullt navn (fornavn [mellomnavn] etternavn). */
  navn?: string;
  /** Rå kildedata fra Folkeregisteret (parset JSON). */
  kildedata: Record<string, unknown>;
}

interface FregNavn {
  fornavn?: string;
  mellomnavn?: string;
  etternavn?: string;
  erGjeldende?: boolean;
}

export class TenorApiRequests {
  private readonly maskinporten: MaskinportenToken;

  /**
   * @param clientIdEnv Navn på env-variabel med Maskinporten client ID.
   * @param jwkEnv Navn på env-variabel med JWK (privat nøkkel) som JSON-string.
   */
  constructor(clientIdEnv = 'MASKINPORTEN_CLIENT_ID', jwkEnv = 'MASKINPORTEN_JWK') {
    this.maskinporten = new MaskinportenToken(clientIdEnv, jwkEnv);
  }

  /**
   * Kjører et KQL-søk mot Folkeregister-kilden i Tenor.
   * @param kql Søkestreng i Kibana Query Language.
   * @param antall Antall dokumenter som returneres. Default: 1.
   */
  async sokFreg(kql: string, antall = 1): Promise<TenorDocument[]> {
    const token = await this.maskinporten.getMaskinportenToken(TENOR_SCOPE);

    const url =
      `${TENOR_BASE_URL}${TENOR_FREG_PATH}` +
      `?kql=${encodeURIComponent(kql)}&vis=tenorMetadata&antall=${antall}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => 'Ukjent feil');
      throw new Error(`Tenor-søk feilet (HTTP ${response.status}): ${body}\nKQL: ${kql}`);
    }

    const json = (await response.json()) as TenorResponse;
    return json.dokumentListe ?? [];
  }

  /**
   * Henter én testperson (privatperson) som har personstatus "bosatt" og er
   * myndig (fyllt 18 år).
   *
   * Begge kriteriene uttrykkes direkte i KQL: `foedselsdato` er søkbar i Tenor,
   * så myndighet blir et datointervall (født senest for 18 år siden).
   *
   * @throws hvis ingen bosatt, myndig person finnes.
   */
  async hentBosattMyndigPerson(): Promise<TenorTestperson> {
    const [person] = await this.hentPersoner(TenorApiRequests.bosattMyndigKql(), 1);
    if (!person) {
      throw new Error('Fant ingen bosatt og myndig testperson i Tenor.');
    }
    return person;
  }

  /**
   * Kjører et KQL-søk og returnerer treffene som testpersoner.
   * @param kql Søkestreng i Kibana Query Language.
   * @param antall Antall personer som hentes. Default: 1.
   */
  async hentPersoner(kql: string, antall = 1): Promise<TenorTestperson[]> {
    const dokumenter = await this.sokFreg(kql, antall);
    return dokumenter
      .map((dokument) => this.dokumentTilPerson(dokument))
      .filter((person): person is TenorTestperson => person !== null);
  }

  /**
   * KQL for å finne privatpersoner som er bosatt og myndige (fyllt 18 år).
   * `foedselsdato` er søkbar i Tenor, så myndighet uttrykkes som et
   * datointervall (født senest for 18 år siden).
   */
  static bosattMyndigKql(): string {
    // Født senest denne datoen ⇒ har fyllt 18 år i dag.
    const senesteFoedselsdato = addTimeToNowUtc({ years: -MYNDIGHETSALDER }).slice(0, 10);
    return `personstatus:bosatt AND foedselsdato:[* to ${senesteFoedselsdato}]`;
  }

  /** Gjør om et Tenor-dokument til en testperson, eller null hvis fnr mangler. */
  private dokumentTilPerson(dokument: TenorDocument): TenorTestperson | null {
    const foedselsnummer = this.hentFoedselsnummer(dokument);
    if (!foedselsnummer) return null;

    const kildedata = this.parseKildedata(dokument);
    const navn = this.hentNavn(kildedata);

    return {
      foedselsnummer,
      ...navn,
      navn: [navn.fornavn, navn.mellomnavn, navn.etternavn].filter(Boolean).join(' ') || undefined,
      kildedata,
    };
  }

  /** Trekker ut gjeldende navn fra kildedata (faller tilbake til første oppføring). */
  private hentNavn(kildedata: Record<string, unknown>): FregNavn {
    const navnListe = Array.isArray(kildedata.navn) ? (kildedata.navn as FregNavn[]) : [];
    const gjeldende = navnListe.find((n) => n.erGjeldende) ?? navnListe[0];
    if (!gjeldende) return {};
    return {
      fornavn: gjeldende.fornavn,
      mellomnavn: gjeldende.mellomnavn,
      etternavn: gjeldende.etternavn,
    };
  }

  /** Trekker ut fødselsnummeret fra et Tenor-dokument. */
  private hentFoedselsnummer(dokument: TenorDocument): string | null {
    const id = dokument.tenorMetadata?.id;
    if (id && /^\d{11}$/.test(id)) return id;

    // Fallback: let etter et 11-sifret nummer i kildedata.
    const match = dokument.tenorMetadata?.kildedata?.match(/\b\d{11}\b/);
    return match ? match[0] : null;
  }

  /** Parser kildedata-JSON, eller returnerer tomt objekt ved feil. */
  private parseKildedata(dokument: TenorDocument): Record<string, unknown> {
    const raw = dokument.tenorMetadata?.kildedata;
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
}
