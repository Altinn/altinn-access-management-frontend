# Fokus-restore: implementeringsplan

## Summary

Målet er å gjøre fokus-håndtering konsekvent rundt tre flyter: tilbake fra modal/detaljvisning, inline action som bytter knapp, og sletting/fjerning fra liste. Vi beholder `RestoreFocusProvider`, `RestoreFocusTarget` og `RestoreFocusFallback` som felles modell, men fjerner direkte fallback-fokus som eget mønster.

## Key Changes

- Forenkle `RestoreFocus`-API-et ved å fjerne `requestFallbackFocus()` og `isFallbackFocusRequested`.
- La all fjerning gå via `requestFocus(removedId)`, der fallback tar over hvis target ikke finnes.
- Endre `RestoreFocusFallback` slik at `[data-restore-focus-fallback]` prioriteres før første generiske fokuserbare element.
- Legg til `useRestoreFocusAfterSettled(...)` som felles hook for både sletting/fjerning fra liste og action-knapper som erstattes av loading/success UI.
- La sletting/fjerning registrere ønsket id ved suksess og vente på BFF/query-state før `requestFocus(id)` kjøres. Hooken skal ikke sjekke om id-en finnes i liste-data.
- Gi delvis-slettbare access package-knapper samme stabile action-id som vanlige revoke-knapper.
- Gi `SentRequestsTabPanel` samme top-level restore-mønster som innkommende forespørsler.

## Test Plan

- Oppdater `RestoreFocus.test.tsx` for ny settled-semantikk, fallback-prioritet og action-fokus.
- Test at fallback ikke stjeler fokus hvis brukeren allerede har flyttet fokus.
- Test at action-settle-hooken fokuserer ny knapp etter loading, men ikke hvis fokus flyttes ut av actionområdet.
- Kjør `yarn vitest src/features/amUI/common/RestoreFocus/RestoreFocus.test.tsx`.
- Kjør relevante eksisterende vitest/component tests for request page og access package flows.
- Kjør `yarn lint` hvis miljøet har Node/Yarn tilgjengelig.

## Assumptions

- Planfilen ligger i repo-roten fordi repoet ikke har en `docs/`-mappe.
- `requestFallbackFocus()` fjernes helt, siden alle nåværende brukstilfeller har en konkret id som kan brukes til removal-flow.
- Fokus skal ikke tvinges hvis brukeren har flyttet fokus til et annet aktivt element mens async-handlingen pågår.
