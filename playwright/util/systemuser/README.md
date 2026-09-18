# Systembruker-testdata og opprydding

Systembruker-testene bruker `systemUserCleanup`-fixturen. Registrer systemet med
`track(owner, vendorOrgNo, feature, kind)` **før** API-kallet som oppretter det.
Bruk navnet/ID-en fra `track` i opprettelsen.

Når testen er ferdig, også ved feil i oppsettet eller testen:

1. Hent systembrukere for testens virksomhet og riktig type (`standard`/`agent`).
2. Slett bare systembrukere med testens eksakte system-ID.
3. Slett deretter systemet i systemregisteret.

En bruker som allerede er slettet i UI, er håndtert. Feil i oppryddingen gjør
kjøringen rød. Hvis sletting av en systembruker feiler, beholdes systemet i
registeret slik at dataene fortsatt kan undersøkes og ryddes. Andre registrerte
systemer forsøkes ryddet selv om ett feiler. En prosess som blir drept, får ikke
kjørt teardown; slike rester kan ryddes med kommandoen nedenfor.

## Testbrukere

`playwright/e2eTests/altinn3/systemuser/testdata.ts` inneholder egne syntetiske
virksomheter og daglige ledere for opprettelse, forespørsler, endringsforespørsler
og sletting. Disse erstatter de delte kontoene i de fire testfilene. Identitetene
ble hentet fra Tenor og kontrollert i AT23 og TT02. Leverandør og eier av en
systembruker er separate begreper; leverandørens orgnummer brukes fortsatt mot
systemregisteret. Testene for klientdelegering og eskalering beholder sine egne
rolleavhengige testpersoner.

## Rydd eksisterende rester

Kjør fra `playwright/`. De vanlige lokale miljøfilene og token-generatoren brukes.
Først lages en plan; dette er kun lesing:

```sh
yarn cleanup:systemusers --env at23 --owner legacyCreation --plan /tmp/systemuser-cleanup.json
```

Les JSON-filen før sletting. For å slette akkurat brukerne i planen:

```sh
yarn cleanup:systemusers --apply /tmp/systemuser-cleanup.json
```

- Støttede miljøer: AT23 og TT02. Lastet API-adresse kontrolleres også.
- Eiere: `legacyCreation`, `legacyDeletion`, `creation`, `requests`, `changes`,
  `deletion`, `ownOrg`, `revisor`, `regnskapsfoerer`, `forretningsfoerer`, `eskaler`.
- Bruk `--kind agent` ved planlegging for klientdelegering/egen organisasjon.
- Bare gjenkjennelige test-system-ID-er som er mer enn 24 timer gamle tas med.
- Delte forhåndsopprettede systemer, blant annet `E2E-Playwright-Authentication`,
  utelates. De kan også brukes av andre tester og krever separat vurdering.
- Ved sletting hentes listen på nytt. ID, system-ID og opprettelsestid må fortsatt
  samsvare med planen. Nye brukere siden planen ble laget blir ikke slettet.
- En plan kan kjøres igjen etter delvis feil; allerede slettede brukere hoppes over.
- Kommandoen sletter systembrukere. Gamle systemregisteroppføringer slettes ikke,
  siden de kan ha brukere i andre virksomheter.

## Verifisering

Fra repo-roten:

```sh
yarn test:systemuser-cleanup
```

Disse testene sjekker avgrensning av sletting, agent-endepunkt, delvis oppsett,
404, videre opprydding etter feil og validering av planer.
