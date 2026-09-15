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

## Optional Altinn IDs from Register

Run from `playwright/` in this repository (install dependencies with `yarn install`
from the repository root first):

```sh
yarn tenor personer -n 100 --env at22 --register
yarn tenor virksomheter -n 100 --env at23 --register
yarn tenor facilitator-orgnr --rolle revisor -n 100 --dagl --env tt02 --register
```

`--register` is opt-in on these three commands and implies JSON output. Without
it, output and Tenor-only behavior remain unchanged and no Register credentials
are needed. `--env` alone selects configuration; it does not enrich Tenor results.

Each output row keeps its Tenor fields and adds `altinnEnvironment` and `altinn`
(the Register party, including `partyUuid`, `partyId` and available `user` fields).
For facilitator org numbers, rows become objects with `organisasjonsnummer`.
With `--dagl`, `dagligLederAltinn` contains the leader's Register party as well.
Identifiers are deduplicated and queried in batches of at most **100**, requesting
`party,person,organization,user`. Results are matched by identifier, not response
order. Missing parties remain in the output with `altinn: null` and a count is
reported to stderr. HTTP errors or malformed responses fail the command.
Consumers requiring a user ID must also check `altinn.user.userId`; a party need
not have a user. IDs must be regenerated separately for AT22, AT23 and TT02.

The existing `playwright/config/.env*` loader supplies Tenor/Maskinporten settings.
Enrichment additionally uses `API_BASE_URL`, `ENV_NAME`, `USERNAME_TEST_API`,
`PASSWORD_TEST_API`, and `<ENV>_REGISTER_SUBSCRIPTION_KEY` (e.g.
`AT23_REGISTER_SUBSCRIPTION_KEY`). Keep these in local environment configuration;
`API_BASE_URL` and `ENV_NAME` must correspond to the requested `--env`.
Register uses a platform access token from the existing test token generator.

Run the isolated, mocked Register checks from the repository root:

```sh
yarn vitest run --config playwright/tenor/vitest.config.mts
```
