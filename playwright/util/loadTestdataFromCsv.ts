import fs from 'fs';
import path from 'path';

import { parse } from 'csv-parse/sync';

export interface CustomerData {
  label: string;
  confirmation: string;
  orgnummer: string;
}

export function loadCustomersFromCsv(relativeToRootPath: string): CustomerData[] {
  const fullPath = path.join(process.cwd(), relativeToRootPath);
  const fileContent = fs.readFileSync(fullPath, 'utf-8');

  return parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CustomerData[];
}
