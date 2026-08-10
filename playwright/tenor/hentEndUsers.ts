/* eslint-disable no-console */
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

import { Token } from 'playwright/api-requests/Token';
import { loadEnv } from 'playwright/util/helper';

import { TenorApiRequests } from './TenorApiRequests';

/**
 * CLI for å lage testdata til k6-testene for endringsforespørsler på systembruker.
 *
 * Testene trenger en person som kan godkjenne på vegne av en virksomhet. Det er
 * daglig leder i et AS og innehaver i et enkeltpersonforetak, altså de to rollene
 * som gir tilgangsstyring uten at noen har delegert noe først.
 *
 * Tenor gir virksomhetene og personen bak rollen. Alt Altinn kaller dem, altså
 * partyId, partyUuid og userId, slås opp i Register per miljø, siden Tenor holder
 * de samme syntetiske virksomhetene overalt mens Altinn-id-ene er miljøspesifikke.
 *
 * Kjøres via yarn-kallet `tenor:endusers` i playwright/package.json.
 *
 *   yarn tenor:endusers --env at23              # 10 virksomheter til at23
 *   yarn tenor:endusers --env tt02 -n 40        # 40 virksomheter
 *   yarn tenor:endusers --env at23 --stdout     # skriv til skjerm i stedet for fil
 *
 * Resultatet havner i K6/testdata/authentication/change-request/end-users-<env>.csv i
 * altinn-platform-validation-tests, som testen leser fra main.
 */

/** Organisasjonsformene testdataene dekker, og rollen som styrer tilgang i hver. */
const FORMER: Array<{ kode: string; rolle: string }> = [
  { kode: 'AS', rolle: 'dagligleder' },
  { kode: 'ENK', rolle: 'innehaver' },
];

// Kolonnene sier hvem id-en hører til, siden partyId og partyUuid finnes for både
// virksomheten og personen, og feil av dem gir 400 AMUI-00005 langt nede i testen.
const CSV_HEADER = 'orgNo,orgPartyId,orgPartyUuid,orgType,role,userId,userPartyUuid,userPid';

const DEFAULT_UT_KATALOG = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'altinn-platform-validation-tests',
  'K6',
  'testdata',
  'authentication',
  'change-request',
);

interface CliArgs {
  antall: number;
  env: string;
  ut?: string;
  stdout: boolean;
}

