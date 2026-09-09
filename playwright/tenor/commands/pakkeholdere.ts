/* eslint-disable no-console */
import { EnduserConnection } from 'playwright/api-requests/EnduserConnection';
import { Token } from 'playwright/api-requests/Token';
import { loadEnv } from 'playwright/util/helper';

import { TenorApiRequests } from '../client/TenorApiRequests';
import { fail, parseFlags, requirePositiveInt, unknownArg } from '../lib/cliArgs';
import { pakkenavn, rensTekst, tilPakkeUrn } from '../lib/format';
import type { Command } from './Command';

/**
 * Bygger en virksomhet der mange brukere har samme tilgangspakke.
 *
 * Laget for Altinn/altinn-auth#829: popoveren som viser de fulle navnene bak
 * avatarene på en tilgangspakke trenger en pakke med lang avatar-stack for at
 * kuttingen («+N flere») skal være synlig, og noen pakker med få innehavere for
 * å se hvor grensa bør ligge.
 *
 * Flyt:
 * 1. Finn en Tenor-virksomhet med daglig leder som finnes i Altinn-registeret.
 * 2. Hent bosatte, myndige testpersoner fra Tenor.
 * 3. Legg hver person til som bruker i virksomheten og deleger pakkene etter
 *    fordelinga under, med daglig leder som den som delegerer.
 *
 *   yarn tenor pakkeholdere --env at23
 *   yarn tenor pakkeholdere --env tt02 -n 15
 *   yarn tenor pakkeholdere --env at22 --org 313559817   # gjenbruk en virksomhet
 *   yarn tenor pakkeholdere --env at23 -n 100 --pakke skatt-naering   # én pakke til 100 brukere
 *   yarn tenor pakkeholdere --env at23 --json
 */

/** Miljøene scriptet kan sette opp testdata i. */
const MILJOER = ['at22', 'at23', 'tt02'] as const;
type Miljo = (typeof MILJOER)[number];

/** AM-UIet per miljø, slik at utskriften kan peke rett på virksomheten. */
const UI_URL: Record<Miljo, string> = {
  at22: 'https://am.ui.at22.altinn.cloud/accessmanagement/ui/users',
  at23: 'https://am.ui.at23.altinn.cloud/accessmanagement/ui/users',
  tt02: 'https://am.ui.tt02.altinn.no/accessmanagement/ui/users',
};

/**
 * Hvor mange av brukerne som skal ha hver pakke. `alle` gir pakken til samtlige,
 * og er den som skal vise en lang avatar-stack med kutting. De øvrige er en
 * trapp nedover, så samme skjermbilde også viser hvordan 5, 3, 2 og 1 navn ser ut.
 *
 * Alle fem pakkene er verifisert å finnes i at22, at23 og tt02
 * (`/accessmanagement/api/v1/meta/info/accesspackages/export`).
 */
const FORDELING: Array<{ pakke: string; antall: number | 'alle' }> = [
  { pakke: 'urn:altinn:accesspackage:posttjenester', antall: 'alle' },
  { pakke: 'urn:altinn:accesspackage:byggesoknad', antall: 5 },
  { pakke: 'urn:altinn:accesspackage:plansak', antall: 3 },
  { pakke: 'urn:altinn:accesspackage:skattegrunnlag', antall: 2 },
  { pakke: 'urn:altinn:accesspackage:baerekraft', antall: 1 },
];

/**
 * Hvor mange virksomhets- og person-kandidater som hentes fra Tenor per bruker
 * vi trenger. Så godt som alle Tenor-oppføringer er synket til testmiljøene,
 * men for særtilfellene som ikke er det henter vi med margin og hopper over
 * de som ikke slår til i registeret.
 */
const KANDIDAT_FAKTOR = 4;

/** Hvor mange virksomheter som skannes for å finne én med daglig leder i registeret. */
const VIRKSOMHET_KANDIDATER = 25;

/** En bruker som har fått pakker i virksomheten. */
interface Pakkeholder {
  foedselsnummer: string;
  navn: string;
  pakker: string[];
}

