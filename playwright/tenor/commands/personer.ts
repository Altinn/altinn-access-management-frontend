/* eslint-disable no-console */
import { loadEnv } from 'playwright/util/helper';

import { TENOR_MAX_PER_PAGE, TenorApiRequests } from '../client/TenorApiRequests';
import { fail, parseFlags, requirePositiveInt, unknownArg } from '../lib/cliArgs';
import type { Command } from './Command';

/**
 * Henter testpersoner fra Tenor. Som standard bosatte, myndige privatpersoner,
 * men du kan overstyre med en egen KQL.
 *
 *   yarn tenor personer                          # 1 bosatt, myndig person
 *   yarn tenor personer -n 10                    # 10 bosatte, myndige personer
 *   yarn tenor personer -n 500                    # forbi Tenors 200-grense (paginert automatisk)
 *   yarn tenor personer -n 5 --json               # 5 personer med full kildedata som JSON
 *   yarn tenor personer -n 3 --kql "personstatus:doed"   # egendefinert spørring
 *   yarn tenor personer --env at22 -n 2            # mot et annet miljø
 */

interface Args {
  antall: number;
  kql?: string;
  json: boolean;
  navn: boolean;
  env: string;
}

function printHelp(): void {
  console.log(
    [
      'Hent testpersoner fra Tenor',
      '',
      'Bruk: yarn tenor personer [valg]',
      '',
      '  -n, --antall <tall>   Antall personer som hentes (default: 1)',
      '      --kql <streng>    Egendefinert KQL (default: bosatt + myndig)',
      '      --navn            Skriv ut navn (fornavn etternavn) ved siden av fnr',
      '      --json            Skriv ut full kildedata som JSON',
      '      --env <miljø>     Miljø for env-fil: tt02, at22, at23 (default: tt02)',
      '  -h, --help            Vis denne hjelpeteksten',
    ].join('\n'),
  );
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    antall: 1,
    json: false,
    navn: false,
    env: process.env.environment ?? 'tt02',
  };

  parseFlags(
    argv,
    {
      '-n': (next) => (args.antall = Number(next())),
      '--antall': (next) => (args.antall = Number(next())),
      '--kql': (next) => (args.kql = next()),
      '--env': (next) => (args.env = next()),
      '--json': () => (args.json = true),
      '--navn': () => (args.navn = true),
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
  return args;
}

async function run(argv: string[]): Promise<void> {
  const args = parseArgs(argv);
  loadEnv(args.env);

  const kql = args.kql ?? TenorApiRequests.bosattMyndigKql();
  console.error(`Henter ${args.antall} person(er) fra Tenor (${args.env}) med KQL: ${kql}`);

  const tenor = new TenorApiRequests();
  // Under Tenors 200-per-kall-grense holder ett enkelt kall; over den må vi
  // paginere med `hentPersonerPaginert` (se TenorApiRequests for detaljer).
  const personer =
    args.antall > TENOR_MAX_PER_PAGE
      ? await tenor.hentPersonerPaginert(kql, args.antall)
      : await tenor.hentPersoner(kql, args.antall);

  if (personer.length === 0) fail('Ingen treff.');
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

export const command: Command = {
  name: 'personer',
  summary: 'Hent testpersoner (bosatt + myndig som default)',
  run,
};
