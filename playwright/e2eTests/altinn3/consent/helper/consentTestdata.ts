import { readCsv } from 'playwright/util/testdata';

// Mottaker-org-er logger aldri inn, så de kan deles mellom miljøer og specer.
export const toOrgs: string[] = readCsv('samtykke/mottakere.csv').map((r) => r.orgnr);
