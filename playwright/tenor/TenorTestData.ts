import { TenorApiRequests, type FacilitatorRolle } from './TenorApiRequests';
import { pickRandom } from '../util/helper';

export interface TenorPerson {
  pid: string;
  /** Fullt navn (fornavn [mellomnavn] etternavn) slik det vises i brukerflaten. */
  navn: string;
  etternavn: string;
}

export interface TenorDagligLederMedOrg {
  /** Daglig leder — logger inn og representerer virksomheten (allerede registrert i brreg). */
  dagligLeder: TenorPerson;
  /** Virksomheten vedkommende er daglig leder for. */
  org: { orgnr: string; navn: string };
}

export interface TenorHovedenhetMedUnderenhet {
  /** Daglig leder for hovedenheten — representerer BÅDE hovedenhet og underenhet. */
  dagligLeder: TenorPerson;
  hovedenhet: { orgnr: string; navn: string };
  underenhet: { orgnr: string; navn: string };
}

/** En virksomhet (orgnr + navn) i brukerflaten. */
export interface TenorOrgRef {
  orgnr: string;
  navn: string;
}

export interface TenorFacilitatorMedKlienter {
  /** Daglig leder — logger inn og representerer facilitator-virksomheten. */
  dagligLeder: TenorPerson;
  /** Facilitator-virksomheten (revisor/regnskapsfører/forretningsfører). */
  org: TenorOrgRef;
  /** Facilitatorens klienter (virksomheter den har oppdrag for). */
  klienter: TenorOrgRef[];
}

/** Organisasjonsform brukt som standard når ingen annen er oppgitt. */
const DEFAULT_ORG_TYPE = 'AS';

/**
 * Tenor brreg-søk returnerer en STABIL rekkefølge (samme `seed`), så «første
 * treff» er alltid samme virksomhet. Vi henter derfor en pool og plukker
 * tilfeldig, slik at ulike tester får ulike virksomheter (unngår at alle
 * org-tester deler samme aktør — selve parallellitetsproblemet i #2086).
 */
const ORG_POOL = 100;

/**
 * Henter ferske, tilfeldige testdata fra Tenor slik at Tilgangsstyrings-testene
 * ikke deler hardkodede PID-er/orgnr. Det unngår kollisjoner ved parallell
 * kjøring (jf. Altinn/altinn-authentication#2086).
 */
export class TenorTestData {
  private readonly tenor = new TenorApiRequests();

  /**
   * N distinkte privatpersoner som er BOSATT og MYNDIGE (fyllt 18 år) i det
   * syntetiske Folkeregisteret — KQL: `personstatus:bosatt AND foedselsdato:[* to <18 år siden>]`.
   * Returnerer PID + navn/etternavn (navnet vises i brukerflaten).
   */
  async bosatteMyndigePersoner(antall: number): Promise<TenorPerson[]> {
    const personer = await this.tenor.hentPersoner(TenorApiRequests.bosattMyndigKql(), antall);
    if (personer.length < antall) {
      throw new Error(`Tenor ga bare ${personer.length} av ${antall} etterspurte personer.`);
    }
    return personer.map(tilTenorPerson);
  }

  /** Én bosatt, myndig privatperson (se {@link bosatteMyndigePersoner}). */
  async bosattMyndigPerson(): Promise<TenorPerson> {
    const [person] = await this.bosatteMyndigePersoner(1);
    return person;
  }

  /**
   * En DAGLIG LEDER og virksomheten hen representerer. Daglig leder er en reell,
   * brreg-registrert representant, så innlogging/aktørvalg for virksomheten
   * fungerer uten at vi må opprette (og vente på) nye koblinger.
   *
   * DAGL-relasjonen finnes bare i brreg (ikke i freg-persondokumentet), så vi
   * henter en pool av virksomheter, går gjennom dem i TILFELDIG rekkefølge og
   * plukker den første med en daglig leder som er en levende, bosatt person i
   * freg (leder logger inn, så en avdød/utflyttet leder ville feilet). Tilfeldig
   * rekkefølge gjør at ulike tester får ulike aktører (Tenor gir ellers alltid
   * samme rekkefølge).
   *
   * @param organisasjonsform Virksomhetstype å søke etter. Default `AS`.
   */
  async dagligLederMedOrg(
    organisasjonsform: string = DEFAULT_ORG_TYPE,
  ): Promise<TenorDagligLederMedOrg> {
    const orgs = await this.tenor.hentVirksomheterPaginert(
      `organisasjonsform.kode:${organisasjonsform}`,
      ORG_POOL,
    );
    for (const org of shuffle(orgs)) {
      const pid = await this.tenor.hentDagligLederForOrg(org.organisasjonsnummer);
      if (!pid) continue;
      // Leder må være bosatt (og dermed levende) for å kunne logge inn. Navnet
      // ligger ikke i brreg-dokumentet, så vi slår det opp i freg samtidig.
      const [leder] = await this.tenor.hentPersoner(
        `identifikator:${pid} AND ${TenorApiRequests.bosattMyndigKql()}`,
        1,
      );
      if (!leder) continue;
      return {
        dagligLeder: tilTenorPerson(leder),
        org: { orgnr: org.organisasjonsnummer, navn: org.navn },
      };
    }
    throw new Error(
      `Fant ingen ${organisasjonsform}-virksomhet med bosatt daglig leder blant ${orgs.length} kandidater i Tenor.`,
    );
  }

