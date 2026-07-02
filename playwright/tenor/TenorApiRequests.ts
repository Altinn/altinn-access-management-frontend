import { MaskinportenToken } from 'playwright/api-requests/MaskinportenToken';
import { addTimeToNowUtc } from 'playwright/util/helper';

/**
 * Klient mot Tenor testdatasøk (Skatteetaten).
 *
 * Søk gjøres med Kibana Query Language (KQL) mot syntetisk Folkeregister
 * (kilde `freg`) og Enhets-/Foretaksregister (kilde `brreg-er-fr`).
 * Autentisering skjer via Maskinporten med scope
 * `skatteetaten:testnorge/testdata.read` — vi gjenbruker playwright-
 * prosjektets `MaskinportenToken` for å hente token.
 *
 * Endpoint og søkemønster følger referanseoppsettet i
 * https://github.com/Nyeng/tenor-testdata (lib/tenor.ts).
 */
const TENOR_BASE_URL = 'https://testdata.api.skatteetaten.no';
const TENOR_SOEK_PATH = '/api/testnorge/v2/soek';
const TENOR_SCOPE = 'skatteetaten:testnorge/testdata.read';

/** Antall år en person må være for å regnes som myndig. */
const MYNDIGHETSALDER = 18;

/** Roller en virksomhet kan ha som tilrettelegger (facilitator) for klienter. */
export type FacilitatorRolle = 'revisor' | 'regnskapsfoerer' | 'forretningsfoerer';

/**
 * Tenor-søkefeltet og rollegruppe-koden per facilitator-rolle.
 * `<felt>:*` finner klienter som har rollen; `<felt>:<orgnr>` finner klientene
 * til en bestemt facilitator. Facilitatorens orgnr leses fra klientens
 * rollegruppe med tilhørende `rolleKode`.
 */
const FACILITATOR_ROLLER: Record<FacilitatorRolle, { felt: string; rolleKode: string }> = {
  revisor: { felt: 'revisorerOrgnr', rolleKode: 'REVI' },
  regnskapsfoerer: { felt: 'regnskapsfoerereOrgnr', rolleKode: 'REGN' },
  forretningsfoerer: { felt: 'forretningsfoerereOrgnr', rolleKode: 'FFØR' },
};

/** En virksomhet (klient) hentet fra Tenor. */
export interface TenorVirksomhet {
  organisasjonsnummer: string;
  navn: string;
}

/** En facilitator-virksomhet med daglig leder og klienter. */
export interface TenorFacilitator extends TenorVirksomhet {
  rolle: FacilitatorRolle;
  /** Fødselsnummer til daglig leder (eller innehaver), eller null. */
  dagligLeder: string | null;
  klienter: TenorVirksomhet[];
}

interface TenorDocument {
  tenorMetadata?: {
    id?: string;
    kildedata?: string;
  };
}

interface TenorResponse {
  dokumentListe?: TenorDocument[];
  /** Neste side-indeks (null/undefined når det ikke er flere sider). */
  nesteSide?: number | null;
  /** Seed for stabil rekkefølge – må sendes med på påfølgende sider. */
  seed?: number;
}

/** Tenor returnerer maks 200 dokumenter per kall. */
const TENOR_MAX_PER_PAGE = 200;

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

interface RolleGruppe {
  type?: { kode?: string };
  roller?: Array<{
    virksomhet?: { organisasjonsnummer?: string };
    person?: { foedselsnummer?: string };
  }>;
}

export class TenorApiRequests {
  private readonly maskinporten: MaskinportenToken;
  private tokenPromise?: Promise<string>;

  /**
   * @param clientIdEnv Navn på env-variabel med Maskinporten client ID.
   * @param jwkEnv Navn på env-variabel med JWK (privat nøkkel) som JSON-string.
   */
  constructor(clientIdEnv = 'MASKINPORTEN_CLIENT_ID', jwkEnv = 'MASKINPORTEN_JWK') {
    this.maskinporten = new MaskinportenToken(clientIdEnv, jwkEnv);
  }

