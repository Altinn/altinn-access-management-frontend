import fs from 'fs';
import path from 'path';

import { Language } from 'playwright/pages/LanguageMenu';
import { currentEnv } from 'playwright/util/helper';

// Testdata ligger i e2eTests/testdata/samtykke/<miljø>/, med én rad per test.
// AT23 og TT02 deler ID-porten-miljø, og språket lagres på personens profil,
// så ingen person deles mellom miljøer, tester eller språk.
const TESTDATA_DIR = path.resolve(__dirname, '../../../testdata/samtykke');

const LANGUAGE_DIR: Record<Language, string> = {
  [Language.NB]: 'bokmal',
  [Language.NN]: 'nynorsk',
  [Language.EN]: 'engelsk',
};

/** [orgnr, fnr til daglig leder som kan godkjenne samtykke på vegne av org-en] */
export type OrgWithApprover = [orgNo: string, pid: string];

function readCsv(relativePath: string): Record<string, string>[] {
  const file = path.join(TESTDATA_DIR, relativePath);
  if (!fs.existsSync(file)) {
    throw new Error(`Fant ikke samtykke-testdata: ${file}`);
  }
  const [header, ...lines] = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
  const columns = header.split(',');
  return lines.map((line) => {
    const values = line.split(',');
    return Object.fromEntries(columns.map((column, i) => [column, values[i]]));
  });
}

function rowForTest(relativePath: string, test: string): Record<string, string> {
  const row = readCsv(relativePath).find((r) => r.test === test);
  if (!row) {
    throw new Error(`Mangler rad for testen '${test}' i ${relativePath}`);
  }
  return row;
}

/** Person som gir samtykke i consent.spec.ts */
export function consentPerson(language: Language, test: string): string {
  return rowForTest(`${currentEnv()}/personer/${LANGUAGE_DIR[language]}/personer.csv`, test).fnr;
}

/** Org og daglig leder som gir samtykke i consentOrgToOrg.spec.ts */
export function consentOrg(language: Language, test: string): OrgWithApprover {
  const row = rowForTest(
    `${currentEnv()}/organisasjoner/${LANGUAGE_DIR[language]}/organisasjoner.csv`,
    test,
  );
  return [row.orgnr, row.fnr];
}

/** Person som gir samtykke i consentMaskinporten.spec.ts */
export function maskinportenPerson(test: string): string {
  return rowForTest(`${currentEnv()}/maskinporten/personer.csv`, test).fnr;
}

/** Org og daglig leder som gir samtykke i consentMaskinporten.spec.ts */
export function maskinportenOrg(test: string): OrgWithApprover {
  const row = rowForTest(`${currentEnv()}/maskinporten/organisasjoner.csv`, test);
  return [row.orgnr, row.fnr];
}

// Mottaker-org-er logger aldri inn, så de kan deles mellom miljøer og specer.
export const toOrgs: string[] = readCsv('mottakere.csv').map((r) => r.orgnr);
