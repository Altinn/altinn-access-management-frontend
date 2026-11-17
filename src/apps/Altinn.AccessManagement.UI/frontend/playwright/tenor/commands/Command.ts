/** Én subcommand i `yarn tenor <kommando>`. */
export interface Command {
  /** Navnet brukt på kommandolinjen, f.eks. `personer`. */
  name: string;
  /** Ett-linjes beskrivelse, vist i `yarn tenor --help`. */
  summary: string;
  /** Kjører kommandoen med resten av argv (uten kommandonavnet). */
  run: (argv: string[]) => Promise<void>;
}
