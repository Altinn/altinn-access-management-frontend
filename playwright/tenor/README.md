# Tenor CLI

Command-line tool for fetching synthetic test data (persons, businesses,
facilitators) from Skatteetaten's [Tenor](https://skatteetaten.github.io/testnorge-dokumentasjon/)
testdata service, and for building Altinn test data from it. Also usable as a
reference for integrating with Tenor from TypeScript/Node.

## Usage

```sh
yarn tenor <command> [options]
yarn tenor --help                 # list all commands
yarn tenor <command> --help       # options for one command
```

## Commands

| Command              | What it does                                                          |
| --------------------- | ---------------------------------------------------------------------- |
| `personer`            | Fetch test persons (default: resident + of legal age)                  |
| `virksomheter`        | Fetch businesses in bulk (default: `AS`)                               |
| `facilitator`         | Fetch one facilitator business (revisor/regnskapsfører/forretningsfører) with its clients |
| `facilitator-orgnr`   | Fetch facilitator org numbers in bulk, optionally with their daglig leder (`--dagl`) |
| `pakkeholdere`        | Build a business where many users share access packages ([altinn-auth#829](https://github.com/Altinn/altinn-auth/issues/829)) |
| `be-om-tilgang`       | Export `AS` businesses + daglig leder to a JSON file for `altinn-platform-validation-tests` |

Every command supports `--env <tt02\|at22\|at23>` (default `tt02`) and most
support `--json` for machine-readable output. Run any command with `--help`
for its full option list.

## Structure

```text
tenor/
  cli.ts                 # entrypoint: dispatches to a command by name
  commands/
    Command.ts            # shared Command interface
    index.ts               # registry of all commands
    personer.ts, virksomheter.ts, facilitator.ts,
    facilitatorOrgnr.ts, pakkeholdere.ts, beOmTilgang.ts
  client/
    TenorApiRequests.ts    # the actual Tenor integration (auth, search, pagination)
  lib/
    cliArgs.ts              # shared flag-parsing helpers
    format.ts                # shared text-formatting helpers
```

Adding a new command means adding one file under `commands/` that exports a
`Command` (`name`, `summary`, `run`) and registering it in `commands/index.ts`.
It should not need to touch `cli.ts` or any other command.

## Integrating with Tenor

`client/TenorApiRequests.ts` is the reference implementation for talking to
Tenor and is a reasonable starting point if you need to integrate with Tenor
from another project. The key points:

- **Auth**: Maskinporten, scope `skatteetaten:testnorge/testdata.read`. See
  `MaskinportenToken` (`playwright/api-requests/MaskinportenToken.ts`) — the
  token is fetched once per `TenorApiRequests` instance and reused.
- **Search**: `GET /api/testnorge/v2/soek/<kilde>?kql=<KQL>&antall=<n>`, where
  `<kilde>` is `freg` (Folkeregister, persons) or `brreg-er-fr`
  (Enhets-/Foretaksregister, businesses). Queries use
  [Kibana Query Language](https://www.elastic.co/guide/en/kibana/current/kuery-query.html) (KQL).
- **200-per-call cap**: Tenor caps a single search at 200 documents
  (`TENOR_MAX_PER_PAGE`) and deep pagination is capped too (`nesteSide`
  becomes `null` once `offset + antall >= 200`). To fetch more than 200 unique
  documents, `hentDokumenterPaginert` issues several batches with a different
  `seed` each time — each seed shuffles the result set, so the first 200 hits
  per seed are effectively disjoint across seeds — and dedupes on
  `tenorMetadata.id` (fødselsnummer for `freg`, orgnr for `brreg-er-fr`).
- **Facilitator lookups** (revisor/regnskapsfører/forretningsfører): Tenor has
  no "is a facilitator" flag on the business itself, so facilitators are
  discovered by scanning their clients (`<felt>:*`, e.g.
  `revisorerOrgnr:*`) and reading the facilitator's orgnr back out of the
  client's `rollegrupper` (role code `REVI`/`REGN`/`FFØR`).