/** Resultatet av en oppsettskjøring i ett miljø. */
interface Resultat {
  miljo: Miljo;
  organisasjonsnummer: string;
  virksomhetsnavn: string;
  dagligLeder: string;
  uiUrl: string;
  brukere: Pakkeholder[];
}

interface Args {
  miljo: Miljo;
  antall: number;
  orgnr?: string;
  pakke?: string;
  json: boolean;
}

function printHelp(): void {
  console.log(
    [
      'Bygg en virksomhet der mange brukere har samme tilgangspakke (altinn-auth#829)',
      '',
      'Bruk: yarn tenor pakkeholdere [valg]',
      '',
      `      --env <miljø>     ${MILJOER.join(' | ')} (default: at23)`,
      '  -n, --antall <tall>   Antall brukere som skal ha hovedpakken (default: 10)',
      '      --org <orgnr>     Bruk denne virksomheten i stedet for å finne en ny',
      '      --pakke <navn>    Gi bare denne pakken, til samtlige brukere, i stedet',
      '                        for trappa i FORDELING. Tar kort navn eller full urn.',
      '      --json            Skriv ut resultatet som JSON',
      '  -h, --help            Vis denne hjelpeteksten',
    ].join('\n'),
  );
}

function parseArgs(argv: string[]): Args {
  const args: Args = { miljo: 'at23', antall: 10, json: false };

  parseFlags(
    argv,
    {
      '--env': (next) => {
        const miljo = next();
        if (!MILJOER.includes(miljo as Miljo)) {
          fail(`Ugyldig miljø: ${miljo}. Gyldige: ${MILJOER.join(', ')}`);
        }
        args.miljo = miljo as Miljo;
      },
      '-n': (next) => (args.antall = Number(next())),
      '--antall': (next) => (args.antall = Number(next())),
      '--org': (next) => (args.orgnr = next()),
      '--pakke': (next) => (args.pakke = next()),
      '--json': () => (args.json = true),
      '-h': () => {
        printHelp();
        process.exit(0);
      },
      '--help': () => {
        printHelp();
        process.exit(0);
      },
    },
    (arg) => unknownArg(arg, printHelp),
  );

  requirePositiveInt(args.antall, '--antall');

  if (args.pakke !== undefined && args.pakke.trim() === '') {
    fail('--pakke kan ikke være tom.');
  }

  if (args.orgnr !== undefined && !/^\d{9}$/.test(args.orgnr)) {
    fail(`--org må være et 9-sifret organisasjonsnummer (fikk: ${args.orgnr}).`);
  }

  return args;
}

/**
 * Finner en virksomhet som både har daglig leder i Tenor og finnes i
 * Altinn-registeret i miljøet. Daglig leder er den som delegerer, så en
 * virksomhet uten DAGL er ubrukelig her.
 *
 * @param tenor Tenor-klienten.
 * @param token Altinn-token-klienten, brukt til registeroppslaget.
 */
async function finnVirksomhet(
  tenor: TenorApiRequests,
  token: Token,
): Promise<{ organisasjonsnummer: string; navn: string; dagligLeder: string }> {
  const kandidater = await tenor.hentVirksomheterPaginert(
    'organisasjonsform.kode:AS',
    VIRKSOMHET_KANDIDATER,
  );

  for (const kandidat of kandidater) {
    const dagligLeder = await tenor.hentDagligLederForOrg(kandidat.organisasjonsnummer);
    if (!dagligLeder) continue;

    try {
      await token.getIds(kandidat.organisasjonsnummer);
      await token.getIds(dagligLeder);
    } catch {
      continue; // Virksomheten eller daglig leder er ikke synket til dette miljøet.
    }

    return { ...kandidat, dagligLeder };
  }

  throw new Error(
    `Fant ingen virksomhet med daglig leder i registeret blant ${kandidater.length} Tenor-kandidater. ` +
      'Prøv igjen, eller pek på en kjent virksomhet med --org.',
  );
}

