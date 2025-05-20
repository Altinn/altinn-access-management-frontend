// utils/loadFacilitators.ts
import fs from 'fs';
import path from 'path';

import { parse } from 'csv-parse/sync';

export interface Facilitator {
  pid: string;
  org: string;
}

export interface CustomerData {
  label: string;
  confirmation: string;
  orgnummer: string;
}

export enum FacilitatorRole {
  Revisor = 'revisor',
  Forretningsfoerer = 'Forretningsfoerer',
  Regnskapsfoerer = 'regnskapsfoerer',
}

function resolveCsvPath(role: FacilitatorRole, filename: string): string {
  return path.join(process.cwd(), `e2eTests/testdata/${role}/${filename}`);
}

export function loadFacilitator(role: FacilitatorRole, pickRandom = false): Facilitator {
  const filePath = resolveCsvPath(role, 'facilitator.csv');

  if (!fs.existsSync(filePath)) {
    throw new Error(`Facilitator file not found: ${filePath}`);
  }

  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    throw new Error(`Unable to read facilitator file: ${filePath} - ${(err as Error).message}`);
  }

  let records: Facilitator[];
  try {
    records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Facilitator[];
  } catch (err) {
    throw new Error(`Error parsing facilitator CSV for ${role}: ${(err as Error).message}`);
  }

  if (!Array.isArray(records) || records.length === 0) {
    throw new Error(`No facilitator data found for role: ${role}`);
  }

  const invalidRow = records.find((r) => !r.pid || !r.org);
  if (invalidRow) {
    throw new Error(`Invalid facilitator row in ${role}/facilitator.csv (missing pid/org)`);
  }

  return pickRandom ? records[Math.floor(Math.random() * records.length)] : records[0];
}

export function loadCustomers(role: FacilitatorRole): CustomerData[] {
  const filePath = resolveCsvPath(role, 'customers.csv');

  if (!fs.existsSync(filePath)) {
    throw new Error(`Customer file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CustomerData[];

  if (!Array.isArray(records) || records.length === 0) {
    throw new Error(`No customer data found in ${role}/customers.csv`);
  }

  return records;
}

export function loadAllFacilitators(): Record<FacilitatorRole, Facilitator> {
  return {
    [FacilitatorRole.Revisor]: loadFacilitator(FacilitatorRole.Revisor),
    [FacilitatorRole.Forretningsfoerer]: loadFacilitator(FacilitatorRole.Forretningsfoerer),
    [FacilitatorRole.Regnskapsfoerer]: loadFacilitator(FacilitatorRole.Regnskapsfoerer),
  };
}
