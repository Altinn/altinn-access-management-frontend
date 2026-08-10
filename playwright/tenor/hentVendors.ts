/* eslint-disable no-console */
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

import { loadEnv } from 'playwright/util/helper';

import { TenorApiRequests } from './TenorApiRequests';

/**
 * CLI for å lage leverandørlista til k6-testene for systembruker.
 *
 * Testene registrerte alle systemene sine på én og samme leverandør, som gjorde
 * at de aldri oppdaget noe som bare slår til for enkelte organisasjonsnummer.
 * Denne lista lar hver kjøring trekke en tilfeldig leverandør i stedet.
 *
 * Bare organisasjonsnummeret brukes, siden leverandøren er den
 * enterprise-tokenet lages for. Derfor slås ingenting opp i Register, og lista
 * er heller ikke miljøspesifikk, i motsetning til [end users](./hentEndUsers.ts).
 *
 * Kjøres via yarn-kallet `tenor:vendors` i playwright/package.json.
 *
 *   yarn tenor:vendors                 # 200 virksomheter
 *   yarn tenor:vendors -n 50           # 50 virksomheter
 *   yarn tenor:vendors --stdout        # skriv til skjerm i stedet for fil
 *
 * Resultatet havner i K6/testdata/authentication/change-request/vendors.csv i
 * altinn-platform-validation-tests, som testen leser fra main.
 */

const CSV_HEADER = 'orgNo,name';

const DEFAULT_UT_FIL = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'altinn-platform-validation-tests',
  'K6',
  'testdata',
  'authentication',
  'change-request',
  'vendors.csv',
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
      'Bruk: yarn tenor:vendors [valg]',
      '',
      '  -n, --antall <n>   Hvor mange virksomheter. Standard 200.',
      '      --env <env>    Miljø å lese env-fil for. Standard fra environment, ellers tt02.',
      '      --ut <fil>     Skriv til denne fila i stedet for standardplasseringen.',
      '      --stdout       Skriv csv til skjerm i stedet for til fil.',
      '  -h, --help         Vis denne hjelpen.',
    ].join('\n'),
  );
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    antall: 200,
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

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  loadEnv(args.env);
  process.env.ENV_NAME = args.env;

  const tenor = new TenorApiRequests();

  console.error(`Henter ${args.antall} virksomheter fra Tenor ...`);

  const virksomheter = await tenor.hentVirksomheterPaginert(
    'organisasjonsform.kode:AS',
    args.antall,
  );

  if (virksomheter.length === 0) {
    console.error('\nFant ingen virksomheter. Skriver ingen fil.');
    process.exit(1);
  }

  const rader = virksomheter.map((virksomhet) =>
    // Navnet er bare til å kjenne igjen raden i en feilende kjøring, så et komma
    // i navnet byttes ut i stedet for å dra med seg sitering i csv-en.
    [virksomhet.organisasjonsnummer, virksomhet.navn.replace(/,/g, ' ')].join(','),
  );

  const csv = [CSV_HEADER, ...rader].join('\n') + '\n';

  if (args.stdout) {
    console.log(csv);
  } else {
    const fil = args.ut ?? DEFAULT_UT_FIL;
    mkdirSync(path.dirname(fil), { recursive: true });
    writeFileSync(fil, csv);
    console.error(`\nSkrev ${rader.length} virksomheter til ${fil}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
