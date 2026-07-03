import { test } from '@playwright/test';
import { TenorTestData } from './TenorTestData';
import { StaticTestData } from './StaticTestData';
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
 */
export function createTestData(): TestDataProvider {
  const brukTenor = process.env.USE_TENOR !== 'false';
  const kilde = brukTenor ? 'TENOR' : 'STATIC';
  return medAnnotering(brukTenor ? new TenorTestData() : new StaticTestData(), kilde);
}

/**
 * Pakker en provider slik at hvert metodekall annoteres på testen med kilde +
 * returnerte aktører. Gjelder både Tenor og statisk, så rapporten ser lik ut
 * uansett kilde.
 */
function medAnnotering(provider: TestDataProvider, kilde: 'TENOR' | 'STATIC'): TestDataProvider {
  return new Proxy(provider, {
    get(target, prop, receiver) {
      const verdi = Reflect.get(target, prop, receiver);
      if (typeof verdi !== 'function') return verdi;
      return async (...args: unknown[]) => {
        const resultat = await verdi.apply(target, args);
        const argTekst = args.length ? kort(args.length === 1 ? args[0] : args) : '';
        // testInfo finnes bare under Playwright (ikke i tsx-script) → guard.
        try {
          test.info().annotations.push({
            type: `testdata:${kilde}`,
            description: `${String(prop)}(${argTekst}) → ${kort(resultat)}`,
          });
        } catch {
          // utenfor Playwright-kontekst
        }
        return resultat;
      };
    },
  });
}

/** Kompakt, lesbar oppsummering av testdata (orgnr/pid/navn) for logging. */
function kort(x: unknown): string {
  try {
    return JSON.stringify(x);
  } catch {
    return String(x);
  }
}
