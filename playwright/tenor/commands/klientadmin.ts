import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loadEnv } from 'playwright/util/helper';

import { RegisterApiRequests } from '../client/RegisterApiRequests';
import { TenorApiRequests, type TenorTestperson } from '../client/TenorApiRequests';
import { parseFlags, requirePositiveInt, unknownArg } from '../lib/cliArgs';

import type { Command } from './Command';

/**
 * Lager en pool med statiske testdata-sett til klientadministrasjon.spec.ts.
 *
 * Hvert sett er en regnskapsfører (aktør) med bosatt daglig leder, en av
 * regnskapsførerens ekte ER-klienter med bosatt daglig leder, og en bosatt,
 * myndig person (agent). Klienten må være en ekte ER-klient, ellers vises den
 * ikke i klientfanen.
 *
 * Ingen person eller virksomhet går igjen i to sett. Spec-en trekker et
 * tilfeldig sett per kjøring, så to samtidige kjøringer sjelden treffer samme
 * aktør — med faste data slettet og la de til samme agent om hverandre.
 *
 * Resultatet er en TypeScript-fil som sjekkes inn. Tenor brukes altså bare når
 * poolen genereres, ikke når testene kjører.
 *
 *   yarn tenor klientadmin --env at23 --register      # 60 sett, kun de som finnes i Register
 *   yarn tenor klientadmin -n 120 --ut /tmp/klientadmin.ts
 */

const DEFAULT_OUTPUT = join(__dirname, '..', '..', 'testdata', 'klientadministrasjon.ts');

/** Hvor mange klienter per regnskapsfører vi prøver før vi går videre til neste. */
const KLIENTER_PER_FACILITATOR = 10;

interface Args {
  antall: number;
  ut: string;
  env: string;
  register: boolean;
}

export interface KlientadminSett {
  actor: { pid: string; org: string; orgName: string };
  client: { connectionPid: string; org: string; orgName: string };
  agent: { pid: string; name: string; lastName: string };
}

