import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { getTestPersonForCategory } from './testDelegationdatautil';

export type CleanupRow = {
  TestTitle: string;
  FromCategory: string;
  ToCategory: string;
};
export type CleanupResolved = {
  fromOrg: any; // ORG object (Org-A/Org-C) used in URL params
  toOrg: any; // ORG object (Org-B/Org-D) used in URL params
  authPerson: any; // Daglig leder used only for token
};

const TEST_ENV = (process.env.environment ?? 'at23').toLowerCase();
const CLEANUP_CSV = path.resolve(
  __dirname,
  `../e2eTests/testdata/accesspkgdelegation/${TEST_ENV}/cleanup-data.csv`,
);

function normalizeOrgCategory(category: string): string {
  return (category ?? '')
    .trim()
    .replace(/^dagligerleder-/i, '')
    .replace(/^dagligleder-/i, '')
    .trim();
}

export async function getCleanupDataForTest(
  testTitle: string,
): Promise<{ fromOrg: any; toOrg: any; authPerson: any }[]> {
  if (!fs.existsSync(CLEANUP_CSV)) {
    throw new Error(`cleanup-data.csv not found at: ${CLEANUP_CSV}`);
  }

  const rows: CleanupRow[] = await new Promise((resolve, reject) => {
    const result: CleanupRow[] = [];
    fs.createReadStream(CLEANUP_CSV)
      .pipe(csv())
      .on('data', (row) => result.push(row))
      .on('end', () => resolve(result))
      .on('error', reject);
  });

  const normalizeTitle = (s: string) =>
    (s ?? '').trim().toLowerCase().replace(/\s+/g, ' ').replace('pacakge', 'package');

  const wanted = normalizeTitle(testTitle);
  const matches = rows.filter((r) => normalizeTitle(r.TestTitle) === wanted);

  if (!matches.length) return [];

  const resolved: CleanupResolved[] = [];

  for (const row of matches) {
    const fromOrgCategory = normalizeOrgCategory(row.FromCategory);

    // ORG objects for URL params
    const fromOrg = await getTestPersonForCategory(fromOrgCategory); // Org-A / Org-C
    const toOrg = await getTestPersonForCategory(row.ToCategory); // Org-B / Org-D

    if (!fromOrg?.PartyUUID) {
      throw new Error(`Missing PartyUUID for org category "${fromOrgCategory}" in test-person.csv`);
    }
    if (!toOrg?.PartyUUID) {
      throw new Error(`Missing PartyUUID for org category "${row.ToCategory}" in test-person.csv`);
    }

    // PERSON object for token (Daglig leder of FROM org)
    let authPerson: any | undefined;

    try {
      authPerson = await getTestPersonForCategory(`Dagligerleder-${fromOrgCategory}`);
    } catch {}

    if (!authPerson) {
      try {
        authPerson = await getTestPersonForCategory(`Dagligleder-${fromOrgCategory}`);
      } catch {}
    }

    if (!authPerson || (!authPerson.PID && !authPerson.UserId)) {
      throw new Error(
        `No auth person (PID/UserId) found for FromCategory="${fromOrgCategory}". ` +
          `Add "Dagligleder-${fromOrgCategory}" or "Dagligerleder-${fromOrgCategory}" to test-person.csv`,
      );
    }

    resolved.push({ fromOrg, toOrg, authPerson });
  }

  return resolved;
}