  /**
   * En HOVEDENHET som har en UNDERENHET, samt daglig leder. Daglig leder for
   * hovedenheten representerer også underenheten i aktørvalget (Altinn arver
   * DAGL-tilgang nedover). Brukes til hoved-/underenhet-testene.
   *
   * Relasjonen finnes bare på underenheten (`underenhet.hovedenhet`), så vi
   * henter en pool underenheter (BEDR), går gjennom dem i tilfeldig rekkefølge
   * og velger den første hvis hovedenhet har ønsket organisasjonsform og en
   * bosatt daglig leder.
   *
   * @param organisasjonsform Hovedenhetens organisasjonsform. Default `AS`.
   */
  async hovedenhetMedUnderenhet(
    organisasjonsform: string = DEFAULT_ORG_TYPE,
  ): Promise<TenorHovedenhetMedUnderenhet> {
    const underenheter = await this.tenor.hentUnderenheter(ORG_POOL);
    for (const under of shuffle(underenheter)) {
      const hovedenhet = await this.tenor.hentVirksomhetMedForm(under.hovedenhetOrgnr);
      if (!hovedenhet || hovedenhet.organisasjonsform !== organisasjonsform) continue;
      // Testene forventer at hoved- og underenhet vises med SAMME navn (velges
      // via nth(0)/nth(1) i aktørvalget), så vi krever at navnene er like.
      if (hovedenhet.navn !== under.navn) continue;
      const pid = await this.tenor.hentDagligLederForOrg(hovedenhet.organisasjonsnummer);
      if (!pid) continue;
      const [leder] = await this.tenor.hentPersoner(
        `identifikator:${pid} AND ${TenorApiRequests.bosattMyndigKql()}`,
        1,
      );
      if (!leder) continue;
      return {
        dagligLeder: tilTenorPerson(leder),
        hovedenhet: { orgnr: hovedenhet.organisasjonsnummer, navn: hovedenhet.navn },
        underenhet: { orgnr: under.organisasjonsnummer, navn: under.navn },
      };
    }
    throw new Error(
      `Fant ingen ${organisasjonsform}-hovedenhet med underenhet og bosatt daglig leder blant ${underenheter.length} kandidater i Tenor.`,
    );
  }

  /**
   * En FACILITATOR (revisor/regnskapsfører/forretningsfører) med bosatt daglig
   * leder og FÅ klienter. Facilitatorens klienter er reelle brreg-klienter.
   * Brukes til klientdelegerings-testene. Få klienter gjør at «deleger alle
   * klienter» ikke treffer tusenvis.
   *
   * @param rolle Facilitator-rolle.
   */
  async facilitatorMedKlienter(rolle: FacilitatorRolle): Promise<TenorFacilitatorMedKlienter> {
    const f = await this.tenor.hentFacilitatorMedBosattLeder(rolle);
    return {
      dagligLeder: await this.dagligLederFraFnr(f.dagligLeder),
      org: { orgnr: f.organisasjonsnummer, navn: f.navn },
      klienter: f.klienter.map((k) => ({ orgnr: k.organisasjonsnummer, navn: k.navn })),
    };
  }

  /**
   * En FORRETNINGSFØRER med bosatt daglig leder og én EIENDOMSKLIENT (borettslag
   * BRL / sameie ESEK) — den eneste klienttypen `forretningsforer-eiendom` kan
   * delegeres for.
   */
  async forretningsfoererMedEiendomsklient(): Promise<{
    dagligLeder: TenorPerson;
    org: TenorOrgRef;
    klient: TenorOrgRef;
  }> {
    const { facilitator, klient } = await this.tenor.hentForretningsfoererMedEiendomsklient();
    return {
      dagligLeder: await this.dagligLederFraFnr(facilitator.dagligLeder),
      org: { orgnr: facilitator.organisasjonsnummer, navn: facilitator.navn },
      klient: { orgnr: klient.organisasjonsnummer, navn: klient.navn },
    };
  }

  /** Slår opp navnet til en (bosatt) daglig leder fra fødselsnummer. */
  private async dagligLederFraFnr(fnr: string | null): Promise<TenorPerson> {
    if (!fnr) throw new Error('Facilitator mangler daglig leder.');
    const [person] = await this.tenor.hentPersoner(
      `identifikator:${fnr} AND ${TenorApiRequests.bosattMyndigKql()}`,
      1,
    );
    if (!person) throw new Error(`Daglig leder ${fnr} er ikke en bosatt, myndig person.`);
    return tilTenorPerson(person);
  }

  /**
   * En tilfeldig virksomhet (orgnr + navn) fra en pool — ulike tester får ulike
   * virksomheter (Tenor gir ellers alltid samme rekkefølge).
   * @param opts.organisasjonsform Virksomhetstype å søke etter. Default `AS`.
   * @param opts.ekskluder Orgnr som ikke skal velges (f.eks. aktørens egen org ved org→org).
   */
  async hentTilfeldigVirksomhet(
    opts: { organisasjonsform?: string; ekskluder?: string[] } = {},
  ): Promise<{ orgnr: string; navn: string }> {
    const { organisasjonsform = DEFAULT_ORG_TYPE, ekskluder = [] } = opts;
    const orgs = await this.tenor.hentVirksomheterPaginert(
      `organisasjonsform.kode:${organisasjonsform}`,
      ORG_POOL,
    );
    const kandidater = orgs.filter((o) => !ekskluder.includes(o.organisasjonsnummer));
    if (kandidater.length === 0) {
      throw new Error(`Fant ingen ${organisasjonsform}-virksomhet i Tenor (etter ekskludering).`);
    }
    const org = pickRandom(kandidater);
    return { orgnr: org.organisasjonsnummer, navn: org.navn };
  }
}

/** Fisher–Yates-stokking som gir en ny, tilfeldig rekkefølge uten å mutere input. */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function tilTenorPerson(p: {
  foedselsnummer: string;
  navn?: string;
  etternavn?: string;
}): TenorPerson {
  return { pid: p.foedselsnummer, navn: p.navn ?? '', etternavn: p.etternavn ?? '' };
}
