/* eslint-disable no-console */

/** Skriver en feilmelding og avslutter prosessen med exit code 1. */
export function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

/** Feiler med en konsistent melding hvis `value` ikke er et positivt heltall. */
export function requirePositiveInt(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 1) {
    fail(`${label} må være et positivt heltall (fikk: ${value}).`);
  }
}

/**
 * Går gjennom argv og kaller `handlers[flagg]` for hvert kjente flagg.
 * Handleren får en `next()` som leser neste argv-verdi og feiler med en
 * konsistent melding hvis den mangler — slik slipper hver subcommand å
 * re-implementere den samme "mangler verdi for --flagg"-logikken.
 *
 * Ukjente argumenter sendes til `onUnknown` (typisk: skriv hjelpetekst og exit 1).
 */
export function parseFlags(
  argv: string[],
  handlers: Record<string, (next: () => string) => void>,
  onUnknown: (arg: string) => void,
): void {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const handler = handlers[arg];
    if (!handler) {
      onUnknown(arg);
      continue;
    }
    handler(() => {
      const value = argv[++i];
      if (value === undefined) fail(`Mangler verdi for ${arg}.`);
      return value;
    });
  }
}

/** Standard "ukjent argument"-håndtering: skriv feil + hjelpetekst, exit 1. */
export function unknownArg(arg: string, printHelp: () => void): void {
  console.error(`Ukjent argument: ${arg}`);
  printHelp();
  process.exit(1);
}
