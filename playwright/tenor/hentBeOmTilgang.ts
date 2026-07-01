/* eslint-disable no-console */
import { Token } from 'playwright/api-requests/Token';
import { loadEnv } from 'playwright/util/helper';

import { TenorApiRequests } from './TenorApiRequests';

/**
 * CLI for å bygge testdata til "be om tilgang"-testen
 * (altinn-platform-validation-tests, POST /enduser/request/package).
 *
 * Henter N virksomheter med daglig leder fra Tenor, og beriker hver med
 * partyUuid + etternavn for daglig leder (person) og partyUuid for
 * virksomheten (org) via Altinn register (parties/query). Skriver CSV til
 * stdout med kolonnene:
 *
 *   pid,partyUuid,orgUuid,orgNo,lastName
 *
 *   pid       = fødselsnummer til daglig leder
 *   partyUuid = partyUuid til daglig leder (person)
 *   orgUuid   = partyUuid til virksomheten
 *   orgNo     = organisasjonsnummer
 *   lastName  = etternavn til daglig leder (kreves når personen legges til som connection)
 *
 * Bruk:
 *   npx tsx tenor/hentBeOmTilgang.ts                  # 10 par, tt02
 *   npx tsx tenor/hentBeOmTilgang.ts -n 10 --env tt02
 *   npx tsx tenor/hentBeOmTilgang.ts > ../../altinn-platform-validation-tests/K6/testdata/authentication/beomtilgang/tt02.csv
 */

interface CliArgs {
  antall: number;
  env: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { antall: 10, env: process.env.environment ?? 'tt02' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (value === undefined) {
        console.error(`Mangler verdi for ${arg}.`);
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
      case '-h':
      case '--help':
        console.log(
          [
            'Bygg "be om tilgang"-testdata fra Tenor + register',
            '',
            'Bruk: npx tsx tenor/hentBeOmTilgang.ts [valg]',
            '',
            '  -n, --antall <tall>   Antall virksomheter/daglige ledere (default: 10)',
            '      --env <miljø>     Miljø for env-fil: tt02, at22, at23, at24 (default: tt02)',
            '  -h, --help            Vis denne hjelpeteksten',
          ].join('\n'),
        );
        process.exit(0);
      // eslint-disable-next-line no-fallthrough
      default:
        console.error(`Ukjent argument: ${arg}`);
        process.exit(1);
    }
  }
  if (!Number.isInteger(args.antall) || args.antall < 1) {
    console.error(`--antall må være et positivt heltall (fikk: ${args.antall}).`);
    process.exit(1);
  }
  return args;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  loadEnv(args.env);

  const tenor = new TenorApiRequests();
  const token = new Token();

  // Skann en romslig pool AS-virksomheter; ikke alle har en registrert daglig
  // leder, og vi vil ende opp med `antall` unike (virksomhet, daglig leder)-par.
  const kandidater = await tenor.hentVirksomheterPaginert(
    'organisasjonsform.kode:AS',
    args.antall * 5,
  );
  console.error(
    `Skannet ${kandidater.length} AS-virksomheter fra Tenor (${args.env}); slår opp daglig leder + partyUuid ...`,
  );

  const rader: Array<{
    pid: string;
    partyUuid: string;
    orgUuid: string;
    orgNo: string;
    lastName: string;
  }> = [];
  const settePids = new Set<string>();

  for (const virksomhet of kandidater) {
    if (rader.length >= args.antall) break;
    const orgNo = virksomhet.organisasjonsnummer;

    const pid = await tenor.hentDagligLederForOrg(orgNo);
    if (!pid || settePids.has(pid)) continue;

    try {
      const orgUuid = await token.getPartyUuid(orgNo);
      const dagl = await token.getIds(pid);
      if (!orgUuid || !dagl?.partyUuid || !dagl?.lastName) {
        console.error(
          `Hopper over ${orgNo}: mangler data (org=${orgUuid}, dagl=${dagl?.partyUuid}, lastName=${dagl?.lastName}).`,
        );
        continue;
      }
      settePids.add(pid);
      rader.push({ pid, partyUuid: dagl.partyUuid, orgUuid, orgNo, lastName: dagl.lastName });
      console.error(
        `  ${rader.length}/${args.antall}  org ${orgNo} / dagl ${pid} (${dagl.lastName})`,
      );
    } catch (error) {
      console.error(`Hopper over ${orgNo}: ${error instanceof Error ? error.message : error}`);
    }
  }

  if (rader.length < args.antall) {
    console.error(
      `Advarsel: fant bare ${rader.length} av ${args.antall} par. Øk poolen (kandidater) ved behov.`,
    );
  }

  console.log('pid,partyUuid,orgUuid,orgNo,lastName');
  for (const r of rader) {
    console.log(`${r.pid},${r.partyUuid},${r.orgUuid},${r.orgNo},${r.lastName}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
