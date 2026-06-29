/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
// eslint-disable-next-line import/default
import dotenv from 'dotenv';

import { Token } from 'playwright/api-requests/Token';
import { TenorApiRequests } from './TenorApiRequests';

/**
 * Genererer testdata for K6 consent request-events-testen:
 *
 *   K6/testdata/authentication/consent/request-events/
 *     - consentee-orgs/<env>.csv       (header: orgNo)
 *     - consenter-persons/<env>.csv    (header: ssn,partyUuid)
 *
 * Flyt:
 *   1. Hent en pool med testpersoner (freg, bosatt+myndig) og virksomheter
 *      (brreg) fra Tenor. PID/orgnr er felles på tvers av miljøer.
 *   2. Slå opp partyUuid i Altinn Register (bulk, 100 av gangen) – egen
 *      spørring per miljø (samme PID/orgnr, men ulik partyUuid per miljø).
 *   3. Behold de som finnes i ALLE miljøer, og skriv CSV-ene.
 *
 * Få consentee-orgs (de samler events), men mange consenter-personer (slik at
 * ingen enkeltperson hoper opp for mange consent requests over tid).
 */

const OUTPUT_DIR =
  '/Users/vegardnyeng/Digdir/Repos/altinn-platform-validation-tests/K6/testdata/authentication/consent';

// Få orgs (de skal samle mange events), mange personer (spre consents tynt).
const WANT_ORGS = 20;
const WANT_PERSONS = 1000;
// Vi slår opp hele poolen i Register (100 per kall => 10 kall per miljø for 1000).
// Tenor pagineres forbi 200-grensen i hentPersonerPaginert.
const PERSON_POOL = 1000;
const ORG_POOL = 100;
const REGISTER_CHUNK = 100;

// Orgs that must always be present in a given environment's consentee list,
// regardless of what Tenor returns (prepended, then filled up to WANT_ORGS).
const PINNED_ORGS: Record<string, string[]> = {
  yt01: ['730077254'],
};

interface EnvConfig {
  name: string;
  apiBase: string;
  subKeyEnv: string;
}

const ENVS: EnvConfig[] = [
  {
    name: 'tt02',
    apiBase: 'https://platform.tt02.altinn.no',
    subKeyEnv: 'TT02_REGISTER_SUBSCRIPTION_KEY',
  },
  {
    name: 'at23',
    apiBase: 'https://platform.at23.altinn.cloud',
    subKeyEnv: 'AT23_REGISTER_SUBSCRIPTION_KEY',
  },
  {
    name: 'yt01',
    apiBase: 'https://platform.yt01.altinn.cloud',
    subKeyEnv: 'YT01_REGISTER_SUBSCRIPTION_KEY',
  },
];

/** Laster env-filer fra playwright/config (samme mønster som de andre Tenor-CLI-ene). */
function lastEnv(envName: string): void {
  const configDir = path.join(__dirname, '..', 'config');
  dotenv.config({
    path: [
      path.join(configDir, '.env'),
      path.join(configDir, `.env.${envName}`),
      path.join(configDir, '.env.local'),
      path.join(configDir, `.env.${envName}.local`),
    ],
    override: true,
  });
}

interface RegisterParty {
  partyType?: string;
  personIdentifier?: string;
  organizationIdentifier?: string;
  partyUuid?: string;
}

