# Tenor testdata — hva testene faktisk trenger

Tilgangsstyrings-testene henter testdata dynamisk fra **Tenor** (Skatteetatens
Test-Norge) i stedet for hardkodede fødselsnummer/orgnr. Grunnen er
[Altinn/altinn-authentication#2086](https://github.com/Altinn/altinn-authentication/issues/2086)
delte, hardkodede testbrukere kolliderer når testene kjører parallelt (samme
aktør/koblinger mutéres samtidig). Ferske Tenor-aktører per kjøring fjerner det.

**Denne fila er «forsikringen»:** hvis Tenor er nede eller datamodellen endrer
seg, forklarer den nøyaktig hvilke egenskaper hver test trenger, og gir
kjente-gode eksempelverdier du kan bruke manuelt.

> **Tips:** Fila er skrevet for å kunne gis rett til en AI (f.eks. Claude).
> «Tenor-integrasjonen funker ikke lenger – bytt ut Tenor-kallene med de
> hardkodede eksempeldataene i denne fila» er en jobb på et par minutter for
> Claude, siden både metodekontraktene og reserveverdiene står her.

Alt hentes via `TenorTestData` (`playwright/tenor/TenorTestData.ts`), som er et
tynt lag over `TenorApiRequests` (rå KQL-søk mot Tenor).

---

## Hjelpemetodene og hva de krever

| Metode | Krav til dataene (klartekst) | KQL / relasjon i Tenor | Returnerer |
|---|---|---|---|
| `bosattMyndigPerson()` / `bosatteMyndigePersoner(n)` | Én / N **bosatte, myndige** privatpersoner (fylt 18 år, ikke døde) | `personstatus:bosatt AND foedselsdato:[* to <18 år siden>]` (freg) | `{ pid, navn, etternavn }` |
| `dagligLederMedOrg(form='AS')` | En **virksomhet** (default `AS`) med en **bosatt daglig leder**. Leder logger inn og representerer virksomheten. | Pool av `organisasjonsform.kode:AS` (brreg); DAGL/INNH-rolle → slår opp leder i freg med `identifikator:<fnr> AND personstatus:bosatt` | `{ dagligLeder:{pid,navn,etternavn}, org:{orgnr,navn} }` |
| `hentTilfeldigVirksomhet({organisasjonsform?, ekskluder?})` | En **hvilken som helst virksomhet** (mottaker; trenger ikke innlogging) | Pool av `organisasjonsform.kode:AS`, filtrert på `ekskluder` | `{ orgnr, navn }` |
| `hovedenhetMedUnderenhet(form='AS')` | En **hovedenhet med en underenhet** (samme navn) + bosatt daglig leder. Leder representerer BÅDE hoved- og underenhet. | Pool av underenheter `organisasjonsform.kode:BEDR` → forelder via `underenhet.hovedenhet` → krever forelder = `AS` + samme navn + bosatt DAGL | `{ dagligLeder, hovedenhet:{orgnr,navn}, underenhet:{orgnr,navn} }` |

Merk: Tenor sitt brreg-søk er **deterministisk** (samme rekkefølge hver gang), så
metodene henter en *pool* og plukker tilfeldig, ellers ville alle testene delt
samme aktør (og gjenskapt parallellitetsproblemet). Underenheter ligger i
`brreg-er-fr` med `organisasjonsform.kode:BEDR` (det finnes **ikke** noe
`brreg-er-ur`-datasett), og barnet peker på forelderen via `underenhet.hovedenhet`
(forelderen lister ikke barna).

---

## Hvis Tenor er nede eller modellen endrer seg

Hver `beforeEach` kaller en av metodene over. For å kjøre en test uten Tenor:
bytt midlertidig ut Tenor-kallet med et literal-objekt av samme form. Eksempel:

```ts
// Fra:
[delegator, recipient] = await tenor.bosatteMyndigePersoner(2);
// Til (midlertidig, uten Tenor):
delegator = { pid: '03906197811', navn: 'STRAFFET KOST', etternavn: 'KOST' };
recipient = { pid: '23854897845', navn: 'KONSERVATIV FATTIGMANNSKOST', etternavn: 'FATTIGMANNSKOST' };
```

Verdiene under er de opprinnelige hardkodede testdataene som ble erstattet – de
var reelle, fungerende aktører i TT02 og er derfor gode utgangspunkt. (De kan ha
blitt endret/slettet siden; verifiser i [Tenor](https://www.skatteetaten.no/skjema/testdata/)
eller Altinns testdata-verktøy.)

### Bosatte, myndige personer (`bosattMyndigPerson` / `bosatteMyndigePersoner`)

| pid | navn |
|---|---|
| 03906197811 | Straffet Kost |
| 23854897845 | Konservativ Fattigmannskost |
| 13894599892 | Søt Kompetanse |
| 50907400120 | Vassen Ert |
| 17889574100 | Ansvarsfull Regle |
| 09893049719 | Anstendig Purre |

### Virksomhet med daglig leder (`dagligLederMedOrg`)

| dagligLeder pid | orgnr | orgnavn |
|---|---|---|
| 30818599567 | 313025853 | Lydig Redelig Tiger AS |
| 16928599063 | 312476932 | Farlig Gjestfri Tiger AS |
| 18846498989 | 311716670 | Nær Realistisk Tiger AS |
| 16815995930 | 313707679 | Innesluttet Motløs Skilpadde |
| 04856996188 | – | SUBJEKTIV ELASTISK TIGER AS (accessPackageDirect-avgiver) |

### Tilfeldig virksomhet / mottaker (`hentTilfeldigVirksomhet`)

| orgnr | navn |
|---|---|
| 313642291 | Overflødig Solid Tiger AS |
| 210530932 | Tydelig Vis Tiger AS |
| 313233383 | Rik Innbringende Tiger AS |
| 314021622 | Skamfull Konkret Tiger AS |
| 213091492 | Sivilisert Trygg Tiger AS (daglig leder / nøkkelrolle: Moderne Analyse) |

### Hovedenhet med underenhet (`hovedenhetMedUnderenhet`)

Krever at hoved- og underenhet vises med **samme navn** (testene velger dem via
`nth(0)`=hovedenhet / `nth(1)`=underenhet i aktørvelgeren). Kjente eksempler
(hovedenhet-orgnr + daglig leder):

| managerPid | hovedenhet orgnr | navn (hoved = under) |
|---|---|---|
| 25916799929 | 313819566 | Smiskende Umoden Tiger AS |
| 12828099912 | 312160862 | Initiativrik Tom Tiger AS |
| 26888197213 | 310959502 | Riktig Autentisk Ape |
| 15817195900 | 313019020 | Klok Vårlig Tiger AS |

### Tilgangsstyring-rolletester (accessManagement.spec.ts → «Tilgangsstyring»)
Disse gir en Tenor-person en rolle-pakke via API i `beforeEach`, så personen
trenger ingen forhåndsrolle – hvilken som helst `bosattMyndigPerson` funker.
Avgiver-org var opprinnelig `UNDERDANIG DYPSINDIG TIGER AS` (orgnr 314138910,
daglig leder 12816699205). Pakkene som delegeres er faste (ikke testdata):
`tilgangsstyrer`, `hovedadministrator`, `posttjenester`, `byggesoknad`.

---

## Viktig oppførsel som testene er avhengig av (lært under #2086)

- **`personstatus:bosatt`** matcher *gjeldende* status – døde treffes ikke. En
  død aktør som tidligere sneik seg inn kom fra et ufiltrert fnr-oppslag, ikke
  fra `bosattMyndigKql`.
- **Deleger fra HOVEDENHETEN** i hoved-/underenhet-tester: en delegasjon fra
  hovedenheten vises hos begge (hoved = slettbar, under = arvet). En delegasjon
  gjort fra underenheten vises *ikke* hos hovedenheten.
- **Kontovelger**: enkeltaktør-brukere lastes rett til forsiden (ingen dialog);
  `login.selectMainUnitBySearching` venter på H1 med aktørnavnet.
- **Brukerlista** er paginert + søkbar; interaksjoner må filtrere via søk først.