  /**
   * Henter Maskinporten-token én gang per instans og gjenbruker det. Uten dette
   * gjør hvert `sok`/`tellTreff`-kall en ny token-POST, som ved skanning av mange
   * kandidater gir unødvendig mange auth-rundturer og økt throttling-risiko.
   */
  private getToken(): Promise<string> {
    this.tokenPromise ??= this.maskinporten.getMaskinportenToken(TENOR_SCOPE);
    return this.tokenPromise;
  }

  /**
   * Kjører et KQL-søk mot en Tenor-kilde.
   * @param kilde Tenor-kilde, f.eks. `freg` eller `brreg-er-fr`.
   * @param kql Søkestreng i Kibana Query Language.
   * @param antall Antall dokumenter som returneres. Default: 1.
   */
  async sok(kilde: string, kql: string, antall = 1): Promise<TenorDocument[]> {
    const token = await this.getToken();

    const url =
      `${TENOR_BASE_URL}${TENOR_SOEK_PATH}/${kilde}` +
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

  /** Kjører et KQL-søk mot Folkeregister-kilden (`freg`). */
  async sokFreg(kql: string, antall = 1): Promise<TenorDocument[]> {
    return this.sok('freg', kql, antall);
  }

  /** Kjører et KQL-søk mot Enhets-/Foretaksregister-kilden (`brreg-er-fr`). */
  async sokBrreg(kql: string, antall = 1): Promise<TenorDocument[]> {
    return this.sok('brreg-er-fr', kql, antall);
  }

  /** Returnerer antall treff for et KQL-søk uten å hente dokumentene. */
  async tellTreff(kilde: string, kql: string): Promise<number> {
    const token = await this.getToken();
    const url = `${TENOR_BASE_URL}${TENOR_SOEK_PATH}/${kilde}?kql=${encodeURIComponent(kql)}&antall=0`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!response.ok) {
      const body = await response.text().catch(() => 'Ukjent feil');
      throw new Error(`Tenor-telling feilet (HTTP ${response.status}): ${body}\nKQL: ${kql}`);
    }
    const json = (await response.json()) as { treff?: number };
    return json.treff ?? 0;
  }

  /**
   * Henter en facilitator-virksomhet (revisor/regnskapsfører/forretningsfører)
   * med daglig leder og klientliste fra Tenor.
   *
   * Flyt:
   * 1. `<felt>:*` finner en klient som har rollen.
   * 2. Facilitatorens orgnr leses fra klientens rollegruppe (REVI/REGN/FFØR).
   * 3. Daglig leder hentes fra facilitator-virksomheten.
   * 4. `<felt>:<facilitatorOrg>` gir facilitatorens klienter.
   *
   * @param rolle Hvilken facilitator-rolle.
   * @param antallKlienter Maks antall klienter som hentes. Default: 5.
   */
  async hentFacilitatorMedKlienter(
    rolle: FacilitatorRolle,
    antallKlienter = 5,
  ): Promise<TenorFacilitator> {
    const { felt, rolleKode } = FACILITATOR_ROLLER[rolle];

    // Skann en liten batch og bruk første klient som faktisk gir en facilitator,
    // slik at ett ufullstendig dokument ikke feiler hele oppslaget.
    const kandidater = await this.sokBrreg(`${felt}:*`, 10);
    const facilitatorOrg =
      kandidater
        .map((klient) => this.hentRolleVirksomhet(klient, rolleKode))
        .find((org): org is string => org !== null) ?? null;
    if (!facilitatorOrg) {
      throw new Error(`Fant ingen ${rolle}-virksomhet i Tenor (felt: ${felt}).`);
    }

    return this.byggFacilitator(rolle, facilitatorOrg, antallKlienter);
  }

