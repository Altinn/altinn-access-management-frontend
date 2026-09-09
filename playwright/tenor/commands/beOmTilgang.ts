/* eslint-disable no-console */
import { writeFileSync } from 'node:fs';

import { loadEnv } from 'playwright/util/helper';

import { TenorApiRequests } from '../client/TenorApiRequests';
import { parseFlags, requirePositiveInt, unknownArg } from '../lib/cliArgs';
import type { Command } from './Command';

/**
 * Henter AS-virksomheter med daglig leder fra Tenor, til testdataene for
 * «be om tilgang» i altinn-platform-validation-tests.
 *
 * Skriver et JSON-array med `{ orgNo, pid }` som andre steg (register-oppslaget
 * i k6-repoet) slår opp partyUuid, orgUuid og etternavn for.
 *
 * Rundt en fjerdedel av AS-ene i Tenor mangler daglig leder, så det hentes
 * `antall * 1.5` virksomheter for å komme i mål.
 *
 *   yarn tenor be-om-tilgang -n 200 --ut /tmp/be-om-tilgang-tt02.json
 */

interface Args {
  antall: number;
  ut: string;
  env: string;
}

function printHelp(): void {
  console.log(
    [
      'Hent AS-virksomheter med daglig leder, til «be om tilgang»-testdata',
      '',
      'Bruk: yarn tenor be-om-tilgang [valg]',
      '',
      '  -n, --antall <tall>   Antall virksomheter i output (default: 200)',
      '      --ut <fil>        Fil JSON-resultatet skrives til (default: /tmp/be-om-tilgang-orgs.json)',
      '      --env <miljø>     Miljø for env-fil: tt02, at22, at23 (default: tt02)',
      '  -h, --help            Vis denne hjelpeteksten',
    ].join('\n'),
  );
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    antall: 200,
    ut: '/tmp/be-om-tilgang-orgs.json',
    env: process.env.environment ?? 'tt02',
  };

  parseFlags(
    argv,
    {
      '-n': (next) => (args.antall = Number(next())),
      '--antall': (next) => (args.antall = Number(next())),
      '--ut': (next) => (args.ut = next()),
      '--env': (next) => (args.env = next()),
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

  const tenor = new TenorApiRequests();

  const overhent = Math.ceil(args.antall * 1.5);
  console.error(`Henter ${overhent} AS-virksomheter fra Tenor (${args.env}) ...`);
  const virksomheter = await tenor.hentVirksomheterPaginert('organisasjonsform.kode:AS', overhent);

  console.error(`Slår opp daglig leder for ${virksomheter.length} virksomheter ...`);
  const dagligLedere = await tenor.hentDagligLedere(virksomheter.map((v) => v.organisasjonsnummer));

  const rader = dagligLedere
    .filter(
      (d): d is { organisasjonsnummer: string; dagligLeder: string } => d.dagligLeder !== null,
    )
    .map((d) => ({ orgNo: d.organisasjonsnummer, pid: d.dagligLeder }))
    .slice(0, args.antall);

  writeFileSync(args.ut, JSON.stringify(rader, null, 2));
  console.error(
    `Skrev ${rader.length} rader til ${args.ut} ` +
      `(${virksomheter.length - rader.length} virksomheter manglet daglig leder).`,
  );
}

export const command: Command = {
  name: 'be-om-tilgang',
  summary: 'Eksporter AS-virksomheter + daglig leder til en JSON-fil',
  run,
};
