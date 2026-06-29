/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
// eslint-disable-next-line import/default
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

import { Token } from 'playwright/api-requests/Token';
import { env } from 'playwright/util/helper';

/**
 * Oppretter consent requests for ALLE consent-templates for testbrukeren
 * "Minst Dress" (06857897380) i TT02 og AT23.
 *
 * Per template lages TO forespørsler:
 *   - én som godkjennes (approved)
 *   - én som aldri godkjennes (pending)
 *
 * Consentee-organisasjonene (mottaker / `to`) varierer per template og
 * inkluderer Digdir (991825827). validTo settes langt frem i tid (2099).
 *
 * Kjør: cd playwright && npx tsx tenor/generateConsentRequestsAllTemplates.ts
 */

const PID = '06857897380';
const VALID_TO = '2099-12-31T23:59:59Z';
const REDIRECT_URL = 'https://altinn.no';

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
];

const DIGDIR_ORG = '991825827';

/**
 * Consentee-org-pool (mottaker `to`). Varierer per template og inkluderer Digdir.
 * Orgene er enten kjente tjenesteeier-orgs (Digdir) eller validerte Tenor-orgs som
 * finnes som ekte party i BÅDE tt02 og at23 (fra consentee-orgs-testdataen) – slik
 * unngår vi "Invalid ConsentParty" (400) og 403 for orgs som ikke er provisjonert.
 */
const CONSENTEE_ORG_POOL = [
  DIGDIR_ORG, // 991825827 Digdir
  '210196072',
  '210599932',
  '210841512',
  '210904832',
  '211099402',
  '212954772',
];

/**
 * Valgfritt filter for å kjøre kun bestemte (env:template)-kombinasjoner på nytt,
 * f.eks. ONLY="tt02:bst_krav_v2,at23:default,at23:poa". Tomt = kjør alt.
 */
const ONLY = (process.env.ONLY ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * Valgfri override for å lage forespørsler mot én bestemt ressurs (i stedet for
 * én representant per template), f.eks. RESOURCE="nav_test_samtykke". Kjøres i de
 * miljøene som faktisk har ressursen. Tomt = vanlig per-template-kjøring.
 */
const RESOURCE = (process.env.RESOURCE ?? '').trim();

/** Foretrukne, "rene" representant-ressurser per template (brukes hvis de finnes i miljøet). */
const PREFERRED: Record<string, string[]> = {
  default: ['samtykke-performance-test', 'standard-samtykke-for-dele-data', 'digdir_5618_1010'],
  poa: ['samtykke-fullmakt-utfoere-tjeneste', 'digdir_5616_2', 'acn_5607_5'],
  samtykkemal_simpleconsent: ['enkelt-samtykke'],
  sblanesoknad: ['samtykke-laanesoeknad', 'samtykke-esoknad'],
  bst_krav: ['samtykke-forhaandsgodkjenning', 'samtykke-brukerstyrt-tilgang', 'demo-samtykke-qa'],
  bst_krav_v2: ['ske-samtykke-krav-og-betalinger'],
};

interface ConsentResource {
  identifier: string;
  consentTemplate?: string;
  consentMetadata?: Record<string, unknown>;
  hasCompetentAuthority?: { organization?: string };
}

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

/** Genererer en plausibel metadata-verdi ut fra nøkkelnavnet. */
function metaValue(key: string): string {
  const k = key.toLowerCase();
  if (/(aar|year|inntektsaar|utloepsar)/.test(k)) return '2099';
  if (/(^mon$|month)/.test(k)) return '12';
  if (/(fraogmed|fradato)/.test(k)) return '2025-01-01';
  if (/(tilogmed|tildato|validtodate|sluttdato)/.test(k)) return '2099-12-31';
  if (/rente/.test(k)) return '5';
  if (/bank/.test(k)) return 'Testbanken';
  if (/(navn|name|virksomhet|organization)/.test(k)) return 'Testvirksomhet AS';
  if (/coveredby/.test(k)) return '999999990';
  if (/(link|url)/.test(k)) return 'https://altinn.no';
  if (/tiltak/.test(k)) return 'test-tiltak';
  return 'test';
}

/** Bygger metadata-objektet for en ressurs (kun "rene" alfanumeriske nøkler). */
function buildMetadata(resource: ConsentResource): Record<string, string> {
  const md: Record<string, string> = {};
  for (const key of Object.keys(resource.consentMetadata ?? {})) {
    if (!/^[a-zA-Z0-9_]+$/.test(key)) continue; // hopp over rare nøkler som "{somevalue"
    md[key] = metaValue(key);
  }
  return md;
}

async function fetchConsentResources(apiBase: string): Promise<ConsentResource[]> {
  const res = await fetch(
    `${apiBase}/resourceregistry/api/v1/resource/search?resourceType=Consent`,
    {
      headers: { Accept: 'application/json' },
    },
  );
  if (!res.ok) throw new Error(`Resource registry search feilet: HTTP ${res.status}`);
  return (await res.json()) as ConsentResource[];
}

/** Velger én representant-ressurs per template (foretrukket liste, ellers færrest metadata). */
function pickRepresentatives(resources: ConsentResource[]): Map<string, ConsentResource> {
  const byTemplate = new Map<string, ConsentResource[]>();
  for (const r of resources) {
    const t = r.consentTemplate;
    if (!t) continue;
    if (!byTemplate.has(t)) byTemplate.set(t, []);
    byTemplate.get(t)!.push(r);
  }

  const chosen = new Map<string, ConsentResource>();
  for (const [template, list] of byTemplate) {
    const prefs = PREFERRED[template] ?? [];
    let pick: ConsentResource | undefined;
    for (const id of prefs) {
      pick = list.find((r) => r.identifier === id);
      if (pick) break;
    }
    if (!pick) {
      // færrest (rene) metadata-nøkler -> enklest å fylle ut
      pick = [...list].sort(
        (a, b) =>
          Object.keys(a.consentMetadata ?? {}).length - Object.keys(b.consentMetadata ?? {}).length,
      )[0];
    }
    chosen.set(template, pick);
  }
  return chosen;
}

async function resolvePerson(envCfg: EnvConfig, platformToken: string) {
  const subKey = process.env[envCfg.subKeyEnv];
  if (!subKey) throw new Error(`Mangler ${envCfg.subKeyEnv}`);
  const res = await fetch(
    `${envCfg.apiBase}/register/api/v1/access-management/parties/query?fields=person,party,user`,
    {
      method: 'POST',
      headers: {
        PlatformAccessToken: platformToken,
        'Ocp-Apim-Subscription-Key': subKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [`urn:altinn:person:identifier-no:${PID}`] }),
    },
  );
  const json = (await res.json()) as {
    data?: Array<{ partyUuid?: string; user?: { userId?: number } }>;
  };
  const p = json.data?.[0];
  if (!p?.partyUuid || typeof p.user?.userId !== 'number') {
    throw new Error(`Fant ikke Minst Dress (${PID}) i Register for ${envCfg.name}`);
  }
  return { partyUuid: p.partyUuid, userId: p.user.userId };
}

