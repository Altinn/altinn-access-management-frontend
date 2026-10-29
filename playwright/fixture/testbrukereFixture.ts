import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

import { test as base } from '@playwright/test';

import { currentEnv } from 'playwright/util/helper';
import { readCsv, type Organisasjon, type Person } from 'playwright/util/testdata';

/** En hovedenhet og underenheten med samme navn. Daglig leder i hovedenheten representerer begge. */
export type Hovedenhet = Organisasjon & { underenhetOrgNo: string };

/** Gruppene i e2eTests/testdata/<gruppe>/<miljø>.csv, og hva hver rad blir til. */
export type Grupper = { privatperson: Person; dagligLeder: Organisasjon; hovedenhet: Hovedenhet };
export type Gruppe = keyof Grupper;

export type Testbrukere = { reserver: <G extends Gruppe>(gruppe: G) => Grupper[G] };

const lesGruppe: { [G in Gruppe]: (miljo: string) => Grupper[G][] } = {
  // Personer som bare kan representere seg selv.
  privatperson: (miljo) =>
    readCsv(`privatperson/${miljo}.csv`).map((rad) => ({
      pid: rad.fnr,
      name: rad.navn,
      lastName: rad.etternavn,
    })),
  // Daglig leder for en virksomhet uten underenheter, med høyst seks aktører.
  dagligLeder: (miljo) =>
    readCsv(`dagligLeder/${miljo}.csv`).map((rad) => ({
      orgNo: rad.orgnr,
      name: rad.orgnavn,
      pid: rad.fnr,
      managerName: rad.navn,
    })),
  hovedenhet: (miljo) =>
    readCsv(`hovedenhet/${miljo}.csv`).map((rad) => ({
      orgNo: rad.orgnr,
      name: rad.orgnavn,
      pid: rad.fnr,
      managerName: rad.navn,
      underenhetOrgNo: rad.underenhet_orgnr,
    })),
};

/**
 * Hver test reserverer brukerne sine med en låsefil per fødselsnummer. Fila kan bare opprettes
 * én gang, så en bruker går til én test per kjøring, også ved retry. Playwright tømmer
 * output-mappa ved start, så reservasjonene gjelder bare denne kjøringen.
 */
export const testbrukereFixture = base.extend<{ testbrukere: Testbrukere }>({
  testbrukere: async ({}, use, testInfo) => {
    const miljo = currentEnv();
    const katalog = path.join(testInfo.project.outputDir, '.testbrukere', miljo);
    mkdirSync(katalog, { recursive: true });

    const reserver = <G extends Gruppe>(gruppe: G): Grupper[G] => {
      // Stokkes, så testene ikke får de samme brukerne kjøring etter kjøring.
      const brukere = lesGruppe[gruppe](miljo).sort(() => Math.random() - 0.5);
      const ledig = brukere.find((bruker) => {
        try {
          writeFileSync(path.join(katalog, bruker.pid), '', { flag: 'wx' });
          return true;
        } catch {
          return false;
        }
      });
      if (!ledig) {
        throw new Error(`Alle ${brukere.length} i ${gruppe}/${miljo}.csv er brukt i kjøringen.`);
      }
      return ledig;
    };

    await use({ reserver });
  },
});
