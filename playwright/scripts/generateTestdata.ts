/**
 * Generer testdata for tilgangsstyring-tester ved hjelp av Tenor API.
 *
 * Henter 100 dagligLeder+org-par fra Tenor og skriver resultatet til
 * tenor-testdata.json. Testene roterer gjennom poolen i bolker på 20
 * for å unngå gjenbruk av samme testdata i back-to-back-kjøringer.
 *
 * Bruk (fra playwright/-workspace):
 *   yarn tenor:generate
 *
 * Krever MASKINPORTEN_CLIENT_ID og MASKINPORTEN_JWK i playwright/config/.env.tt02
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });
dotenv.config({ path: path.resolve(__dirname, '../config/.env.tt02'), override: true });

import { TenorApiClient } from '../api-requests/TenorApiClient';

const COUNT = 100;
const OUTPUT_PATH = path.resolve(
  __dirname,
  '../e2eTests/testdata/tilgangsstyring/tenor-testdata.json',
);

async function main() {
  console.log(`Henter ${COUNT} dagligledere fra Tenor...\n`);

  const client = new TenorApiClient();
  const data = await client.collectDagligLedere(COUNT);

  if (data.length < COUNT) {
    console.warn(`\nAdvarsel: Fant kun ${data.length}/${COUNT} dagligledere.`);
  }

  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));
  console.log(`\nSkreiv ${data.length} oppføringer til ${OUTPUT_PATH}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
