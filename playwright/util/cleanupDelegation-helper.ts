import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export type CleanupRow = {
  TestTitle: string;
  FromCategory: string;
  ToCategory: string;
};

const TEST_ENV = (process.env.environment ?? 'at23').toLowerCase();
const FILE = path.resolve(
  __dirname,
  `../e2eTests/testdata/accesspkgdelegation/${TEST_ENV}/cleanup-data.csv`,
);

export async function getCleanupRows(): Promise<CleanupRow[]> {
  return new Promise((resolve, reject) => {
    const rows: CleanupRow[] = [];
    fs.createReadStream(FILE)
      .pipe(csv())
      .on('data', (r) => rows.push(r))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}
