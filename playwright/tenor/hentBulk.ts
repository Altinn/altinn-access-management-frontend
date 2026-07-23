/* eslint-disable no-console */
import { loadEnv } from 'playwright/util/helper';

import { TenorApiRequests, type FacilitatorRolle } from './TenorApiRequests';

/**
 * Generell CLI for å hente Tenor-testdata i bulk (forbi 200-grensen).
 *
 * Kjøres via yarn-kallet `tenor:bulk` i playwright/package.json.
 *
 *   yarn tenor:bulk --type persons -n 100             # 100 bosatte, myndige personer
 *   yarn tenor:bulk --type orgs -n 100                # 100 AS-virksomheter
 *   yarn tenor:bulk --type facilitators --rolle revisor -n 100   # 100 revisor-virksomheter
 *   yarn tenor:bulk --type dagl --rolle revisor -n 100           # daglig leder for 100 revisor-virksomheter
 *   yarn tenor:bulk --type persons --kql "personstatus:bosatt" -n 50   # egendefinert KQL
 *   yarn tenor:bulk --type orgs -n 20 --json          # full struktur som JSON
 *   yarn tenor:bulk --type persons -n 50 --env at23   # mot et annet miljø
 */

const TYPES = ['persons', 'orgs', 'facilitators', 'dagl'] as const;
type BulkType = (typeof TYPES)[number];

const ROLLER: FacilitatorRolle[] = ['revisor', 'regnskapsfoerer', 'forretningsfoerer'];

interface CliArgs {
  type: BulkType;
  rolle: FacilitatorRolle;
  antall: number;
  kql?: string;
  json: boolean;
  env: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    type: 'persons',
    rolle: 'revisor',
    antall: 10,
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
      case '--type':
      case '-t': {
        const type = next();
        if (!TYPES.includes(type as BulkType)) {
          console.error(`Ugyldig type: ${type}. Gyldige: ${TYPES.join(', ')}`);
          process.exit(1);
        }
        args.type = type as BulkType;
        break;
      }
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
      case '--kql':
        args.kql = next();
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

  return args;
}

function printHelp(): void {
  console.log(
    [
      'Hent Tenor-testdata i bulk',
      '',
      'Bruk: yarn tenor:bulk --type <type> [valg]',
      '',
      `  -t, --type <type>     ${TYPES.join(' | ')} (default: persons)`,
      `  -r, --rolle <rolle>   ${ROLLER.join(' | ')} – for facilitators/dagl (default: revisor)`,
      '  -n, --antall <tall>   Antall som hentes (default: 10)',
      '      --kql <kql>       Egendefinert KQL – for persons/orgs (overstyrer standardsøk)',
      '      --json            Skriv ut som JSON',
      '      --env <miljø>     Miljø for env-fil: tt02, at22, at23, at24 (default: tt02)',
      '  -h, --help            Vis denne hjelpeteksten',
    ].join('\n'),
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  loadEnv(args.env);

  const tenor = new TenorApiRequests();

  switch (args.type) {
    case 'persons': {
      const kql = args.kql ?? TenorApiRequests.bosattMyndigKql();
      console.error(`Henter ${args.antall} personer fra Tenor (${args.env}) ...`);
      const personer = await tenor.hentPersonerPaginert(kql, args.antall);
      if (args.json) {
        console.log(JSON.stringify(personer, null, 2));
      } else {
        for (const p of personer) console.log(`${p.foedselsnummer}\t${p.navn ?? ''}`);
      }
      console.error(`\n-> ${personer.length} personer`);
      break;
    }
    case 'orgs': {
      const kql = args.kql ?? 'organisasjonsform.kode:AS';
      console.error(`Henter ${args.antall} virksomheter fra Tenor (${args.env}) ...`);
      const virksomheter = await tenor.hentVirksomheterPaginert(kql, args.antall);
      if (args.json) {
        console.log(JSON.stringify(virksomheter, null, 2));
      } else {
        for (const v of virksomheter) console.log(`${v.organisasjonsnummer}\t${v.navn}`);
      }
      console.error(`\n-> ${virksomheter.length} virksomheter`);
      break;
    }
    case 'facilitators': {
      console.error(`Henter ${args.antall} ${args.rolle}-virksomheter fra Tenor (${args.env}) ...`);
      const orgnr = await tenor.hentFacilitatorOrgnr(args.rolle, args.antall);
      if (args.json) {
        console.log(JSON.stringify(orgnr, null, 2));
      } else {
        for (const o of orgnr) console.log(o);
      }
      console.error(`\n-> ${orgnr.length} ${args.rolle}-virksomheter`);
      break;
    }
    case 'dagl': {
      console.error(
        `Henter daglig leder for ${args.antall} ${args.rolle}-virksomheter fra Tenor (${args.env}) ...`,
      );
      const orgnr = await tenor.hentFacilitatorOrgnr(args.rolle, args.antall);
      const dagligLedere = await tenor.hentDagligLedere(orgnr);
      if (args.json) {
        console.log(JSON.stringify(dagligLedere, null, 2));
      } else {
        for (const d of dagligLedere)
          console.log(`${d.organisasjonsnummer}\t${d.dagligLeder ?? '(ukjent)'}`);
      }
      const medDagl = dagligLedere.filter((d) => d.dagligLeder).length;
      console.error(`\n-> ${medDagl}/${dagligLedere.length} virksomheter har daglig leder`);
      break;
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