  /**
   * Henter en facilitator-virksomhet som har få klienter — nyttig for tester
   * der man vil delegere alle klienter uten å treffe tusenvis.
   *
   * Skanner et utvalg klient-kandidater, teller klientene til hver unike
   * facilitator, og velger den med færrest klienter (så lenge den har minst 1
   * og høyst `maksKlienter`).
   *
   * @param rolle Hvilken facilitator-rolle.
   * @param maksKlienter Øvre grense for antall klienter. Default: 50.
   * @param antallKandidater Hvor mange klient-kandidater som skannes. Default: 100.
   */
  async hentFacilitatorMedFaaKlienter(
    rolle: FacilitatorRolle,
    maksKlienter = 50,
    antallKandidater = 100,
  ): Promise<TenorFacilitator> {
    const { felt, rolleKode } = FACILITATOR_ROLLER[rolle];

    const kandidater = await this.sokBrreg(`${felt}:*`, antallKandidater);
    const facilitatorOrg = new Set<string>();
    for (const klient of kandidater) {
      const org = this.hentRolleVirksomhet(klient, rolleKode);
      if (org) facilitatorOrg.add(org);
    }
    if (facilitatorOrg.size === 0) {
      throw new Error(`Fant ingen ${rolle}-virksomhet i Tenor (felt: ${felt}).`);
    }

    let beste: { org: string; antall: number } | null = null;
    for (const org of facilitatorOrg) {
      const antall = await this.tellTreff('brreg-er-fr', `${felt}:${org}`);
      if (antall < 1 || antall > maksKlienter) continue;
      if (!beste || antall < beste.antall) beste = { org, antall };
    }

    if (!beste) {
      throw new Error(
        `Fant ingen ${rolle}-virksomhet med 1–${maksKlienter} klienter blant ${facilitatorOrg.size} kandidater. ` +
          `Prøv en høyere --maks-klienter eller flere kandidater.`,
      );
    }

    return this.byggFacilitator(rolle, beste.org, beste.antall);
  }

