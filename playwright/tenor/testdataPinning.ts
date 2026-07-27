import { test } from '@playwright/test';
import type { TestInfo } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import path from 'path';

import type { TestDataProvider } from './TestDataProvider';

export type TestdataKilde = 'TENOR' | 'STATIC';

/**
 * Record/replay av testdata, slik at en rød kjøring kan reproduseres.
 *
 * Tenor gir ferske, TILFELDIGE aktører per kjøring (det er poenget — se
 * `README.md`), men det gjør at en feilende test ikke nødvendigvis feiler igjen.
 * Denne modulen tar opp hvilke aktører hver test faktisk fikk, og kan spille dem
 * tilbake:
 *
 * ```sh
 * # 1) Vanlig kjøring — opptak skjer ALLTID, uten at du ber om det.
 * yarn run env:TT02 e2eTests/altinn3/tilgangsstyring/tilgangspakkedelegering.spec.ts
 *
 * # 2) Kjør på nytt med EKSAKT samme aktører som forrige kjøring.
 * TESTDATA_PIN=testdata-pins yarn run env:TT02 e2eTests/.../tilgangspakkedelegering.spec.ts
 * ```
 *
 * Opptak er alltid på fordi det ikke går an å skru det på i etterkant — når CI
 * er rød har den tilfeldige aktøren allerede gjort jobben sin. Pin-fila legges
 * både på disk (for lokal gjenkjøring) og som vedlegg på testen (attachment),
 * fordi CI kun laster opp `playwright-report/` — vedlegget er derfor den eneste
 * veien pinnene overlever en CI-kjøring.
 *
 * Ingen tester eller providere kjenner til dette: alt henger på Proxy-en rundt
 * {@link TestDataProvider}, samme sted som annoteringene.
 */

/** Standard katalog for pin-filer, relativt til `playwright/` (der scriptene kjøres fra). */
const STANDARD_PIN_DIR = 'testdata-pins';

/** Innholdet i én pin-fil — én fil per test. */
interface PinFil {
  /** Lesbar test-identitet (`titlePath`), kun til hjelp for mennesker. */
  test: string;
  /** Kilden dataene ble tatt opp fra. */
  kilde: TestdataKilde;
  /** Når opptaket ble gjort (ISO). */
  opprettet: string;
  /** `metodenavn#ordinal` → returverdien fra det kallet. */
  kall: Record<string, unknown>;
}

/** Det pågående opptaket for én provider-instans (= én test, fixture er per test). */
interface Opptak {
  kilde: TestdataKilde;
  kall: Record<string, unknown>;
}

/**
 * Opptak per provider-instans. WeakMap fordi nøkkelen er selve Proxy-objektet
 * fixture-en ga til testen — {@link lagreTestdataPins} finner opptaket igjen
 * derfra uten at provideren må eksponere noe.
 */
const opptakPerProvider = new WeakMap<object, Opptak>();

/**
 * Pakker en provider i record/replay + annotering.
 *
 * Ordinalen (`metode#n`) tildeles SYNKRONT når metoden kalles — før første
 * `await` — så rekkefølgen er deterministisk også når en `beforeEach` kaller
 * flere metoder i samme `Promise.all([...])` (array-elementene evalueres
 * venstre→høyre).
 *
 * Argumentene er bevisst IKKE del av nøkkelen: `ekskluder` inneholder orgnr som
 * stammer fra tidligere, tilfeldige kall, så en args-basert nøkkel ville aldri
 * matchet ved replay. Det er trygt, siden de lagrede verdiene allerede oppfylte
 * det argumentene uttrykte da opptaket ble gjort.
 */
export function medPinning(provider: TestDataProvider, kilde: TestdataKilde): TestDataProvider {
  const ordinaler = new Map<string, number>();
  const opptak: Opptak = { kilde, kall: {} };
  // `undefined` = ikke forsøkt lest ennå, `null` = ingen pin-fil å bruke.
  let pins: PinFil | null | undefined;

  const proxy = new Proxy(provider, {
    get(target, prop, receiver) {
      const verdi = Reflect.get(target, prop, receiver);
      if (typeof verdi !== 'function') return verdi;
      const metode = String(prop);

      return async (...args: unknown[]) => {
        const n = ordinaler.get(metode) ?? 0;
        ordinaler.set(metode, n + 1);
        const noekkel = `${metode}#${n}`;

        const testInfo = testInfoEllerNull();
        if (pins === undefined) pins = lesPins(testInfo);

        const pinnet = pins?.kall?.[noekkel];
        let resultat: unknown;

        if (pinnet !== undefined) {
          // Klon, så en test som muterer resultatet ikke forurenser pin-dataene.
          resultat = klon(pinnet);
          annoter(testInfo, 'testdata:PIN', `${noekkel} → ${kort(resultat)}`);
        } else {
          resultat = await verdi.apply(target, args);
          const argTekst = args.length ? kort(args.length === 1 ? args[0] : args) : '';
          annoter(testInfo, `testdata:${kilde}`, `${metode}(${argTekst}) → ${kort(resultat)}`);
          if (pins) {
            // Pin-fil i bruk, men denne nøkkelen manglet — verdt å si tydelig fra,
            // ellers ser kjøringen «pinnet» ut mens den i praksis er tilfeldig.
            annoter(testInfo, 'testdata:PIN-MANGLER', `${noekkel} ble hentet live fra ${kilde}`);
          }
        }

        opptak.kall[noekkel] = resultat;
        // Skriv fortløpende, ikke bare i teardown: en hard timeout/krasj skal
        // fortsatt etterlate aktørene testen rakk å hente.
        skrivPins(testInfo, opptak);
        return resultat;
      };
    },
  });

  opptakPerProvider.set(proxy, opptak);
  return proxy;
}

