import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

import { test as base } from '@playwright/test';

import { currentEnv } from 'playwright/util/helper';
import { readCsv, type Organisasjon, type Person } from 'playwright/util/testdata';

/** Testbrukergruppene i e2eTests/testdata/<gruppe>/<miljø>.csv, og hva hver rad blir til. */
export type Grupper = { privatperson: Person; dagligLeder: Organisasjon };
export type Gruppe = keyof Grupper;

const lesGruppe: { [G in Gruppe]: (miljo: string) => Grupper[G][] } = {
  // Personer som bare kan representere seg selv.
  privatperson: (miljo) =>
    readCsv(`privatperson/${miljo}.csv`).map((rad) => ({
      pid: rad.fnr,
      name: rad.navn,
      lastName: rad.etternavn,
    })),
  // Daglig leder for en virksomhet uten underenheter, med høyst seks aktører totalt.
  dagligLeder: (miljo) =>
    readCsv(`dagligLeder/${miljo}.csv`).map((rad) => ({
      orgNo: rad.orgnr,
      name: rad.orgnavn,
      pid: rad.fnr,
      managerName: rad.navn,
    })),
};

// Første ledige bruker i lista reserveres med en fil som bare kan opprettes én gang, så to tester
// som kjører samtidig aldri får samme bruker. Reservasjonen blir stående resten av kjøringen,
// så ingen bruker brukes to ganger, heller ikke av en retry.
function reserverTestbruker<T extends { pid: string }>(
  brukere: T[],
  katalog: string,
  testId: string,
  allerede: Set<string>,
): T | undefined {
  mkdirSync(katalog, { recursive: true });

  for (const bruker of brukere.filter((b) => !allerede.has(b.pid))) {
    try {
      writeFileSync(path.join(katalog, bruker.pid), testId, { flag: 'wx' });
      return bruker;
    } catch {
      // Reservert av en annen test.
    }
  }

  return undefined;
}

/**
 * Reserverer testbrukere for én test. Reservasjonene gjelder på tvers av grupper, siden
 * de er per fødselsnummer, og frigis ikke før neste kjøring.
 */
export class Testbrukere {
  private readonly reservert = new Set<string>();

  constructor(
    private readonly miljo: string,
    private readonly katalog: string,
    private readonly testId: string,
  ) {}

  // Brukerne stokkes, så testene ikke bruker de samme brukerne kjøring etter kjøring.
  reserver<G extends Gruppe>(gruppe: G): Grupper[G] {
    const brukere = lesGruppe[gruppe](this.miljo).sort(() => Math.random() - 0.5);
    const bruker = reserverTestbruker(brukere, this.katalog, this.testId, this.reservert);
    if (!bruker) {
      throw new Error(
        `Fant ingen ledig testbruker i ${gruppe}/${this.miljo}.csv; ` +
          `alle ${brukere.length} er brukt i denne kjøringen.`,
      );
    }
    this.reservert.add(bruker.pid);
    return bruker;
  }
}

// Playwright tømmer output-mappa ved start, så reservasjonene gjelder én kjøring.
export const testbrukereFixture = base.extend<{ testbrukere: Testbrukere }>({
  testbrukere: async ({}, use, testInfo) => {
    const miljo = currentEnv();
    const katalog = path.join(testInfo.project.outputDir, '.testbrukere', miljo);
    await use(new Testbrukere(miljo, katalog, testInfo.testId));
  },
});
