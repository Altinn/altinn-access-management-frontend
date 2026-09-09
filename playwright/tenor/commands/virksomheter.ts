/* eslint-disable no-console */
import { loadEnv } from 'playwright/util/helper';

import { TenorApiRequests } from '../client/TenorApiRequests';
import { parseFlags, requirePositiveInt, unknownArg } from '../lib/cliArgs';
import type { Command } from './Command';

/**
 * Henter virksomheter fra Tenor i bulk (forbi Tenors 200-per-kall-grense).
 *
 *   yarn tenor virksomheter -n 100                              # 100 AS-virksomheter
 *   yarn tenor virksomheter -n 20 --kql "organisasjonsform.kode:ENK"
 *   yarn tenor virksomheter -n 20 --json                        # full struktur som JSON
 *   yarn tenor virksomheter -n 50 --env at23                    # mot et annet miljø
 */

interface Args {
  antall: number;
  kql?: string;
  json: boolean;
  env: string;
}

function printHelp(): void {
  console.log(
    [
      'Hent virksomheter fra Tenor i bulk',
      '',
      'Bruk: yarn tenor virksomheter [valg]',
      '',
      '  -n, --antall <tall>   Antall virksomheter som hentes (default: 10)',
      '      --kql <kql>       Egendefinert KQL (default: organisasjonsform.kode:AS)',
      '      --json            Skriv ut som JSON',
      '      --env <miljø>     Miljø for env-fil: tt02, at22, at23 (default: tt02)',
      '  -h, --help            Vis denne hjelpeteksten',
    ].join('\n'),
  );
}

function parseArgs(argv: string[]): Args {
  const args: Args = { antall: 10, json: false, env: process.env.environment ?? 'tt02' };

  parseFlags(
    argv,
    {
      '-n': (next) => (args.antall = Number(next())),
      '--antall': (next) => (args.antall = Number(next())),
      '--kql': (next) => (args.kql = next()),
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
  return args;
}

async function run(argv: string[]): Promise<void> {
  const args = parseArgs(argv);
  loadEnv(args.env);

  const kql = args.kql ?? 'organisasjonsform.kode:AS';
  console.error(`Henter ${args.antall} virksomheter fra Tenor (${args.env}) ...`);

  const tenor = new TenorApiRequests();
  const virksomheter = await tenor.hentVirksomheterPaginert(kql, args.antall);

  if (args.json) {
    console.log(JSON.stringify(virksomheter, null, 2));
  } else {
    for (const v of virksomheter) console.log(`${v.organisasjonsnummer}\t${v.navn}`);
  }
  console.error(`\n-> ${virksomheter.length} virksomheter`);
}

export const command: Command = {
  name: 'virksomheter',
  summary: 'Hent virksomheter i bulk (default: AS)',
  run,
};
