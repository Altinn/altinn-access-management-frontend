import fs from 'fs';
import path, { dirname } from 'path';
import csv from 'csv-parser';

export type TestPerson = {
  Category: string;
  PartyUUID?: string;
  PartyId?: string;
  UserId?: string;
  PID?: string;
};
const TEST_ENV = (process.env.environment ?? 'at23').toLowerCase();
const TEST_PERSON_CSV = path.resolve(
  __dirname,
  `../e2eTests/testdata/accesspkgdelegation/${TEST_ENV}/test-person.csv`,
);

export async function getTestPersonForCategory(category: string): Promise<TestPerson> {
  return new Promise((resolve, reject) => {
    const rows: TestPerson[] = [];

    fs.createReadStream(TEST_PERSON_CSV)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => {
        const match = rows.find(
          (r) => (r.Category ?? '').trim().toLowerCase() === category.trim().toLowerCase(),
        );
        if (!match) {
          reject(new Error(`Category not found: ${category}`));
        } else {
          resolve(match);
        }
      })
      .on('error', reject);
  });
}
