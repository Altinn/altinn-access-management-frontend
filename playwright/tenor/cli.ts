/* eslint-disable no-console */
/**
 * Tenor CLI — hent testdata (personer, virksomheter, facilitatorer) fra
 * Skatteetatens Tenor-tjeneste, og bygg opp Altinn-testdata fra det.
 *
 * Kjøres via yarn-kallet `tenor` i playwright/package.json:
 *
 *   yarn tenor <kommando> [valg]
 *   yarn tenor --help                 # liste over kommandoer
 *   yarn tenor <kommando> --help      # valg til én kommando
 *
 * Se README.md i denne mappen for en oversikt over strukturen og
 * `client/TenorApiRequests.ts` for selve Tenor-integrasjonen.
 */
import { COMMANDS } from './commands';

function printTopLevelHelp(): void {
  const navnBredde = Math.max(...COMMANDS.map((c) => c.name.length)) + 2;
  console.log(
    [
      'Tenor CLI — hent testdata fra Skatteetatens Tenor-tjeneste',
      '',
      'Bruk: yarn tenor <kommando> [valg]',
      '',
      'Kommandoer:',
      ...COMMANDS.map((c) => `  ${c.name.padEnd(navnBredde)}${c.summary}`),
      '',
      'Kjør «yarn tenor <kommando> --help» for valg til en spesifikk kommando.',
    ].join('\n'),
  );
}

async function main(): Promise<void> {
  const [commandName, ...rest] = process.argv.slice(2);

  if (!commandName || commandName === '-h' || commandName === '--help') {
    printTopLevelHelp();
    process.exit(commandName ? 0 : 1);
  }

  const command = COMMANDS.find((c) => c.name === commandName);
  if (!command) {
    console.error(`Ukjent kommando: ${commandName}`);
    printTopLevelHelp();
    process.exit(1);
  }

  await command.run(rest);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