function printHelp(): void {
  console.log(
    [
      'Lag en pool med testdata-sett til klientadministrasjon.spec.ts',
      '',
      'Bruk: yarn tenor klientadmin [valg]',
      '',
      '  -n, --antall <tall>   Antall sett i poolen (default: 60)',
      `      --ut <fil>        Fila poolen skrives til (default: ${DEFAULT_OUTPUT})`,
      '      --env <miljø>     Miljø for env-fil: tt02, at22, at23 (default: tt02)',
      '      --register        Ta bare med sett der alle parter finnes i Register for --env',
      '  -h, --help            Vis denne hjelpeteksten',
    ].join('\n'),
  );
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    antall: 60,
    ut: DEFAULT_OUTPUT,
    env: process.env.environment ?? 'tt02',
    register: false,
  };

  parseFlags(
    argv,
    {
      '-n': (next) => (args.antall = Number(next())),
      '--antall': (next) => (args.antall = Number(next())),
      '--ut': (next) => (args.ut = next()),
      '--env': (next) => (args.env = next()),
      '--register': () => (args.register = true),
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

function shuffle<T>(liste: T[]): T[] {
  const kopi = [...liste];
  for (let i = kopi.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopi[i], kopi[j]] = [kopi[j], kopi[i]];
  }
  return kopi;
}

/** Bygger sett til vi har `antall`, eller går tom for regnskapsførere. */
async function byggSett(tenor: TenorApiRequests, antall: number): Promise<KlientadminSett[]> {
  // Brreg-søket er deterministisk, så vi blander selv for å ikke alltid få de samme.
  const facilitatorer = shuffle(await tenor.hentFacilitatorOrgnr('regnskapsfoerer', antall * 3));
  const agenter = await tenor.hentPersonerPaginert(TenorApiRequests.bosattMyndigKql(), antall * 2);
  console.error(
    `Fant ${facilitatorer.length} regnskapsførere og ${agenter.length} agent-kandidater.`,
  );

  const brukt = new Set<string>();
  const sett: KlientadminSett[] = [];

  for (const orgnr of facilitatorer) {
    if (sett.length >= antall) break;
    if (brukt.has(orgnr)) continue;

    const facilitator = await tenor.hentFacilitator(
      'regnskapsfoerer',
      orgnr,
      KLIENTER_PER_FACILITATOR,
    );
    if (!facilitator.dagligLeder || brukt.has(facilitator.dagligLeder)) continue;
    const leder = await tenor.hentBosattPerson(facilitator.dagligLeder);
    if (!leder) continue;

    let klient: { org: string; orgName: string; leder: TenorTestperson } | null = null;
    for (const k of facilitator.klienter) {
      if (k.organisasjonsnummer === orgnr || brukt.has(k.organisasjonsnummer)) continue;
      const klientLederFnr = await tenor.hentDagligLederForOrg(k.organisasjonsnummer);
      if (!klientLederFnr || klientLederFnr === leder.foedselsnummer) continue;
      if (brukt.has(klientLederFnr)) continue;
      const klientLeder = await tenor.hentBosattPerson(klientLederFnr);
      if (!klientLeder) continue;
      klient = { org: k.organisasjonsnummer, orgName: k.navn, leder: klientLeder };
      break;
    }
    if (!klient) continue;

    const agent = agenter.find(
      (a) =>
        !brukt.has(a.foedselsnummer) &&
        a.foedselsnummer !== leder.foedselsnummer &&
        a.foedselsnummer !== klient.leder.foedselsnummer &&
        a.navn &&
        a.etternavn,
    );
    if (!agent) break;

    for (const id of [
      orgnr,
      leder.foedselsnummer,
      klient.org,
      klient.leder.foedselsnummer,
      agent.foedselsnummer,
    ]) {
      brukt.add(id);
    }
    sett.push({
      actor: { pid: leder.foedselsnummer, org: orgnr, orgName: facilitator.navn },
      client: {
        connectionPid: klient.leder.foedselsnummer,
        org: klient.org,
        orgName: klient.orgName,
      },
      agent: { pid: agent.foedselsnummer, name: agent.navn!, lastName: agent.etternavn! },
    });
    console.error(`  ${sett.length}/${antall}: ${facilitator.navn} → ${klient.orgName}`);
  }

  return sett;
}

/** Fjerner sett der en av partene mangler i Register for miljøet. */
async function filtrerPaaRegister(
  sett: KlientadminSett[],
  environment: string,
): Promise<KlientadminSett[]> {
  const ider = (s: KlientadminSett) => [
    s.actor.pid,
    s.actor.org,
    s.client.connectionPid,
    s.client.org,
    s.agent.pid,
  ];
  const parter = await new RegisterApiRequests(environment).lookup(sett.flatMap(ider));
  const beholdt = sett.filter((s) => ider(s).every((id) => parter.has(id)));
  console.error(
    `Register (${environment}): ${sett.length - beholdt.length} av ${sett.length} sett manglet en part.`,
  );
  return beholdt;
}

function tilTypeScript(sett: KlientadminSett[], env: string): string {
  return [
    '// Generert av `yarn tenor klientadmin` — ikke rediger for hånd, generer på nytt.',
    `// Kilde: Tenor, sjekket mot Register i ${env}: se tenor/commands/klientadmin.ts.`,
    '',
    `export const klientadminTestdata = ${JSON.stringify(sett, null, 2)} as const;`,
    '',
  ].join('\n');
}

async function run(argv: string[]): Promise<void> {
  const args = parseArgs(argv);
  loadEnv(args.env);

  const tenor = new TenorApiRequests();
  // Hent litt ekstra når Register skal filtrere, så vi fortsatt når antallet.
  const maal = args.register ? Math.ceil(args.antall * 1.3) : args.antall;
  console.error(`Bygger ${maal} klientadmin-sett fra Tenor (${args.env}) ...`);

  let sett = await byggSett(tenor, maal);
  if (args.register) sett = await filtrerPaaRegister(sett, args.env);
  sett = sett.slice(0, args.antall);

  if (sett.length < args.antall) {
    console.error(`Advarsel: fikk bare ${sett.length} av ${args.antall} sett.`);
  }

  writeFileSync(args.ut, tilTypeScript(sett, args.register ? args.env : 'ingen (uten --register)'));
  console.error(`Skrev ${sett.length} sett til ${args.ut}.`);
}

export const command: Command = {
  name: 'klientadmin',
  summary: 'Lag en pool med statiske testdata-sett til klientadministrasjon-testene',
  run,
};