async function postConsentRequest(
  apiBase: string,
  entToken: string,
  body: unknown,
): Promise<{ ok: boolean; status: number; text: string }> {
  const res = await fetch(`${apiBase}/accessmanagement/api/v1/enterprise/consentrequests`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${entToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { ok: res.status === 201, status: res.status, text: await res.text() };
}

async function approveConsentRequest(apiBase: string, personalToken: string, id: string) {
  const res = await fetch(`${apiBase}/accessmanagement/api/v1/bff/consentrequests/${id}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${personalToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: 'nb' }),
  });
  return { ok: res.status === 200, status: res.status, text: await res.text() };
}

interface ResultRow {
  env: string;
  template: string;
  resource: string;
  consenteeOrg: string;
  intendedState: 'approved' | 'pending';
  consentRequestId: string;
  requestStatus: number;
  approveStatus?: number;
  outcome: string;
}

async function processEnv(envCfg: EnvConfig): Promise<ResultRow[]> {
  lastEnv(envCfg.name);
  const token = new Token();
  const platformToken = await token.getPlatformToken();

  const person = await resolvePerson(envCfg, platformToken);
  console.error(
    `\n=== ${envCfg.name.toUpperCase()} === Minst Dress userId=${person.userId} partyUuid=${person.partyUuid}`,
  );

  const personalToken = await token.getPersonalCleanupAltinnToken({
    PID,
    UserId: String(person.userId),
    PartyUUID: person.partyUuid,
  });

  const resources = await fetchConsentResources(envCfg.apiBase);
  const reps = pickRepresentatives(resources);
  const from = `urn:altinn:person:identifier-no:${PID}`;

  const rows: ResultRow[] = [];

  // Bygg liste over (template, resource)-jobber. Normalt én representant per
  // template; med RESOURCE-override kjører vi kun den oppgitte ressursen.
  let jobs: Array<{ template: string; resource: ConsentResource }>;
  if (RESOURCE) {
    const r = resources.find((x) => x.identifier === RESOURCE);
    if (!r) {
      console.error(`[${envCfg.name}] ressurs "${RESOURCE}" finnes ikke – hopper over miljøet.`);
      return rows;
    }
    jobs = [{ template: r.consentTemplate ?? 'default', resource: r }];
  } else {
    // Stabil sortering -> org-tilordning endres ikke selv om vi filtrerer med ONLY.
    jobs = [...reps.keys()].sort().map((t) => ({ template: t, resource: reps.get(t)! }));
  }

  for (let i = 0; i < jobs.length; i++) {
    const { template, resource } = jobs[i];

    if (!RESOURCE && ONLY.length > 0 && !ONLY.includes(`${envCfg.name}:${template}`)) continue;

    const consenteeOrg = CONSENTEE_ORG_POOL[i % CONSENTEE_ORG_POOL.length];
    const metaData = buildMetadata(resource);

    const entToken = await token.getEnterpriseAltinnToken(
      consenteeOrg,
      'altinn:consentrequests.write',
    );

    const makeBody = (id: string) => ({
      id,
      from,
      to: `urn:altinn:organization:identifier-no:${consenteeOrg}`,
      validTo: VALID_TO,
      consentRights: [
        {
          action: ['consent'],
          resource: [{ type: 'urn:altinn:resource', value: resource.identifier }],
          metaData,
        },
      ],
      redirectUrl: REDIRECT_URL,
    });

    console.error(
      `\n[${envCfg.name}] template=${template} resource=${resource.identifier} to=${consenteeOrg} meta=${JSON.stringify(metaData)}`,
    );

    // 1) Forespørsel som skal GODKJENNES
    const idApprove = randomUUID();
    const reqA = await postConsentRequest(envCfg.apiBase, entToken, makeBody(idApprove));
    const rowA: ResultRow = {
      env: envCfg.name,
      template,
      resource: resource.identifier,
      consenteeOrg,
      intendedState: 'approved',
      consentRequestId: idApprove,
      requestStatus: reqA.status,
      outcome: '',
    };
    if (reqA.ok) {
      const ap = await approveConsentRequest(envCfg.apiBase, personalToken, idApprove);
      rowA.approveStatus = ap.status;
      rowA.outcome = ap.ok
        ? 'APPROVED'
        : `request OK, approve FAILED (${ap.status}): ${ap.text.slice(0, 160)}`;
      console.error(`  approved: request 201, approve ${ap.status} ${ap.ok ? 'OK' : 'FAIL'}`);
    } else {
      rowA.outcome = `request FAILED (${reqA.status}): ${reqA.text.slice(0, 160)}`;
      console.error(`  approved-case request FAILED ${reqA.status}: ${reqA.text.slice(0, 160)}`);
    }
    rows.push(rowA);

    // 2) Forespørsel som ALDRI godkjennes (pending)
    const idPending = randomUUID();
    const reqB = await postConsentRequest(envCfg.apiBase, entToken, makeBody(idPending));
    const rowB: ResultRow = {
      env: envCfg.name,
      template,
      resource: resource.identifier,
      consenteeOrg,
      intendedState: 'pending',
      consentRequestId: idPending,
      requestStatus: reqB.status,
      outcome: reqB.ok
        ? 'PENDING (left unapproved)'
        : `request FAILED (${reqB.status}): ${reqB.text.slice(0, 160)}`,
    };
    console.error(`  pending: request ${reqB.status} ${reqB.ok ? 'OK' : 'FAIL'}`);
    rows.push(rowB);
  }

  return rows;
}

async function main() {
  const all: ResultRow[] = [];
  for (const envCfg of ENVS) {
    const rows = await processEnv(envCfg);
    all.push(...rows);
  }

  // Oppsummering
  console.error('\n\n================ SUMMARY ================');
  for (const env of ENVS.map((e) => e.name)) {
    console.error(`\n--- ${env.toUpperCase()} ---`);
    for (const r of all.filter((x) => x.env === env)) {
      console.error(
        `${r.template.padEnd(26)} ${r.resource.padEnd(34)} to=${r.consenteeOrg} ${r.intendedState.padEnd(8)} -> ${r.outcome}`,
      );
    }
  }

  const outPath = path.join(__dirname, 'consent-requests-result.json');
  fs.writeFileSync(outPath, JSON.stringify(all, null, 2));
  console.error(`\nDetaljer skrevet til ${outPath}`);

  const failures = all.filter(
    (r) => !r.outcome.startsWith('APPROVED') && !r.outcome.startsWith('PENDING'),
  );
  console.error(`\nTotalt: ${all.length} forespørsler, ${failures.length} feilet.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? (e.stack ?? e.message) : e);
  process.exit(1);
});
