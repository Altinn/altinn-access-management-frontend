import fs from 'fs';
import path from 'path';

import { parse } from 'csv-parse/sync';

import { currentEnv } from './helper';

const TESTDATA_DIR = path.resolve(__dirname, '../e2eTests/testdata');

export type Person = { pid: string; name: string; lastName: string };
/** `pid` og `managerName` er daglig leder (eller en annen person som representerer virksomheten). */
export type Organisasjon = { orgNo: string; name: string; pid: string; managerName: string };
export type Scenario = { personer: Person[]; organisasjoner: Organisasjon[] };

export function readCsv(relativePath: string): Record<string, string>[] {
  const content = fs.readFileSync(path.join(TESTDATA_DIR, relativePath), 'utf-8');
  return parse(content, { columns: true, skip_empty_lines: true, trim: true });
}

/**
 * Alle fødselsnumre i testdataene for ett miljø: poolene (<gruppe>/<miljø>.csv) og
 * scenarioene (<område>/<miljø>/<scenario>/*.csv), i filrekkefølge.
 */
export function testdataFnr(miljo: string): string[][] {
  const filer = fs
    .readdirSync(TESTDATA_DIR, { recursive: true, encoding: 'utf-8' })
    .filter((f) => f.endsWith('.csv'))
    .filter((f) => f.split(path.sep).includes(miljo) || path.basename(f) === `${miljo}.csv`);
  return filer.map((f) =>
    readCsv(f)
      .map((rad) => rad.fnr)
      .filter(Boolean),
  );
}

function readCsvIfExists(relativePath: string): Record<string, string>[] {
  return fs.existsSync(path.join(TESTDATA_DIR, relativePath)) ? readCsv(relativePath) : [];
}

/**
 * Leser e2eTests/testdata/<område>/<miljø>/<scenario>/{personer,organisasjoner}.csv
 * og returnerer { [scenario]: { personer, organisasjoner } }, med radene i filrekkefølge.
 */
export function loadTestdata(area: string): Record<string, Scenario> {
  const dir = `${area}/${currentEnv()}`;
  const scenarios = fs
    .readdirSync(path.join(TESTDATA_DIR, dir), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  return Object.fromEntries(
    scenarios.map((scenario) => [
      scenario,
      {
        personer: readCsvIfExists(`${dir}/${scenario}/personer.csv`).map((row) => ({
          pid: row.fnr,
          name: row.navn ?? '',
          lastName: row.etternavn ?? '',
        })),
        organisasjoner: readCsvIfExists(`${dir}/${scenario}/organisasjoner.csv`).map((row) => ({
          orgNo: row.orgnr,
          name: row.navn ?? '',
          pid: row.fnr ?? '',
          managerName: '',
        })),
      },
    ]),
  );
}