/** Henter en kjent virksomhet med daglig leder fra et orgnr oppgitt med --org. */
async function hentOppgittVirksomhet(
  tenor: TenorApiRequests,
  orgnr: string,
): Promise<{ organisasjonsnummer: string; navn: string; dagligLeder: string }> {
  const [virksomhet] = await tenor.hentVirksomheterPaginert(`organisasjonsnummer:${orgnr}`, 1);
  if (!virksomhet) {
    throw new Error(`Fant ikke virksomhet ${orgnr} i Tenor.`);
  }

  const dagligLeder = await tenor.hentDagligLederForOrg(orgnr);
  if (!dagligLeder) {
    throw new Error(`Virksomhet ${orgnr} mangler daglig leder, og kan ikke delegere pakker.`);
  }

  return { ...virksomhet, dagligLeder };
}

/**
 * Henter testpersoner som finnes i Altinn-registeret i miljøet.
 *
 * Så godt som alle Tenor-personer er synket til testmiljøene; for
 * særtilfellene som ikke er det henter vi med margin og beholder de `antall`
 * første som slår til i registeret.
 *
 * @param tenor Tenor-klienten.
 * @param token Altinn-token-klienten, brukt til registeroppslaget.
 * @param antall Hvor mange personer vi trenger.
 * @param utelat Fødselsnumre som ikke skal med, typisk daglig leder.
 */
async function hentBrukere(
  tenor: TenorApiRequests,
  token: Token,
  antall: number,
  utelat: string[],
): Promise<Array<{ foedselsnummer: string; navn: string; partyUuid: string; lastName: string }>> {
  const kandidater = await tenor.hentPersonerPaginert(
    TenorApiRequests.bosattMyndigKql(),
    antall * KANDIDAT_FAKTOR,
  );

  const brukere = [];
  for (const kandidat of kandidater) {
    if (brukere.length >= antall) break;
    if (utelat.includes(kandidat.foedselsnummer)) continue;

    try {
      const ids = await token.getIds(kandidat.foedselsnummer);
      brukere.push({
        foedselsnummer: kandidat.foedselsnummer,
        navn: rensTekst(kandidat.navn) || rensTekst(ids.lastName),
        partyUuid: ids.partyUuid,
        lastName: ids.lastName,
      });
    } catch {
      continue; // Personen er ikke synket til dette miljøet.
    }
  }

  if (brukere.length < antall) {
    throw new Error(
      `Fant bare ${brukere.length} av ${antall} personer i registeret blant ${kandidater.length} Tenor-kandidater.`,
    );
  }

  return brukere;
}

/**
 * Fordelinga som skal brukes i denne kjøringen. Uten --pakke er det trappa i
 * FORDELING; med --pakke er det den ene pakken til samtlige, som er formen man
 * vil ha når spørsmålet er hvordan lista ser ut med mange navn.
 *
 * @param pakke Pakken fra --pakke, eller undefined.
 */
function fordelingFor(pakke: string | undefined): typeof FORDELING {
  return pakke ? [{ pakke: tilPakkeUrn(pakke), antall: 'alle' }] : FORDELING;
}

/**
 * Regner ut hvilke pakker hver bruker skal ha ut fra fordelinga. Brukerne ligger
 * i fast rekkefølge, så bruker 1 får alle pakkene og de siste får bare
 * hovedpakken. Dermed er både «mange navn» og «ett navn» synlig i samme
 * skjermbilde.
 *
 * @param antallBrukere Hvor mange brukere pakkene skal fordeles over.
 * @param fordeling Pakkene og hvor mange som skal ha hver av dem.
 */
function pakkerPerBruker(antallBrukere: number, fordeling: typeof FORDELING): string[][] {
  const pakker: string[][] = Array.from({ length: antallBrukere }, () => []);

  for (const { pakke, antall } of fordeling) {
    const mottakere = antall === 'alle' ? antallBrukere : Math.min(antall, antallBrukere);
    for (let i = 0; i < mottakere; i++) {
      pakker[i].push(pakke);
    }
  }

  return pakker;
}