function printHelp(): void {
  console.error(
    [
      'Bruk: yarn tenor:endusers [valg]',
      '',
      '  -n, --antall <n>   Hvor mange virksomheter totalt, fordelt på organisasjonsformene. Standard 10.',
      '      --env <env>    Miljø å slå opp Altinn-id-er i. Standard fra environment, ellers tt02.',
      '      --ut <fil>     Skriv til denne fila i stedet for standardplasseringen.',
      '      --stdout       Skriv csv til skjerm i stedet for til fil.',
      '  -h, --help         Vis denne hjelpen.',
    ].join('\n'),
  );
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    antall: 10,
    env: process.env.environment ?? 'tt02',
    stdout: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (value === undefined) {
        console.error(`Mangler verdi for ${arg}.`);
        printHelp();
        process.exit(1);
      }
      return value;
    };

    switch (arg) {
      case '-n':
      case '--antall':
        args.antall = Number(next());
        break;
      case '--env':
        args.env = next();
        break;
      case '--ut':
        args.ut = next();
        break;
      case '--stdout':
        args.stdout = true;
        break;
      case '-h':
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        console.error(`Ukjent argument: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }

  return args;
}

/**
 * Fordeler antallet på organisasjonsformene, med resten på de første, slik at
 * begge former er representert også når antallet ikke går opp.
 */
function fordelPaaFormer(antall: number): number[] {
  const perForm = Math.floor(antall / FORMER.length);
  const rest = antall % FORMER.length;

  return FORMER.map((_, i) => perForm + (i < rest ? 1 : 0));
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  loadEnv(args.env);
  process.env.ENV_NAME = args.env;

  const tenor = new TenorApiRequests();
  const token = new Token();

  const fordeling = fordelPaaFormer(args.antall);

  // Samme person kan være rollehaver i flere virksomheter. Virksomheten beholdes
  // med den første formen den ble funnet under, ellers ville den fått to rader.
  const sett = new Set<string>();
  const rader: string[] = [];

  for (const [i, form] of FORMER.entries()) {
    const oenskes = fordeling[i];
    if (oenskes === 0) continue;

    console.error(`Henter ${oenskes} ${form.kode}-virksomheter fra Tenor ...`);

    // Be om flere enn vi trenger, siden noen faller fra på manglende rollehaver
    // eller på at Register ikke kjenner dem i dette miljøet.
    const virksomheter = await tenor.hentVirksomheterPaginert(
      `organisasjonsform.kode:${form.kode}`,
      oenskes * 3,
    );
    const rollehavere = await tenor.hentDagligLedere(
      virksomheter.map((v) => v.organisasjonsnummer),
    );

    const kandidater = rollehavere.filter(
      (kandidat): kandidat is { organisasjonsnummer: string; dagligLeder: string } =>
        kandidat.dagligLeder !== null && !sett.has(kandidat.organisasjonsnummer),
    );

    // Register tar hele lista i noen få kall, så id-ene slås opp under ett i
    // stedet for to kall per rad. Det er forskjellen på sekunder og minutter når
    // datasettet er på et par hundre virksomheter.
    const ider = await token.getIdsBulk([
      ...kandidater.map((kandidat) => kandidat.organisasjonsnummer),
      ...kandidater.map((kandidat) => kandidat.dagligLeder),
    ]);

    let lagtTil = 0;

    for (const { organisasjonsnummer, dagligLeder } of kandidater) {
      if (lagtTil >= oenskes) break;

      const org = ider.get(organisasjonsnummer);
      const person = ider.get(dagligLeder);

      if (!org?.partyUuid || !person?.user?.userId) {
        console.error(`  hopper over ${organisasjonsnummer}, Register mangler id-er i ${args.env}`);
        continue;
      }

      // En død rollehaver kan ikke logge inn, og Tenor holder rollen selv om
      // personen er død, så den må lukes ut her.
      if (person.dateOfDeath !== null && person.dateOfDeath !== undefined) {
        console.error(`  hopper over ${organisasjonsnummer}, rollehaveren er død`);
        continue;
      }

      // partyId er virksomhetens, ikke rollehaverens. Det er virksomheten man
      // opptrer for, og bff-stiene tar den i {partyId}. Med personens partyId
      // svarer godkjenning av endringsforespørselen 400 AMUI-00005.
      sett.add(organisasjonsnummer);
      rader.push(
        [
          organisasjonsnummer,
          org.partyId,
          org.partyUuid,
          form.kode,
          form.rolle,
          person.user.userId,
          person.partyUuid,
          dagligLeder,
        ].join(','),
      );
      lagtTil++;
    }

    console.error(`  -> ${lagtTil} av ${oenskes} ${form.kode}`);
  }

  if (rader.length === 0) {
    // Uten dette skrives en fil med bare header, og testen som leser den ser ut
    // til å ha testdata helt til den kjører og ikke finner noen virksomheter.
    console.error(
      `\nFant ingen virksomheter for ${args.env}. Skriver ingen fil. Sjekk at playwright/config/.env.${args.env} finnes og at ${args.env.toUpperCase()}_REGISTER_SUBSCRIPTION_KEY er satt.`,
    );
    process.exit(1);
  }

  const csv = [CSV_HEADER, ...rader].join('\n') + '\n';

  if (args.stdout) {
    console.log(csv);
  } else {
    const fil = args.ut ?? path.join(DEFAULT_UT_KATALOG, `end-users-${args.env}.csv`);
    mkdirSync(path.dirname(fil), { recursive: true });
    writeFileSync(fil, csv);
    console.error(`\nSkrev ${rader.length} virksomheter til ${fil}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
