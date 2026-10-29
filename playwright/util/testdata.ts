import fs from 'fs';
import path from 'path';

import { parse } from 'csv-parse/sync';

import { currentEnv } from './helper';

const TESTDATA_DIR = path.resolve(__dirname, '../e2eTests/testdata');

/** En part i en test: person, virksomhet, eller daglig leder (pid) for en virksomhet. Tomme felt er ''. */
export type Part = { pid: string; orgNo: string; name: string; lastName: string };

export function readCsv(relativePath: string): Record<string, string>[] {
  const content = fs.readFileSync(path.join(TESTDATA_DIR, relativePath), 'utf-8');
  return parse(content, { columns: true, skip_empty_lines: true, trim: true });
}

/**
 * Leser e2eTests/testdata/<område>/<miljø>/<område>.csv med kolonnene
 * scenario,rolle,fnr,orgnr,navn,etternavn og returnerer { [scenario]: { [rolle]: Part } }.
 */
export function loadTestdata(area: string): Record<string, Record<string, Part>> {
  const data: Record<string, Record<string, Part>> = {};
  for (const row of readCsv(`${area}/${currentEnv()}/${area}.csv`)) {
    data[row.scenario] ??= {};
    data[row.scenario][row.rolle] = {
      pid: row.fnr,
      orgNo: row.orgnr,
      name: row.navn,
      lastName: row.etternavn,
    };
  }
  return data;
}
