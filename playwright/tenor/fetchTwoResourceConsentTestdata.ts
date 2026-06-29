/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
// eslint-disable-next-line import/default
import dotenv from 'dotenv';

import { Token } from 'playwright/api-requests/Token';
import { TenorApiRequests } from './TenorApiRequests';

/**
 * Genererer en DEDIKERT, FERSK testdata-pool for K6 to-ressurs consent-testen
 * (post-consent-two-resources.js), adskilt fra den delte 1000-personers poolen:
 *
 *   K6/testdata/authentication/consent/two-resources/
 *     - consentee-orgs/<env>.csv       (header: orgNo)
 *     - consenter-persons/<env>.csv    (header: ssn,partyUuid)
 *
 * "Fersk" = personer/orgnr som IKKE allerede finnes i de delte CSV-ene under
 * K6/testdata/authentication/consent/{consenter-persons,consentee-orgs}, slik at
 * disse 100 personene starter uten consent-historikk.
 *
 * Flyt (samme som fetchConsentEventTestdata.ts):
 *   1. Hent en pool fra Tenor (freg: bosatt+myndig, brreg: AS).
 *   2. Filtrer bort dem som finnes i den delte poolen.
 *   3. Slå opp partyUuid i Altinn Register (bulk, 100 av gangen) per miljø.
 *   4. Behold de som finnes i ALLE valgte miljøer, og skriv CSV-ene.
 */

const REPO = '/Users/vegardnyeng/Digdir/Repos/altinn-platform-validation-tests';
const CONSENT_DIR = path.join(REPO, 'K6/testdata/authentication/consent');
const OUTPUT_DIR = path.join(CONSENT_DIR, 'two-resources');

const WANT_PERSONS = 100;
const WANT_ORGS = 5;
// Hent rikelig fra Tenor så vi har nok igjen etter ekskludering + kryssmiljø-snitt.
// Må være godt over den delte poolen (1000), ellers er alle treff allerede brukt
// (samme KQL + seed-rekkefølge gir samme første N personer).
const PERSON_POOL = 1500;
const ORG_POOL = 60;
const REGISTER_CHUNK = 100;

interface EnvConfig {
  name: string;
  apiBase: string;
  subKeyEnv: string;
}

// Bare miljøene hvor de to ressursene finnes (tt02: ekte SKE-eide, yt01: ttd-eide).
const ENVS: EnvConfig[] = [
  {
    name: 'tt02',
    apiBase: 'https://platform.tt02.altinn.no',
    subKeyEnv: 'TT02_REGISTER_SUBSCRIPTION_KEY',
  },
  {
    name: 'yt01',
    apiBase: 'https://platform.yt01.altinn.cloud',
    subKeyEnv: 'YT01_REGISTER_SUBSCRIPTION_KEY',
  },
];

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
    if (!res.ok && res.status !== 206) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Register-oppslag feilet (${envCfg.name}) HTTP ${res.status}: ${txt}`);
    }
    const json = (await res.json()) as { data?: RegisterParty[] };
    out.push(...(json.data ?? []));
  }
  return out;
}

function indexPersons(parties: RegisterParty[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const p of parties) {
    if (p.partyType !== 'person' || !p.personIdentifier || !p.partyUuid) continue;
    map.set(p.personIdentifier, p.partyUuid);
  }
  return map;
}

function indexOrgs(parties: RegisterParty[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const p of parties) {
    if (p.partyType !== 'organization' || !p.organizationIdentifier || !p.partyUuid) continue;
    map.set(p.organizationIdentifier, p.partyUuid);
  }
  return map;
}

/** Leser kolonne 0 (uten header) fra de delte CSV-ene for å bygge ekskluderingssett. */
function readExisting(subdir: string): Set<string> {
  const set = new Set<string>();
  for (const env of ENVS) {
    const file = path.join(CONSENT_DIR, subdir, `${env.name}.csv`);
    if (!fs.existsSync(file)) continue;
    const lines = fs.readFileSync(file, 'utf-8').split('\n').slice(1);
    for (const line of lines) {
      const col0 = line.split(',')[0]?.trim();
      if (col0) set.add(col0);
    }
  }
  return set;
}

function writeCsv(filePath: string, lines: string[]): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, lines.join('\n') + '\n');
}

async function main(): Promise<void> {
  lastEnv('tt02');

  const availableEnvs = ENVS.filter((e) => {
    if (process.env[e.subKeyEnv]) return true;
    console.error(`Hopper over ${e.name}: mangler ${e.subKeyEnv}`);
    return false;
  });
  if (availableEnvs.length === 0) {
    throw new Error('Ingen miljøer har register subscription key satt – avbryter.');
  }

  const excludePids = readExisting('consenter-persons');
  const excludeOrgs = readExisting('consentee-orgs');
  console.error(
    `Ekskluderer ${excludePids.size} eksisterende PID-er og ${excludeOrgs.size} eksisterende orgnr (delt pool).`,
  );

  const tenor = new TenorApiRequests();

  console.error(`Henter ${PERSON_POOL} testpersoner (bosatt+myndig) fra Tenor ...`);
  const persons = await tenor.hentPersonerPaginert(TenorApiRequests.bosattMyndigKql(), PERSON_POOL);
  const pids = [...new Set(persons.map((p) => p.foedselsnummer))].filter(
    (pid) => !excludePids.has(pid),
  );
  console.error(`  -> ${pids.length} ferske unike PID-er (etter ekskludering)`);

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
  ].filter((o) => !excludeOrgs.has(o));
  console.error(`  -> ${orgNos.length} ferske unike orgnr (etter ekskludering)`);

  const personUrns = pids.map((pid) => `urn:altinn:person:identifier-no:${pid}`);
  const orgUrns = orgNos.map((o) => `urn:altinn:organization:identifier-no:${o}`);

  const personByEnv: Record<string, Map<string, string>> = {};
  const orgByEnv: Record<string, Map<string, string>> = {};

  for (const envCfg of availableEnvs) {
    lastEnv(envCfg.name);
    process.env.ENV_NAME = envCfg.name;
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

    const orgLines = ['orgNo', ...orgsAll];
    const orgsPath = path.join(OUTPUT_DIR, 'consentee-orgs', `${envName}.csv`);
    writeCsv(orgsPath, orgLines);
    console.error(`Skrev ${orgsPath} (${orgsAll.length} orgs)`);
  }

  console.error('\nFerdig.');
}

main().catch((error) => {
  console.error(error instanceof Error ? (error.stack ?? error.message) : error);
  process.exit(1);
});
