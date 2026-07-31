import { TenorTestData } from './TenorTestData';
import { StaticTestData } from './StaticTestData';
import { medPinning } from './testdataPinning';
import type { TestDataProvider } from './TestDataProvider';

/**
 * ÉN plass å skru testdata-kilde av/på.
 *
 * - Standard (`USE_TENOR` uangitt eller hva som helst annet): ferske,
 *   tilfeldige data fra Tenor — den nåværende retningen.
 * - `USE_TENOR=false`: hardkodede data fra {@link StaticTestData} (poolene ligger
 *   øverst i den fila, som TS-lister som er lette å finne og endre).
 *
 * Bruk f.eks. `USE_TENOR=false yarn run env:TT02 <path>` for å slå av Tenor
 * for hele suiten uten å endre en eneste test.
 *
 * For å gjøre det LETT å se hvilke data en test brukte, annoteres hvert kall på
 * selve testen (`testdata:TENOR` / `testdata:STATIC` med aktørene) — de vises da
 * rett i Playwright-rapporten/trace-vieweren per test. Ingen konsoll-logg.
 *
 * Samme innpakning tar også OPPTAK av aktørene, slik at en rød kjøring kan
 * reproduseres med `TESTDATA_PIN=...`. Se {@link medPinning}.
 */
export function createTestData(): TestDataProvider {
  const brukTenor = process.env.USE_TENOR !== 'false';
  return medPinning(
    brukTenor ? new TenorTestData() : new StaticTestData(),
    brukTenor ? 'TENOR' : 'STATIC',
  );
}
