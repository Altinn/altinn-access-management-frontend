import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export type CleanupRow = {
  TestTitle: string;
  FromCategory: string;
  ToCategory: string;
};

const FILE = path.join(
  process.cwd(),
  __dirname,
  '../e2eTests/testdata/accesspkgdelegation/cleanup-data.csv',
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