/**
 * Hvor mange navn per pakke som listes i konsoll-utskriften. Med 100 brukere er
 * full liste bare støy; `--json` gir alt for den som trenger hele settet.
 */
const MAKS_NAVN_I_UTSKRIFT = 10;

async function run(argv: string[]): Promise<void> {
  const args = parseArgs(argv);
  loadEnv(args.miljo);

  const tenor = new TenorApiRequests();
  const token = new Token();
  const connection = new EnduserConnection();

  console.error(`Finner virksomhet i ${args.miljo} ...`);
  const virksomhet = args.orgnr
    ? await hentOppgittVirksomhet(tenor, args.orgnr)
    : await finnVirksomhet(tenor, token);
  console.error(
    `Virksomhet: ${rensTekst(virksomhet.navn)} (${virksomhet.organisasjonsnummer}), ` +
      `daglig leder ${virksomhet.dagligLeder}`,
  );

  console.error(`Henter ${args.antall} testpersoner fra Tenor ...`);
  const brukere = await hentBrukere(tenor, token, args.antall, [virksomhet.dagligLeder]);

  const orgUuid = await token.getPartyUuid(virksomhet.organisasjonsnummer);
  const fordelingSpek = fordelingFor(args.pakke);
  const fordeling = pakkerPerBruker(brukere.length, fordelingSpek);
  const resultat: Resultat = {
    miljo: args.miljo,
    organisasjonsnummer: virksomhet.organisasjonsnummer,
    virksomhetsnavn: rensTekst(virksomhet.navn),
    dagligLeder: virksomhet.dagligLeder,
    uiUrl: UI_URL[args.miljo],
    brukere: [],
  };

  // Sekvensielt: alle delegeringene går fra samme virksomhet, og parallelle
  // skriv mot samme party har vist seg å gi sporadiske feil.
  for (const [indeks, bruker] of brukere.entries()) {
    const pakker = fordeling[indeks];
    console.error(
      `[${indeks + 1}/${brukere.length}] ${bruker.navn} (${bruker.foedselsnummer}): ` +
        pakker.map(pakkenavn).join(', '),
    );

    await connection.addConnection(
      virksomhet.dagligLeder,
      virksomhet.organisasjonsnummer,
      bruker.foedselsnummer,
      orgUuid,
      bruker.lastName,
    );
    await connection.addPackagePerson(
      virksomhet.dagligLeder,
      virksomhet.organisasjonsnummer,
      bruker.foedselsnummer,
      pakker,
      orgUuid,
      bruker.partyUuid,
      bruker.lastName,
    );

    resultat.brukere.push({
      foedselsnummer: bruker.foedselsnummer,
      navn: bruker.navn,
      pakker,
    });
  }

  if (args.json) {
    console.log(JSON.stringify(resultat, null, 2));
    return;
  }

  console.log('');
  console.log(`Miljø:          ${resultat.miljo}`);
  console.log(`Virksomhet:     ${resultat.virksomhetsnavn} (${resultat.organisasjonsnummer})`);
  console.log(`Logg inn som:   ${resultat.dagligLeder} (daglig leder)`);
  console.log(`Brukerliste:    ${resultat.uiUrl}`);
  console.log('');
  console.log('Innehavere per pakke:');
  for (const { pakke } of fordelingSpek) {
    const innehavere = resultat.brukere.filter((b) => b.pakker.includes(pakke));
    console.log(`  ${pakkenavn(pakke)} (${innehavere.length}):`);
    for (const innehaver of innehavere.slice(0, MAKS_NAVN_I_UTSKRIFT)) {
      console.log(`    - ${innehaver.navn} (${innehaver.foedselsnummer})`);
    }
    if (innehavere.length > MAKS_NAVN_I_UTSKRIFT) {
      console.log(`    ... og ${innehavere.length - MAKS_NAVN_I_UTSKRIFT} flere (bruk --json)`);
    }
  }
}

export const command: Command = {
  name: 'pakkeholdere',
  summary: 'Bygg en virksomhet der mange brukere deler tilgangspakker (altinn-auth#829)',
  run,
};