  /** Bygger en facilitator med daglig leder og klientliste fra et orgnr. */
  private async byggFacilitator(
    rolle: FacilitatorRolle,
    facilitatorOrg: string,
    antallKlienter: number,
  ): Promise<TenorFacilitator> {
    const { felt } = FACILITATOR_ROLLER[rolle];

    const [facilitator] = await this.sokBrreg(`organisasjonsnummer:${facilitatorOrg}`, 1);
    if (!facilitator) {
      throw new Error(`Fant ikke facilitator-virksomhet ${facilitatorOrg} i Tenor.`);
    }
    const facilitatorData = this.parseKildedata(facilitator);

    const klientDokumenter = await this.sokBrreg(`${felt}:${facilitatorOrg}`, antallKlienter);
    const klienter = klientDokumenter
      .map((d) => this.hentVirksomhet(d))
      .filter((v): v is TenorVirksomhet => v !== null);

    return {
      rolle,
      organisasjonsnummer: facilitatorOrg,
      navn: typeof facilitatorData.navn === 'string' ? facilitatorData.navn : '',
      dagligLeder: this.hentDagligLeder(facilitatorData),
      klienter,
    };
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
   * Henter mange unike dokumenter fra en Tenor-kilde forbi 200-grensen. Dyp
   * paginering er begrenset til de første 200 treffene per søk (`nesteSide` blir
   * null når `offset + antall >= 200`), så vi kan ikke bla oss gjennom hele
   * trefflista. I stedet henter vi flere batcher à 200 med ulik `seed`: hver
   * seed gir en egen tilfeldig rekkefølge, og de første 200 fra hver seed er i
   * praksis disjunkte (trefflistene er på hundretusener). Vi unioner (dedup på
   * `tenorMetadata.id` – fødselsnummer for freg, orgnr for brreg) til vi har nok.
   *
   * Dette er den generelle bulk-byggesteinen; bruk `hentPersonerPaginert` /
   * `hentVirksomheterPaginert` for typede resultater.
   *
   * @param kilde Tenor-kilde, f.eks. `freg` eller `brreg-er-fr`.
   * @param kql Søkestreng i Kibana Query Language.
   * @param antall Totalt antall unike dokumenter som ønskes.
   */
  async hentDokumenterPaginert(
    kilde: string,
    kql: string,
    antall: number,
  ): Promise<TenorDocument[]> {
    const token = await this.getToken();
    const dokumenter = new Map<string, TenorDocument>(); // dedup på tenorMetadata.id
    // Tillat noen ekstra batcher i tilfelle overlapp mellom seeds.
    const maksBatcher = Math.ceil(antall / TENOR_MAX_PER_PAGE) + 5;

    for (let seed = 1; dokumenter.size < antall && seed <= maksBatcher; seed++) {
      const params = new URLSearchParams({
        kql,
        vis: 'tenorMetadata',
        antall: String(TENOR_MAX_PER_PAGE),
        side: '0',
        seed: String(seed),
      });

      const url = `${TENOR_BASE_URL}${TENOR_SOEK_PATH}/${kilde}?${params.toString()}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!response.ok) {
        const body = await response.text().catch(() => 'Ukjent feil');
        throw new Error(`Tenor-søk feilet (HTTP ${response.status}): ${body}\nKQL: ${kql}`);
      }

      const json = (await response.json()) as TenorResponse;
      const docs = json.dokumentListe ?? [];
      if (docs.length === 0) break; // ikke flere treff å hente
      for (const d of docs) {
        const key = d.tenorMetadata?.id;
        if (!key) continue; // uten id kan vi ikke garantere unikhet – hopp over
        if (!dokumenter.has(key)) dokumenter.set(key, d);
      }
    }

    return [...dokumenter.values()].slice(0, antall);
  }

  /**
   * Henter mange unike personer (freg) forbi Tenor sin 200-grense.
   * @param kql Søkestreng i Kibana Query Language.
   * @param antall Totalt antall unike personer som ønskes.
   */
  async hentPersonerPaginert(kql: string, antall: number): Promise<TenorTestperson[]> {
    const dokumenter = await this.hentDokumenterPaginert('freg', kql, antall);
    return dokumenter
      .map((d) => this.dokumentTilPerson(d))
      .filter((person): person is TenorTestperson => person !== null)
      .slice(0, antall);
  }

  /**
   * Henter mange unike virksomheter (brreg) forbi Tenor sin 200-grense.
   * @param kql Søkestreng i Kibana Query Language, f.eks. `organisasjonsform.kode:AS`.
   * @param antall Totalt antall unike virksomheter som ønskes.
   */
  async hentVirksomheterPaginert(kql: string, antall: number): Promise<TenorVirksomhet[]> {
    const dokumenter = await this.hentDokumenterPaginert('brreg-er-fr', kql, antall);
    return dokumenter
      .map((d) => this.hentVirksomhet(d))
      .filter((v): v is TenorVirksomhet => v !== null)
      .slice(0, antall);
  }

  /**
   * Henter mange unike facilitator-orgnr (revisor/regnskapsfører/forretningsfører)
   * i bulk – f.eks. «100 revisor-virksomheter».
   *
   * Tenor har ingen direkte «er revisor»-flagg på virksomheten selv, så vi
   * skanner klient-virksomheter (`<felt>:*`) i bulk og plukker ut facilitatorens
   * orgnr fra hver klients rollegruppe (REVI/REGN/FFØR), deduplisert. Flere
   * klienter deler ofte samme facilitator, så `maksKandidater` settes romslig
   * over `antall`.
   *
   * @param rolle Hvilken facilitator-rolle.
   * @param antall Antall unike facilitator-orgnr som ønskes.
   * @param maksKandidater Hvor mange klient-kandidater som skannes. Default: `antall * 20`.
   */
  async hentFacilitatorOrgnr(
    rolle: FacilitatorRolle,
    antall: number,
    maksKandidater = antall * 20,
  ): Promise<string[]> {
    const { felt, rolleKode } = FACILITATOR_ROLLER[rolle];
    const kandidater = await this.hentDokumenterPaginert(
      'brreg-er-fr',
      `${felt}:*`,
      maksKandidater,
    );

    const orgnr = new Set<string>();
    for (const klient of kandidater) {
      const org = this.hentRolleVirksomhet(klient, rolleKode);
      if (org) orgnr.add(org);
      if (orgnr.size >= antall) break;
    }
    return [...orgnr].slice(0, antall);
  }

  /**
   * Henter fødselsnummeret til daglig leder (eller innehaver) for en virksomhet.
   * @returns fnr, eller null hvis virksomheten mangler DAGL/INNH-rolle.
   */
  async hentDagligLederForOrg(orgnr: string): Promise<string | null> {
    const [virksomhet] = await this.sokBrreg(`organisasjonsnummer:${orgnr}`, 1);
    if (!virksomhet) return null;
    return this.hentDagligLeder(this.parseKildedata(virksomhet));
  }

  /**
   * Slår opp daglig leder for mange virksomheter – f.eks. «personene som er DAGL
   * for disse revisor-virksomhetene». Hver virksomhet krever ett oppslag, så
   * dette gjøres sekvensielt for å holde token-/throttling-presset lavt.
   * @param orgnrListe Orgnr å slå opp daglig leder for.
   */
  async hentDagligLedere(
    orgnrListe: string[],
  ): Promise<Array<{ organisasjonsnummer: string; dagligLeder: string | null }>> {
    const resultat: Array<{ organisasjonsnummer: string; dagligLeder: string | null }> = [];
    for (const orgnr of orgnrListe) {
      resultat.push({
        organisasjonsnummer: orgnr,
        dagligLeder: await this.hentDagligLederForOrg(orgnr),
      });
    }
    return resultat;
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

  /** Leser virksomhetsnummeret i en gitt rollegruppe (f.eks. REVI) fra en klient. */
  private hentRolleVirksomhet(klientDokument: TenorDocument, rolleKode: string): string | null {
    const data = this.parseKildedata(klientDokument);
    const rollegrupper = Array.isArray(data.rollegrupper)
      ? (data.rollegrupper as RolleGruppe[])
      : [];
    for (const gruppe of rollegrupper) {
      if (gruppe.type?.kode !== rolleKode) continue;
      for (const rolle of gruppe.roller ?? []) {
        const orgnr = rolle.virksomhet?.organisasjonsnummer;
        if (orgnr) return orgnr;
      }
    }
    return null;
  }

  /** Leser fødselsnummeret til daglig leder (eller innehaver) fra en virksomhet. */
  private hentDagligLeder(virksomhetData: Record<string, unknown>): string | null {
    const rollegrupper = Array.isArray(virksomhetData.rollegrupper)
      ? (virksomhetData.rollegrupper as RolleGruppe[])
      : [];
    for (const gruppe of rollegrupper) {
      if (gruppe.type?.kode !== 'DAGL' && gruppe.type?.kode !== 'INNH') continue;
      for (const rolle of gruppe.roller ?? []) {
        const fnr = rolle.person?.foedselsnummer;
        if (fnr) return fnr;
      }
    }
    return null;
  }

  /** Trekker ut organisasjonsnummer + navn fra et brreg-dokument. */
  private hentVirksomhet(dokument: TenorDocument): TenorVirksomhet | null {
    const data = this.parseKildedata(dokument);
    const organisasjonsnummer = data.organisasjonsnummer;
    const navn = data.navn;
    if (typeof organisasjonsnummer !== 'string' || typeof navn !== 'string') return null;
    return { organisasjonsnummer, navn };
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
