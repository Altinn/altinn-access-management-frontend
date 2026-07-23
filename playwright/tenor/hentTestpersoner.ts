/* eslint-disable no-console */
import { loadEnv } from 'playwright/util/helper';

import { TenorApiRequests } from './TenorApiRequests';

/**
 * CLI for å hente X antall testpersoner fra Tenor.
 *
 * Kjøres via yarn-kallet `tenor` i playwright/package.json. Som standard hentes
 * bosatte, myndige privatpersoner, men du kan overstyre med en egen KQL.
 *
 *   yarn tenor                          # 1 bosatt, myndig person
 *   yarn tenor --antall 10              # 10 bosatte, myndige personer
 *   yarn tenor -n 5 --json              # 5 personer med full kildedata som JSON
 *   yarn tenor -n 3 --kql "personstatus:doed"   # egendefinert spørring
 *   yarn tenor --env at22 -n 2          # mot et annet miljø
 */

interface CliArgs {
  antall: number;
  kql?: string;
  json: boolean;
  navn: boolean;
  env: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    antall: 1,
    json: false,
    navn: false,
    env: process.env.environment ?? 'tt02',
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
      case '--kql':
        args.kql = next();
        break;
      case '--env':
        args.env = next();
        break;
      case '--json':
        args.json = true;
        break;
      case '--navn':
        args.navn = true;
        break;
      case '-h':
      case '--help':
        printHelp();
        process.exit(0);
      // eslint-disable-next-line no-fallthrough
      default:
        console.error(`Ukjent argument: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }

  if (!Number.isInteger(args.antall) || args.antall < 1) {
    console.error(`--antall må være et positivt heltall (fikk: ${args.antall}).`);
    process.exit(1);
  }

  return args;
}

function printHelp(): void {
  console.log(
    [
      'Hent testpersoner fra Tenor',
      '',
      'Bruk: yarn tenor [valg]',
      '',
      '  -n, --antall <tall>   Antall personer som hentes (default: 1)',
      '      --kql <streng>    Egendefinert KQL (default: bosatt + myndig)',
      '      --navn            Skriv ut navn (fornavn etternavn) ved siden av fnr',
      '      --json            Skriv ut full kildedata som JSON',
      '      --env <miljø>     Miljø for env-fil: tt02, at22, at23, at24 (default: tt02)',
      '  -h, --help            Vis denne hjelpeteksten',
    ].join('\n'),
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  loadEnv(args.env);

  const kql = args.kql ?? TenorApiRequests.bosattMyndigKql();
  console.error(`Henter ${args.antall} person(er) fra Tenor (${args.env}) med KQL: ${kql}`);

  const tenor = new TenorApiRequests();
  const personer = await tenor.hentPersoner(kql, args.antall);

  if (personer.length === 0) {
    console.error('Ingen treff.');
    process.exit(1);
  }

  if (personer.length < args.antall) {
    console.error(`Advarsel: fant bare ${personer.length} av ${args.antall} ønskede personer.`);
  }

  if (args.json) {
    console.log(JSON.stringify(personer, null, 2));
  } else {
    for (const person of personer) {
      const linje = args.navn
        ? `${person.foedselsnummer}\t${person.navn ?? ''}`
        : person.foedselsnummer;
      console.log(linje);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
