/* eslint-disable no-console */
import { loadEnv } from 'playwright/util/helper';

import { TenorApiRequests, type FacilitatorRolle } from './TenorApiRequests';

/**
 * CLI for å hente facilitator-virksomheter (revisor / regnskapsfører /
 * forretningsfører) med daglig leder og klienter fra Tenor.
 *
 * Kjøres via yarn-kallet `tenor:virksomhet` i playwright/package.json.
 *
 *   yarn tenor:virksomhet                          # revisor, første facilitator, 5 klienter
 *   yarn tenor:virksomhet --rolle regnskapsfoerer  # regnskapsfører
 *   yarn tenor:virksomhet --rolle forretningsfoerer -n 10
 *   yarn tenor:virksomhet --maks-klienter 10       # finn facilitator med <= 10 klienter (færrest)
 *   yarn tenor:virksomhet --json                   # full struktur som JSON
 */

const ROLLER: FacilitatorRolle[] = ['revisor', 'regnskapsfoerer', 'forretningsfoerer'];

interface CliArgs {
  rolle: FacilitatorRolle;
  antall: number;
  maksKlienter?: number;
  json: boolean;
  env: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    rolle: 'revisor',
    antall: 5,
    json: false,
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
      case '--rolle':
      case '-r': {
        const rolle = next();
        if (!ROLLER.includes(rolle as FacilitatorRolle)) {
          console.error(`Ugyldig rolle: ${rolle}. Gyldige: ${ROLLER.join(', ')}`);
          process.exit(1);
        }
        args.rolle = rolle as FacilitatorRolle;
        break;
      }
      case '-n':
      case '--antall':
        args.antall = Number(next());
        break;
      case '--maks-klienter':
      case '-m':
        args.maksKlienter = Number(next());
        break;
      case '--env':
        args.env = next();
        break;
      case '--json':
        args.json = true;
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

  if (
    args.maksKlienter !== undefined &&
    (!Number.isInteger(args.maksKlienter) || args.maksKlienter < 1)
  ) {
    console.error(`--maks-klienter må være et positivt heltall (fikk: ${args.maksKlienter}).`);
    process.exit(1);
  }

  return args;
}

function printHelp(): void {
  console.log(
    [
      'Hent facilitator-virksomheter fra Tenor',
      '',
      'Bruk: yarn tenor:virksomhet [valg]',
      '',
      `  -r, --rolle <rolle>       ${ROLLER.join(' | ')} (default: revisor)`,
      '  -n, --antall <tall>       Antall klienter som hentes (default: 5)',
      '  -m, --maks-klienter <tall> Finn facilitator med færrest klienter, høyst <tall>',
      '      --json                Skriv ut full struktur som JSON',
      '      --env <miljø>     Miljø for env-fil: tt02, at22, at23, at24 (default: tt02)',
      '  -h, --help            Vis denne hjelpeteksten',
    ].join('\n'),
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
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
  console.log(`Virksomhet:     ${facilitator.navn} (${facilitator.organisasjonsnummer})`);
  console.log(`Daglig leder:   ${facilitator.dagligLeder ?? '(ukjent)'}`);
  console.log(`Klienter (${facilitator.klienter.length}):`);
  for (const klient of facilitator.klienter) {
    console.log(`  - ${klient.navn} (${klient.organisasjonsnummer})`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
