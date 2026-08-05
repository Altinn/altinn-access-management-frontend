/* eslint-disable no-console */
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

import { Token } from 'playwright/api-requests/Token';
import { loadEnv } from 'playwright/util/helper';

import { TenorApiRequests, type FacilitatorRolle } from './TenorApiRequests';

/**
 * CLI for å lage testdata til k6-testen som delegerer klienter til en
 * agent-systembruker.
 *
 * Tenor gir virksomhetene og daglig leder. Alt Altinn kaller dem, altså partyId,
 * partyUuid og userId, slås opp i Register per miljø, siden Tenor holder de samme
 * syntetiske virksomhetene overalt mens Altinn-id-ene er miljøspesifikke.
 *
 * Kjøres via yarn-kallet `tenor:klientdelegering` i playwright/package.json.
 *
 *   yarn tenor:klientdelegering --env at23              # 10 virksomheter til at23
 *   yarn tenor:klientdelegering --env tt02 -n 25        # 25 virksomheter
 *   yarn tenor:klientdelegering --env at23 --stdout     # skriv til skjerm i stedet for fil
 *
 * Resultatet havner i K6/testdata/access-management/client-delegation/<env>.csv i
 * altinn-platform-validation-tests, som testen leser fra main.
 */

/** Rollene testen dekker, og hva k6-testdataene kaller dem. */
const ROLLER: Array<{ tenor: FacilitatorRolle; orgType: string }> = [
  { tenor: 'revisor', orgType: 'revisor' },
  { tenor: 'regnskapsfoerer', orgType: 'regnskapsforer' },
  { tenor: 'forretningsfoerer', orgType: 'forretningsforer' },
];

const CSV_HEADER = 'orgNo,partyId,orgUuid,userId,userPartyUuid,ssn,orgType';

const DEFAULT_UT_KATALOG = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'altinn-platform-validation-tests',
  'K6',
  'testdata',
  'access-management',
  'client-delegation',
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
      'Bruk: yarn tenor:klientdelegering [valg]',
      '',
      '  -n, --antall <n>   Hvor mange virksomheter totalt, fordelt på de tre rollene. Standard 10.',
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
 * Fordeler antallet på rollene, med resten på de første, slik at alle tre roller
 * er representert også når antallet ikke går opp.
 */
function fordelPaaRoller(antall: number): number[] {
  const perRolle = Math.floor(antall / ROLLER.length);
  const rest = antall % ROLLER.length;

  return ROLLER.map((_, i) => perRolle + (i < rest ? 1 : 0));
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  loadEnv(args.env);
  process.env.ENV_NAME = args.env;

  const tenor = new TenorApiRequests();
  const token = new Token();

  const fordeling = fordelPaaRoller(args.antall);

  // En virksomhet kan ha flere roller. Den beholdes med den første rollen den ble
  // funnet under, ellers ville den fått to rader med samme orgnr.
  const sett = new Set<string>();
  const rader: string[] = [];

  for (const [i, rolle] of ROLLER.entries()) {
    const oenskes = fordeling[i];
    if (oenskes === 0) continue;

    console.error(`Henter ${oenskes} ${rolle.tenor}-virksomheter fra Tenor ...`);

    // Be om flere enn vi trenger, siden noen faller fra på manglende daglig leder
    // eller på at Register ikke kjenner dem i dette miljøet.
    const orgnr = await tenor.hentFacilitatorOrgnr(rolle.tenor, oenskes * 3);
    const dagligLedere = await tenor.hentDagligLedere(orgnr);

    let lagtTil = 0;

    for (const { organisasjonsnummer, dagligLeder } of dagligLedere) {
      if (lagtTil >= oenskes) break;
      if (dagligLeder === null || sett.has(organisasjonsnummer)) continue;

      try {
        const org = await token.getIds(organisasjonsnummer);
        const person = await token.getIds(dagligLeder);

        if (!org?.partyUuid || !person?.user?.userId) {
          console.error(
            `  hopper over ${organisasjonsnummer}, Register mangler id-er i ${args.env}`,
          );
          continue;
        }

        // partyId er virksomhetens, ikke daglig leders. Det er virksomheten man
        // opptrer for, og bff-stiene tar den i {partyId}. Med personens partyId
        // svarer både godkjenning og delegering 400 AMUI-00005.
        sett.add(organisasjonsnummer);
        rader.push(
          [
            organisasjonsnummer,
            org.partyId,
            org.partyUuid,
            person.user.userId,
            person.partyUuid,
            dagligLeder,
            rolle.orgType,
          ].join(','),
        );
        lagtTil++;
      } catch (error) {
        console.error(
          `  hopper over ${organisasjonsnummer}: ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    console.error(`  -> ${lagtTil} av ${oenskes} ${rolle.orgType}`);
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
    const fil = args.ut ?? path.join(DEFAULT_UT_KATALOG, `${args.env}.csv`);
    mkdirSync(path.dirname(fil), { recursive: true });
    writeFileSync(fil, csv);
    console.error(`\nSkrev ${rader.length} virksomheter til ${fil}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