/** Slår opp en liste identifikatorer i Register og returnerer rådata-partene. */
async function lookupParties(
  envCfg: EnvConfig,
  platformToken: string,
  urns: string[],
): Promise<RegisterParty[]> {
  const subKey = process.env[envCfg.subKeyEnv];
  if (!subKey) throw new Error(`Mangler env-variabel ${envCfg.subKeyEnv}`);

  const url = `${envCfg.apiBase}/register/api/v1/access-management/parties/query?fields=person,party`;
  const out: RegisterParty[] = [];

  for (let i = 0; i < urns.length; i += REGISTER_CHUNK) {
    const chunk = urns.slice(i, i + REGISTER_CHUNK);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        PlatformAccessToken: platformToken,
        'Ocp-Apim-Subscription-Key': subKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: chunk }),
    });

    // 200 = alle funnet, 206 = noen mangler. Begge er OK for oss.
    if (!res.ok && res.status !== 206) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Register-oppslag feilet (${envCfg.name}) HTTP ${res.status}: ${txt}`);
    }
    const json = (await res.json()) as { data?: RegisterParty[] };
    out.push(...(json.data ?? []));
  }
  return out;
}

/** Map: personIdentifier -> partyUuid. */
function indexPersons(parties: RegisterParty[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const p of parties) {
    if (p.partyType !== 'person' || !p.personIdentifier || !p.partyUuid) continue;
    map.set(p.personIdentifier, p.partyUuid);
  }
  return map;
}

/** Map: organizationIdentifier -> partyUuid. */
function indexOrgs(parties: RegisterParty[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const p of parties) {
    if (p.partyType !== 'organization' || !p.organizationIdentifier || !p.partyUuid) continue;
    map.set(p.organizationIdentifier, p.partyUuid);
  }
  return map;
}

function writeCsv(filePath: string, lines: string[]): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, lines.join('\n') + '\n');
}

async function main(): Promise<void> {
  // Felles creds (Maskinporten, token-generator, subscription keys) ligger i base .env.
  // Vi laster tt02-konteksten først; per-miljø-verdier (API_BASE_URL/ENV_NAME) bruker vi
  // ikke direkte her – de er hardkodet i ENVS – men ENV_NAME må settes for Token().
  lastEnv('tt02');

  // Only query the environments whose register subscription key is configured.
  // (e.g. yt01 is skipped until YT01_REGISTER_SUBSCRIPTION_KEY is added.)
  const availableEnvs = ENVS.filter((e) => {
    if (process.env[e.subKeyEnv]) return true;
    console.error(`Hopper over ${e.name}: mangler ${e.subKeyEnv}`);
    return false;
  });
  if (availableEnvs.length === 0) {
    throw new Error('Ingen miljøer har register subscription key satt – avbryter.');
  }

  const tenor = new TenorApiRequests();

  console.error(`Henter ${PERSON_POOL} testpersoner (bosatt+myndig) fra Tenor ...`);
  const persons = await tenor.hentPersonerPaginert(TenorApiRequests.bosattMyndigKql(), PERSON_POOL);
  const pids = [...new Set(persons.map((p) => p.foedselsnummer))];
  console.error(`  -> ${pids.length} unike PID-er`);

  console.error(`Henter ${ORG_POOL} virksomheter (AS) fra Tenor ...`);
  const orgDocs = await tenor.sokBrreg('organisasjonsform.kode:AS', ORG_POOL);
  const orgNos = [
    ...new Set(
      orgDocs
        .map((d) => {
          const raw = d.tenorMetadata?.kildedata;
          if (!raw) return null;
          try {
            const orgnr = (JSON.parse(raw) as { organisasjonsnummer?: string }).organisasjonsnummer;
            return orgnr && /^\d{9}$/.test(orgnr) ? orgnr : null;
          } catch {
            return null;
          }
        })
        .filter((o): o is string => o !== null),
    ),
  ];
  console.error(`  -> ${orgNos.length} unike orgnr`);

  const personUrns = pids.map((pid) => `urn:altinn:person:identifier-no:${pid}`);
  const orgUrns = orgNos.map((o) => `urn:altinn:organization:identifier-no:${o}`);

  // Slå opp i Register for hvert miljø (egen spørring per miljø).
  const personByEnv: Record<string, Map<string, string>> = {};
  const orgByEnv: Record<string, Map<string, string>> = {};

  for (const envCfg of availableEnvs) {
    lastEnv(envCfg.name); // laster creds m.m.
    process.env.ENV_NAME = envCfg.name; // styr hvilket miljø Token() henter for (ikke avhengig av .env.<env>)
    const token = new Token();
    const platformToken = await token.getPlatformToken();
    console.error(`Slår opp i Register (${envCfg.name}) ...`);

    const personParties = await lookupParties(envCfg, platformToken, personUrns);
    const orgParties = await lookupParties(envCfg, platformToken, orgUrns);

    personByEnv[envCfg.name] = indexPersons(personParties);
    orgByEnv[envCfg.name] = indexOrgs(orgParties);
    console.error(
      `  -> personer: ${personByEnv[envCfg.name].size}, orgs: ${orgByEnv[envCfg.name].size}`,
    );
  }

  // Behold kun de som finnes i ALLE miljøer (PID/orgnr er felles på tvers).
  const personsAll = pids
    .filter((pid) => availableEnvs.every((e) => personByEnv[e.name].has(pid)))
    .slice(0, WANT_PERSONS);
  const orgsAll = orgNos
    .filter((o) => availableEnvs.every((e) => orgByEnv[e.name].has(o)))
    .slice(0, WANT_ORGS);

  console.error(`\nFinnes i alle miljøer: ${personsAll.length} personer, ${orgsAll.length} orgs`);
  if (personsAll.length < WANT_PERSONS)
    console.error(
      `ADVARSEL: bare ${personsAll.length}/${WANT_PERSONS} personer – øk PERSON_POOL og kjør på nytt.`,
    );
  if (orgsAll.length < WANT_ORGS)
    console.error(
      `ADVARSEL: bare ${orgsAll.length}/${WANT_ORGS} orgs – øk ORG_POOL og kjør på nytt.`,
    );

  // Skriv CSV-er per miljø. Samme PID/orgnr, men partyUuid fra det aktuelle miljøet.
  for (const envCfg of availableEnvs) {
    const envName = envCfg.name;
    const pMap = personByEnv[envName];

    const personLines = ['ssn,partyUuid'];
    for (const pid of personsAll) {
      personLines.push(`${pid},${pMap.get(pid)!}`);
    }
    const personsPath = path.join(OUTPUT_DIR, 'consenter-persons', `${envName}.csv`);
    writeCsv(personsPath, personLines);
    console.error(`Skrev ${personsPath} (${personsAll.length} personer)`);

    // Prepend env-specific pinned orgs (deduped), then fill up to WANT_ORGS.
    const orgsForEnv = [...new Set([...(PINNED_ORGS[envName] ?? []), ...orgsAll])].slice(
      0,
      WANT_ORGS,
    );
    const orgLines = ['orgNo', ...orgsForEnv];
    const orgsPath = path.join(OUTPUT_DIR, 'consentee-orgs', `${envName}.csv`);
    writeCsv(orgsPath, orgLines);
    console.error(`Skrev ${orgsPath} (${orgsForEnv.length} orgs)`);
  }

  console.error('\nFerdig.');
}

main().catch((error) => {
  console.error(error instanceof Error ? (error.stack ?? error.message) : error);
  process.exit(1);
});
