import { command as beOmTilgang } from './beOmTilgang';
import type { Command } from './Command';
import { command as facilitator } from './facilitator';
import { command as facilitatorOrgnr } from './facilitatorOrgnr';
import { command as pakkeholdere } from './pakkeholdere';
import { command as personer } from './personer';
import { command as virksomheter } from './virksomheter';

/** Alle subcommands til `yarn tenor <kommando>`, i den rekkefølgen de vises i --help. */
export const COMMANDS: Command[] = [
  personer,
  virksomheter,
  facilitator,
  facilitatorOrgnr,
  pakkeholdere,
  beOmTilgang,
];