/**
 * Legger pin-fila ved testen som attachment. Kalles fra `testData`-fixturens
 * teardown, så den kjører én gang per test (også når testen feilet).
 *
 * Vedlegget er det som gjør CI-kjøringer reproduserbare: CI laster kun opp
 * `playwright-report/`, og html-rapporten kopierer vedlegg inn dit.
 */
export async function lagreTestdataPins(provider: TestDataProvider): Promise<void> {
  const opptak = opptakPerProvider.get(provider as object);
  if (!opptak || Object.keys(opptak.kall).length === 0) return;

  const testInfo = testInfoEllerNull();
  if (!testInfo) return;

  await testInfo
    .attach('testdata-pins.json', {
      body: JSON.stringify(byggPinFil(testInfo, opptak), null, 2),
      contentType: 'application/json',
    })
    .catch(() => {
      // Vedlegg er en bonus — skal aldri velte en test.
    });
}

function byggPinFil(testInfo: TestInfo, opptak: Opptak): PinFil {
  return {
    test: testInfo.titlePath.join(' > '),
    kilde: opptak.kilde,
    opprettet: new Date().toISOString(),
    kall: opptak.kall,
  };
}

/** Katalogen pin-filer skrives til. Overstyres med `TESTDATA_PIN_DIR`. */
function pinDir(): string {
  return path.resolve(process.env.TESTDATA_PIN_DIR ?? STANDARD_PIN_DIR);
}

/**
 * Filnavn for opptaket. Forsøk 0 eier `<testId>.json`; retries skrives til egne
 * filer så de ikke overskriver den FØRSTE (og mest interessante) kjøringen —
 * med `retries: 1` er det forsøk 0 som feilet og som du vil reprodusere.
 */
function opptaksfil(testInfo: TestInfo): string {
  const suffiks = testInfo.retry === 0 ? '' : `.retry${testInfo.retry}`;
  return path.join(pinDir(), `${testInfo.testId}${suffiks}.json`);
}

function skrivPins(testInfo: TestInfo | null, opptak: Opptak): void {
  if (!testInfo) return; // utenfor Playwright (f.eks. tsx-script)
  try {
    const fil = opptaksfil(testInfo);
    mkdirSync(path.dirname(fil), { recursive: true });
    writeFileSync(fil, JSON.stringify(byggPinFil(testInfo, opptak), null, 2));
  } catch {
    // Opptak skal aldri velte en test.
  }
}

/**
 * Leser pin-fila for denne testen, hvis `TESTDATA_PIN` er satt. Verdien kan være
 * en KATALOG (vanlig: `TESTDATA_PIN=testdata-pins`, slår opp `<testId>.json`)
 * eller en ENKELT FIL — det siste er praktisk når du har lastet ned ett vedlegg
 * fra en CI-rapport og kjører den ene testen på nytt.
 *
 * Alle forsøk av samme test leser samme fil, altså kjører retry med SAMME data.
 * Det er med vilje: da skiller en retry mellom «flaky test» og «dårlig aktør».
 */
function lesPins(testInfo: TestInfo | null): PinFil | null {
  const sti = process.env.TESTDATA_PIN;
  if (!sti || !testInfo) return null;

  try {
    const absolutt = path.resolve(sti);
    if (!existsSync(absolutt)) return null;
    const fil = statSync(absolutt).isDirectory()
      ? path.join(absolutt, `${testInfo.testId}.json`)
      : absolutt;
    if (!existsSync(fil)) return null;
    const pin = JSON.parse(readFileSync(fil, 'utf-8')) as PinFil;
    return pin?.kall ? pin : null;
  } catch {
    return null; // ugyldig/uleselig pin-fil → kjør med ferske data
  }
}

/** `test.info()` kaster utenfor en Playwright-test (f.eks. i tsx-scriptene). */
function testInfoEllerNull(): TestInfo | null {
  try {
    return test.info();
  } catch {
    return null;
  }
}

function annoter(testInfo: TestInfo | null, type: string, description: string): void {
  testInfo?.annotations.push({ type, description });
}

/** Dataene er ren JSON, så dette er en trygg (og Node-versjonsuavhengig) dypkopi. */
function klon<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

/** Kompakt, lesbar oppsummering av testdata (orgnr/pid/navn) for rapporten. */
function kort(x: unknown): string {
  try {
    return JSON.stringify(x) ?? String(x);
  } catch {
    return String(x);
  }
}
