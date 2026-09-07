/* eslint-disable no-console */
import { loadEnv } from 'playwright/util/helper';

import { TenorApiRequests, type FacilitatorRolle } from '../client/TenorApiRequests';
import { parseFlags, requirePositiveInt, unknownArg } from '../lib/cliArgs';
import { rensTekst } from '../lib/format';
import type { Command } from './Command';

/**
 * Henter én facilitator-virksomhet (revisor / regnskapsfører / forretningsfører)
 * med daglig leder og klientliste fra Tenor.
 *
 *   yarn tenor facilitator                            # revisor, første facilitator, 5 klienter
 *   yarn tenor facilitator --rolle regnskapsfoerer     # regnskapsfører
 *   yarn tenor facilitator --rolle forretningsfoerer -n 10
 *   yarn tenor facilitator --maks-klienter 10          # finn facilitator med <= 10 klienter (færrest)
 *   yarn tenor facilitator --json                      # full struktur som JSON
 */

const ROLLER: FacilitatorRolle[] = ['revisor', 'regnskapsfoerer', 'forretningsfoerer'];

interface Args {
  rolle: FacilitatorRolle;
  antall: number;
  maksKlienter?: number;
  json: boolean;
  env: string;
}

function printHelp(): void {
  console.log(
    [
      'Hent en facilitator-virksomhet (med klienter) fra Tenor',
      '',
      'Bruk: yarn tenor facilitator [valg]',
      '',
      `  -r, --rolle <rolle>        ${ROLLER.join(' | ')} (default: revisor)`,
      '  -n, --antall <tall>        Antall klienter som hentes (default: 5)',
      '  -m, --maks-klienter <tall> Finn facilitator med færrest klienter, høyst <tall>',
      '      --json                 Skriv ut full struktur som JSON',
      '      --env <miljø>          Miljø for env-fil: tt02, at22, at23 (default: tt02)',
      '  -h, --help                 Vis denne hjelpeteksten',
    ].join('\n'),
  );
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    rolle: 'revisor',
    antall: 5,
    json: false,
    env: process.env.environment ?? 'tt02',
  };

  parseFlags(
    argv,
    {
      '-r': (next) => (args.rolle = parseRolle(next())),
      '--rolle': (next) => (args.rolle = parseRolle(next())),
      '-n': (next) => (args.antall = Number(next())),
      '--antall': (next) => (args.antall = Number(next())),
      '-m': (next) => (args.maksKlienter = Number(next())),
      '--maks-klienter': (next) => (args.maksKlienter = Number(next())),
      '--env': (next) => (args.env = next()),
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
  if (args.maksKlienter !== undefined) requirePositiveInt(args.maksKlienter, '--maks-klienter');
  return args;
}

function parseRolle(rolle: string): FacilitatorRolle {
  if (!ROLLER.includes(rolle as FacilitatorRolle)) {
    console.error(`Ugyldig rolle: ${rolle}. Gyldige: ${ROLLER.join(', ')}`);
    process.exit(1);
  }
  return rolle as FacilitatorRolle;
}

async function run(argv: string[]): Promise<void> {
  const args = parseArgs(argv);
  loadEnv(args.env);

  const tenor = new TenorApiRequests();

  let facilitator;
  if (args.maksKlienter !== undefined) {
    console.error(
      `Søker etter ${args.rolle}-virksomhet med <= ${args.maksKlienter} klienter i Tenor (${args.env}) ...`,
    );
    facilitator = await tenor.hentFacilitatorMedFaaKlienter(args.rolle, args.maksKlienter);
  } else {
    console.error(
      `Henter ${args.rolle}-virksomhet fra Tenor (${args.env}) med ${args.antall} klient(er) ...`,
    );
    facilitator = await tenor.hentFacilitatorMedKlienter(args.rolle, args.antall);
  }

  if (args.json) {
    console.log(JSON.stringify(facilitator, null, 2));
    return;
  }

  console.log(`Rolle:          ${facilitator.rolle}`);
  console.log(
    `Virksomhet:     ${rensTekst(facilitator.navn)} (${rensTekst(facilitator.organisasjonsnummer)})`,
  );
  console.log(`Daglig leder:   ${rensTekst(facilitator.dagligLeder ?? '(ukjent)')}`);
  console.log(`Klienter (${facilitator.klienter.length}):`);
  for (const klient of facilitator.klienter) {
    console.log(`  - ${rensTekst(klient.navn)} (${rensTekst(klient.organisasjonsnummer)})`);
  }
}

export const command: Command = {
  name: 'facilitator',
  summary: 'Hent én facilitator-virksomhet med daglig leder og klienter',
  run,
};
