# Verifisering av fokushåndtering — PR #2359

**PR:** [#2359 Focus handling for request page & modal](https://github.com/Altinn/altinn-access-management-frontend/pull/2359)
**Branch:** `chore/focus-restore-on-requests-page-&-modals` (1 commit, 13 filer)
**Testet:** 2026-07-02, live i at22 (ekte browser, ikke jsdom)
**Metode:** Debugbar Chrome + TestID-login (`scripts/debug-login.mjs`), chrome-devtools MCP.
Fokus observert via `document.activeElement`-polling og patchet `HTMLElement.prototype.focus`
(fokus/blur-events fyrer ikke uten OS-fokus). Testbruker: Sitrongul Medaljong; mottatte
forespørsler testet som Diskret Nær Tiger AS (org 310 202 398).

**Testdata brukt:** Forespørselen ABCtest (tjeneste) ble **avvist** som del av testen og er
konsumert i at22 (54 → 53 mottatte).

---

## Konklusjon

Kjerneregelen **«Tilbake fra detalj → fokus tilbake på raden du kom fra» virker i alle fire
modaler**, også fra den nye skrivebeskyttede behandlet-visningen. Den nye statusvisningen
(«Avvist den 02.07.2026», ingen handlingsknapper) virker som den skal.

Men to av PR-ens egne mål holder ikke i ekte browser:

1. Etter godkjenn/avvis lander fokus på **modal-tittelen**, ikke på den behandlede raden —
   hele det utsatte gjenopprettingsmaskineriet fyrer aldri (funn 1).
2. Tittel-autofokus ved åpning av RequestReviewModal tapes alltid til lukk-krysset (funn 3).

I tillegg mister to tjenestedetalj-visninger fokus til `<body>` ved drill-in (funn 2).

---

## Hva som virker ✅

| Flate | Flyt | Resultat |
|---|---|---|
| Forespørsler → Sendte (`SentRequestsCombinedModal`) | Pakke inn/ut | Tilbake-knapp fokusert i detalj; rad gjenfokusert ved Tilbake |
| Forespørsler → Sendte | Tjeneste ut | Rad gjenfokusert ved Tilbake (selv fra body-tilstand) |
| Forespørsler → Mottatte (`RequestReviewModal`) | Pakke og tjeneste inn/ut | Tilbake fokusert i detalj; rad gjenfokusert ved Tilbake |
| Forespørsler → Mottatte | Avvis → status | Snackbar «Forespørsel avvist»; raden får «Avvist»-chip og forblir klikkbar |
| Forespørsler → Mottatte | Behandlet rad → skrivebeskyttet visning | «Avvist den 02.07.2026», ingen Godkjenn/Avvis, Tilbake fokusert; rad gjenfokusert ved Tilbake |
| Brukersiden (`received-from/:id`) → pakkemodalen | Åpning | **Overskriften** fokuseres (eneste modal der dette holder) |
| Brukersiden → pakkemodalen | Pakke inn/ut + lukking | Tilbake fokusert; rad gjenfokusert; lukking → fokus tilbake på «Forespørsel om tilgang»-knappen |
| Brukersiden → tjenestemodalen (`SentRequestsModal`) | Tjeneste ut | Rad gjenfokusert ved Tilbake |

---

## Funn

### 1. ⚠️ Etter godkjenn/avvis lander fokus på modal-tittelen, ikke den behandlede raden

**Observert:** Avviste ABCtest fra detaljvisningen. Fokuslogg: `Avvis forespørsel` →
`H1 «Sitrongul Medaljong ber om disse fullmaktene»` 286 ms senere — og der ble fokus stående,
også lenge etter at refetch var ferdig og raden hadde fått «Avvist»-chip.

**Mekanisme:** Koden i `useRequestReview.ts` utsetter `requestFocus(id)` til refetch har satt seg
(`pendingFocusRef` + settle-effekten). Men når detaljvisningen lukkes remountes listevisningen
umiddelbart, og heading-guarden i `RequestReviewModalContent.tsx` slipper autofokusen gjennom —
`restoreFocus.focusRequestId` er jo fortsatt `null` fordi requesten ikke er utstedt ennå. Når
`requestFocus('ABCtest')` så fyrer etter settle, ser `focusHasBeenLost()` (i
`RestoreFocusTarget.tsx`) at H1 har fokus → gjenoppretting hoppes bevisst over («ikke stjel fokus
fra brukeren»). Nettoeffekt: `pendingFocusRef`-maskineriet (~30 linjer) har ingen observerbar effekt.

**Konsekvens:** Ikke et fokus-*tap* (tittelen er akseptabel for skjermleser), men stikk i strid
med kodens egen kommentar («Defer restoring focus to the handled row …»). Tastaturbrukere som
behandler mange forespørsler må navigere ned igjen fra toppen for hver behandling.

**Mulig retning:** La heading-guarden også kjenne til den *ventende* requesten (f.eks. eksponer
`pendingFocusRef`-tilstanden fra hooken, eller sett requesten synkront og la fallbacken vente
mens `isFetching`).

### 2. ⚠️ Tjenestedetalj i `PendingRequestsList` setter aldri fokus innover

**Observert:** Drill-in på en tjenesterad → null fokus-kall, `document.activeElement = <body>`.
Gjelder begge modalene som bruker komponenten: `SentRequestsCombinedModal` (forespørsler-siden)
og `SentRequestsModal` (brukersiden).

**Mekanisme:** Pakke-motstykket (`RequestsList.tsx`) har `ref={backButtonRef}` med
`useAutoFocusRef` på Tilbake-knappen i detaljvisningen. Tilbake-knappen i
`PendingRequests.tsx` (`PendingRequestsList`) mangler tilsvarende. Én linje å legge til.

**Konsekvens:** Tastatur-/skjermleserbruker mister posisjonen ved drill-in på tjeneste; neste
Tab starter fra toppen av dokumentet. (Tilbake-gjenopprettingen virker likevel, siden fokus
regnes som «lost» fra body.)

### 3. ⚠️ Tittel-autofokus ved modal-åpning: tre modaler, tre oppførsler

| Modal | Ved åpning |
|---|---|
| `RequestReviewModal` | `H1.focus()` kalles, men `showModal()` kjører etterpå (effect etter commit) → **lukk-krysset vinner** |
| Pakkemodalen (brukersiden) | Overskriften fokuseres og **holder** (innholdet monteres i en senere render enn `showModal`) |
| `SentRequestsModal` (tjenester, brukersiden) | **Ingen** heading-autofokus i det hele tatt → lukk-krysset |

Racet i RequestReviewModal fantes også med gamle `useAutoFocusRef` (samme synkrone mønster), så
dette er trolig ikke en regresjon — men PR-kommentaren lover tittel-fokus, og oppførselen bør
samkjøres på tvers av modalene.

### 4. Lukking av `SentRequestsCombinedModal` mister fokus til `<body>`

Lukk-knappen → fokus på body, ikke tilbake på «Se forespørsler»-raden som åpnet modalen.
Native `<dialog>`-restore feiler fordi trigger-raden ble **remountet** mens modalen var åpen
(sent-requests-listen refetchet og raden endret innhold). På brukersiden, der triggeren ikke
remountes, virket native restore fint. Trolig pre-eksisterende; nevnes for helhetens skyld.

### 5. Småting

- Ressursdetaljen viser beskrivelsesteksten dobbelt («Martin ABCtest» × 2) — kosmetisk,
  trolig pre-eksisterende.
- Fokusloggen viste at søkefeltet i pakkedetaljen *forsøker* å ta fokus 3 ms etter
  Tilbake-knappens autofokus, men taper fordi kallet treffer en ennå ikke montert node.
  Virker i dag, men er skjørt om timingen endres.
- ESC-lukking ble ikke verifisert (Chrome resatte bakgrunnsfanen midt i proben).
- Merk: tabindex-på-blur-fiksen fra PR #2353 (`a705dd3d`) er ikke med i denne branchen.
  Ingen av flowene her treffer heading-*fallback*-stien, så det påvirket ikke resultatene —
  men rebase mot main anbefales før videre fokusarbeid.
