import { loadEnv } from 'playwright/util/helper';

import { TenorApiRequests, type FacilitatorRolle } from '../client/TenorApiRequests';
import { parseFlags, parseRolle, requirePositiveInt, ROLLER, unknownArg } from '../lib/cliArgs';
import { enrichWithRegister } from '../lib/registerEnrichment';

import type { Command } from './Command';

/**
 * Henter mange unike facilitator-orgnr (revisor / regnskapsfører /
 * forretningsfører) i bulk, valgfritt sammen med daglig leder.
 *
 *   yarn tenor facilitator-orgnr --rolle revisor -n 100          # 100 revisor-orgnr
 *   yarn tenor facilitator-orgnr --rolle revisor -n 100 --dagl   # + daglig leder for hver
 *   yarn tenor facilitator-orgnr -n 20 --json                    # som JSON
 */

interface Args {
  rolle: FacilitatorRolle;
  antall: number;
  dagl: boolean;
  json: boolean;
  register: boolean;
  env: string;
}

function printHelp(): void {
  console.log(
    [
      'Hent facilitator-orgnr fra Tenor i bulk',
      '',
      'Bruk: yarn tenor facilitator-orgnr [valg]',
      '',
      `  -r, --rolle <rolle>   ${ROLLER.join(' | ')} (default: revisor)`,
      '  -n, --antall <tall>   Antall unike facilitator-orgnr som hentes (default: 10)',
      '      --dagl            Slå også opp daglig leder for hver facilitator',
      '      --register        Berik med Altinn-ID-er fra Register (impliserer JSON)',
      '      --json            Skriv ut som JSON',
      '      --env <miljø>     Miljø for env-fil: tt02, at22, at23 (default: tt02)',
      '  -h, --help            Vis denne hjelpeteksten',
    ].join('\n'),
  );
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    rolle: 'revisor',
    antall: 10,
    dagl: false,
    json: false,
    register: false,
    env: process.env.environment ?? 'tt02',
  };

  parseFlags(
    argv,
    {
      '-r': (next) => (args.rolle = parseRolle(next())),
      '--rolle': (next) => (args.rolle = parseRolle(next())),
      '-n': (next) => (args.antall = Number(next())),
      '--antall': (next) => (args.antall = Number(next())),
      '--dagl': () => (args.dagl = true),
      '--env': (next) => (args.env = next()),
      '--register': () => (args.register = true),
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

async function printRows<T>(
  rows: T[],
  args: Args,
  identifier: (row: T) => string,
  plain: (row: T) => string,
  leaderIdentifier?: (row: T) => string | null,
): Promise<void> {
  if (args.register) {
    const registerRows = rows.map((row) => ({
      organisasjonsnummer: identifier(row),
      ...(leaderIdentifier ? { dagligLeder: leaderIdentifier(row) } : {}),
    }));
    console.log(
      JSON.stringify(
        await enrichWithRegister(
          registerRows,
          (row) => row.organisasjonsnummer,
          args.env,
          leaderIdentifier ? (row) => row.dagligLeder : undefined,
        ),
        null,
        2,
      ),
    );
  } else if (args.json) {
    console.log(JSON.stringify(rows, null, 2));
  } else {
    for (const row of rows) console.log(plain(row));
  }
}

async function run(argv: string[]): Promise<void> {
  const args = parseArgs(argv);
  loadEnv(args.env);

  const tenor = new TenorApiRequests();

  if (!args.dagl) {
    console.error(`Henter ${args.antall} ${args.rolle}-virksomheter fra Tenor (${args.env}) ...`);
    const orgnr = await tenor.hentFacilitatorOrgnr(args.rolle, args.antall);
    await printRows(
      orgnr,
      args,
      (org) => org,
      (org) => org,
    );
    console.error(`\n-> ${orgnr.length} ${args.rolle}-virksomheter`);
    return;
  }

  console.error(
    `Henter daglig leder for ${args.antall} ${args.rolle}-virksomheter fra Tenor (${args.env}) ...`,
  );
  const orgnr = await tenor.hentFacilitatorOrgnr(args.rolle, args.antall);
  const dagligLedere = await tenor.hentDagligLedere(orgnr);
  await printRows(
    dagligLedere,
    args,
    (row) => row.organisasjonsnummer,
    (row) => `${row.organisasjonsnummer}\t${row.dagligLeder ?? '(ukjent)'}`,
    (row) => row.dagligLeder,
  );
  const medDagl = dagligLedere.filter((d) => d.dagligLeder).length;
  console.error(`\n-> ${medDagl}/${dagligLedere.length} virksomheter har daglig leder`);
}

export const command: Command = {
  name: 'facilitator-orgnr',
  summary: 'Hent facilitator-orgnr i bulk, valgfritt med daglig leder (--dagl)',
  run,
};
