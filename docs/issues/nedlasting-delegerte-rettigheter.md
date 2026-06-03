# Nedlasting av oversikt over delegerte rettigheter (roller, tilgangspakker og enkeltrettigheter)

## Bakgrunn / behov

Tilgangsstyrere har behov for å kunne **laste ned en samlet oversikt** over hvilke rettigheter
som er gitt **fra en virksomhet og dens underenheter** til personer og virksomheter.

Oversikten skal dekke alle tre rettighetstyper:
- **Roller** (roller)
- **Tilgangspakker** (tilgangspakker)
- **Enkeltrettigheter** (enkeltrettigheter / single rights på ressurser, inkl. instans-delegeringer)

Tilsvarer funksjonelt Altinn 2 sin eksport «DelegerteRettigheter» (se kolonneoppsett nederst),
men bygget på den nye Access Management-modellen (connections/permissions).

Endepunktet skal lages i **BFF** (`Altinn.AccessManagement.UI`). Resultatet skal være en
**ZIP-fil** som inneholder de nødvendige **CSV-filene**.

> **Scope:** Dette issuet dekker **kun backend/BFF** (endepunkt + ZIP/CSV-generering).
> Frontend (nedlastingsknapp/-trigger i React, synlighet kun for virksomhet, XSRF/blob-håndtering)
> håndteres **separat av UX** og er utenfor scope her.

## Mål

Ett nytt BFF-endepunkt som, for en valgt virksomhet (reportee) og dens underenheter,
returnerer en `.zip` med CSV-filer som lister alle aktive delegeringer ut fra virksomheten,
med følgende felter (der de er relevante for typen):

- Navn på mottaker (person/virksomhet)
- **Mottaker-id:** orgnr for virksomheter, og for personer **fødselsdatoen** fra
  `To.DateOfBirth` formatert som `dd.MM.yyyy` (f.eks. `25.12.1966`). Fødselsnummer/personnummer
  tas aldri med. (Avklart med brukere – fødselsdato er tilstrekkelig for å identifisere mottaker.)
- Navn på tilgangspakken + `code`/urn på tilgangspakken (**pakkenavn hentes fra metadata-API**)
- Navn på rollen + `code` på rollen
- `resourceId` (ressursidentifikator) for enkeltrettigheter
- `instance id` (instansreferanse) for instans-delegeringer

> **Merk – enkeltrettigheter listes annerledes:** roller og tilgangspakker er navngitte
> «bunter» med ett navn/én kode per rad, mens enkeltrettigheter er knyttet til en `resourceId`
> (og evt. en `instance id`). De krever derfor egne kolonner og bør ligge i **egne CSV-filer**.
>
> **Operasjoner (Les/Skriv/Signer) tas IKKE med** i denne eksporten. Å hente operasjonene
> krever et eget oppslag per ressurs/instans (egne `.../rights`-kall), noe som kompliserer
> nedlastingen kraftig. Eksporten lister derfor *hvilke* ressurser/instanser som er delegert,
> men ikke de enkelte operasjonene.

---

## ⚠️ Viktig begrensning: «Delegert av» og «Delegert tidspunkt» mangler i datagrunnlaget

Altinn 2-eksporten inneholder kolonnene **Delegert tidspunkt**, **Delegert av id** og
**Delegert av navn** (hvem som faktisk utførte delegeringen, og når).

Den nye Access Management-modellen som BFF har tilgang til, eksponerer **ikke** denne
informasjonen. `Permission`-modellen
([Permission.cs](../../backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Models/AccessPackage/Permission.cs))
inneholder kun:

```csharp
public class Permission
{
    public CompactEntity From { get; set; }   // virksomheten/underenheten rettigheten er gitt FRA
    public CompactEntity To   { get; set; }   // mottaker (person/virksomhet)
    public CompactEntity Via  { get; set; }   // ev. mellomledd
    public CompactRole   Role { get; set; }
    public CompactRole   ViaRole { get; set; }
    public Reason        Reason { get; set; } // begrunnelse/kilde, ikke aktør+tidspunkt
}
```

Det finnes altså **ingen** felt for:
- **hvilken person** som utførte delegeringen («Delegert av id/navn»), eller
- **når** delegeringen ble gjort («Delegert tidspunkt»).

`From` er selve virksomheten/underenheten (org), ikke personen som gjorde delegeringen.

**Beslutning (avklart):** ✅ Disse kolonnene **utelates i v1**. Dette er en kjent og akseptert
forskjell fra Altinn 2. Eventuell senere støtte for aktør + tidspunkt krever at Access
Management-backend eksponerer en revisjonslogg/audit-kilde som BFF i dag ikke kaller.

---

## Datagrunnlag (analyse av eksisterende API)

Alle de nødvendige delegeringene kan hentes via eksisterende BFF-tjenester. Felles mønster:
endepunktene tar `party` (kontekst), `from` (giver) og `to` (mottaker). For denne eksporten
settes `from` = virksomheten (og hver underenhet), og `to` = `null` (alle mottakere).

### Underenheter (subunits)
Underenhetene hentes fra reportee-listen. `AuthorizedParty.Subunits`
([AuthorizedParty.cs](../../backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Models/AccessManagement/AuthorizedParty.cs))
inneholder underenhetene til en hovedenhet. **Når `includeSubunits=true`** (default) itererer
eksporten over hovedenheten **og** alle underenheter og kjører uthentingen per part. **Når
`includeSubunits=false`** behandles kun hovedenheten (`partyUuid`). (Jf. `feature/subunitfix` og
`ReporteeController.ResolveAuthorizedParty` som allerede slår opp parter i `Subunits`.)

### 1) Roller
- Tjeneste: `IRoleService.GetRolePermissions(party, from, to, languageCode)` →
  [RoleController.cs](../../backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI/Controllers/RoleController.cs)
  `GET /role/permissions`
- Returnerer `List<RolePermission>`. Hver `RolePermission` har `Role` (navn/kode via
  `AccessManagementRole`) og `Permissions` (liste av `Permission` med `From`/`To`).
- Felter: rollenavn (`Role.Name`), rollekode (`Role.Code`), mottaker (`Permission.To`).

### 2) Tilgangspakker
- Tjeneste: `IAccessPackageService.GetDelegations(party, to, from, languageCode)` →
  [AccessPackageController.cs](../../backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI/Controllers/AccessPackageController.cs)
  `GET /accesspackage/delegations`
- Returnerer `Dictionary<Guid, List<PackagePermission>>` (gruppert på område).
  `PackagePermission.Package` (`CompactPackage`: `Id`, `Urn`) + `Permissions` (`From`/`To`).
- Felter: pakke-`code` (`CompactPackage.Urn`), mottaker (`Permission.To`).
  - **NB – pakkenavn hentes via tomt pakkesøk (ikke per packageId):** `CompactPackage` har
    `Urn`/`Id` men ikke `Name`. I stedet for å kalle `GetAccessPackageById` per pakke (N+1),
    gjør vi **ett** tomt søk og bygger et oppslag `Id → Name` én gang:
    `IAccessPackageService.GetSearch(languageCode, searchString: "", typeName: null)`
    (→ metadata-endepunktet `meta/info/accesspackages/search/?term=&searchInResources=true`)
    returnerer **alle** pakker gruppert på område. Flat ut til `Dictionary<Guid,string>`
    (`AccessPackage.Id` → `AccessPackage.Name`) og slå opp navn derfra.
  - Dette er **samme mønster som frontend allerede bruker**: hooken
    [useAccessPackageLookup.tsx](../../src/resources/hooks/useAccessPackageLookup.tsx) kaller
    `useSearchQuery({ searchString: '' })` og bygger en `Map<packageId, AccessPackage>` som
    caches av RTK Query. (Bekreftet av Alexandra/UX.) Tomt søk returnerer altså hele pakkesettet.
  - **Om `typeName`:** parameteren angir typen til *parten selv* (giver/virksomhet), **ikke**
    mottakerens type. Siden eksporten kun kjøres for virksomheter (se forutsetning under
    «Forslag til endepunkt»), er parten alltid en organisasjon. For navn-oppslaget trenger vi
    uansett bare hele pakkesettet, så et tomt/uten `typeName` (alle pakker) er tilstrekkelig.

### 3) Enkeltrettigheter (ressurser)
- Tjeneste: `ISingleRightService.GetDelegatedResources(languageCode, party, from, to)` →
  [SingleRightController.cs](../../backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI/Controllers/SingleRightController.cs)
  `GET /singleright/delegation/resources` → `List<ResourceDelegation>`
- Felter: `resourceId` (`ServiceResourceFE.Identifier`), ressursnavn (`Title`),
  mottaker (`Permission.To`).
- **Alle mottakere i ett kall:** ressurs-delegeringene (uten actions) listes for *alle* mottakere
  samtidig – mottakeren leses fra hver `Permission.To`. Samme `from`-baserte mønster som
  roller/pakker/instans (`from` = giver, `to` ikke spesifisert / `Guid.Empty`).
- **Operasjoner tas ikke med** – det ville krevd ekstra `GetDelegatedResourceRights(..., resourceId, to)`
  (`GET /singleright/delegation/resources/rights`) per ressurs **og** per mottaker. Utelates bevisst.
  (Det er nettopp fordi operasjoner droppes at vi slipper å spesifisere en konkret `to`.)

### 4) Enkeltrettigheter på instans (instance id)
- Tjeneste: `IInstanceService.GetDelegatedInstances(languageCode, party, from, to, resource, instance)` →
  [InstanceController.cs](../../backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI/Controllers/InstanceController.cs)
  `GET /instances/delegation/instances` → `List<InstanceDelegation>`
- Felter: `resourceId` (`Resource.Identifier`), **instance id** (`Instance.RefId` på
  `DelegationInstance`), mottaker (`Permission.To`).
- **Operasjoner tas ikke med** – det ville krevd ekstra `GetInstanceRights(...)`
  (`GET /instances/delegation/instances/rights`) per instans. Utelates bevisst.

### Mottakeridentitet (`CompactEntity`) – fødselsdato for personer
Mottaker hentes fra `Permission.To`
([Entity.cs](../../backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Models/Common/Entity.cs)):
`Name`, `Type` (Person/Organization), `OrganizationIdentifier` (orgnr), `PartyId`, `Id` (uuid),
`DateOfBirth`.

**Viktig:** `CompactEntity` inneholder **ikke** fødselsnummer for personer. Vi bygger derfor
`mottaker_id` slik:

- **Virksomhet:** bruk `To.OrganizationIdentifier` (orgnr) direkte.
- **Person:** bruk `To.DateOfBirth` (ISO-format `yyyy-MM-dd`, f.eks. `1966-12-25`) formatert som
  `dd.MM.yyyy`, dvs. `25.12.1966`. Da trengs **ingen** register-oppslag, og fnr forekommer aldri
  i BFF. (Avklart med brukere – fødselsdato er nok for å identifisere mottaker.)

Hjelpemetode i `PersonIdentifierUtils`
([PersonIdentifierUtils.cs](../../backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI.Core/Helpers/PersonIdentifierUtils.cs)),
f.eks.:

```csharp
// "1966-12-25" -> "25.12.1966"
public static string FormatDateOfBirth(string dateOfBirth) =>
    DateTime.TryParse(dateOfBirth, out var d) ? d.ToString("dd.MM.yyyy") : string.Empty;
```

---

## Forslag til endepunkt

```
GET /accessmanagement/api/v1/delegationexport/reportee/{partyUuid}
    ?includeSubunits=true        (valgfri, default true)
    &types=roles,accesspackages,singlerights,instances   (default alle)
    &languageCode=nb             (valgfri, default bokmål "nb")
Accept: application/zip
```

- **`includeSubunits` (valgfri, default `true`):** styrer om delegeringer fra virksomhetens
  **underenheter** skal tas med i eksporten.
  - `true`  → eksporten dekker hovedenheten **og** alle underenheter (`AuthorizedParty.Subunits`).
  - `false` → kun delegeringer gitt **fra hovedenheten** (`partyUuid`) selv; underenheter
    hoppes over og det kjøres ikke uthenting per underenhet.
- **Forutsetning – kun virksomhet:** funksjonen er **kun tilgjengelig når parten (`partyUuid`)
  er en virksomhet/organisasjon**. Er parten en person, skal endepunktet avvise forespørselen
  (f.eks. `400 Bad Request`/`403 Forbidden`). Sjekkes på `AuthorizedParty.Type ==
  AuthorizedPartyType.Organization` fra reportee-oppslaget.
- **Autorisasjon:** samme mønster som øvrige reportee-endepunkt; `partyUuid` må tilhøre
  innlogget brukers reportee-liste (valider via `GetReporteeListForUser`, sjekk også `Subunits`).
- **Respons:** `200 OK`, `Content-Type: application/zip`,
  `Content-Disposition: attachment; filename="delegerte-rettigheter-{orgnr}-{yyyymmdd}.zip"`.
  Bygges med `System.IO.Compression.ZipArchive` (ingen eksisterende ZIP/CSV-bygging i repoet i dag –
  ny hjelpeklasse må lages).

### Innhold i ZIP (én CSV per type)

| Fil | Innhold |
|-----|---------|
| `roller.csv` | Roller gitt fra virksomhet/underenhet |
| `tilgangspakker.csv` | Tilgangspakker gitt fra virksomhet/underenhet |
| `enkeltrettigheter.csv` | Enkeltrettigheter på ressurser |
| `enkeltrettigheter-instans.csv` | Enkeltrettigheter på instans (har `instans_id`) |

> ✅ Avklart: **separate filer per rettighetstype** (ikke én samlet fil). Bl.a. fordi
> enkeltrettigheter har kolonner (resourceId, instans_id) som ikke gir mening for roller/pakker.

### Foreslåtte CSV-kolonner

Felles for alle filer:
`giver_orgnr;giver_navn;mottaker_id;mottaker_navn;mottaker_type`

> `giver_orgnr` + `giver_navn` identifiserer giveren. Tilgangsstyrer kan se av orgnr/navn om
> rettigheten er gitt fra hovedenheten eller fra en underenhet – egen «underenhet»-kolonne trengs ikke.
>
> `mottaker_id` = orgnr for virksomheter, fødselsdato `dd.MM.yyyy` (f.eks. `25.12.1966`) for personer.

`roller.csv` i tillegg:
`rolle_navn;rolle_code`

`tilgangspakker.csv` i tillegg:
`tilgangspakke_navn;tilgangspakke_code`

`enkeltrettigheter.csv` i tillegg:
`tjeneste_navn;resource_id`

`enkeltrettigheter-instans.csv` i tillegg:
`tjeneste_navn;resource_id;instans_id`

(Skille-tegn `;` for å matche norsk Excel; UTF-8 med BOM for å vise æ/ø/å riktig.
Escaping og injection-beskyttelse: se «[CSV-format og escaping](#csv-format-og-escaping-sikkerhet)».)

### Mapping mot Altinn 2-kolonner

| Altinn 2 kolonne | Ny kilde | Status |
|------------------|----------|--------|
| Organisasjonsnummer | `Permission.From.OrganizationIdentifier` | ✅ |
| Enhetsnavn | `Permission.From.Name` | ✅ |
| Operasjoner (Les/Skriv/Signer) | krever eget `.../rights`-oppslag per ressurs/instans | ❌ utelatt (kompleksitet) |
| Tjeneste navn | Ressurs-`Title` / pakkenavn / rollenavn | ✅ |
| Tjeneste id | `resourceId` / pakke-urn / rolle-code | ✅ |
| Tjeneste type | ressurstype / «Tilgangspakke» / «Rolle» | ✅ |
| ElementId / Instance | `DelegationInstance.RefId` | ✅ (instans) |
| Mottaker id | orgnr (`To.OrganizationIdentifier`) / fødselsdato `dd.MM.yyyy` fra `To.DateOfBirth` | ✅ |
| Mottaker navn | `Permission.To.Name` | ✅ |
| **Delegert tidspunkt** | — | ❌ ikke i datagrunnlaget |
| **Delegert av id** | — | ❌ ikke i datagrunnlaget |
| **Delegert av navn** | — | ❌ ikke i datagrunnlaget |

---

## Teknisk implementasjon (skisse)

1. **Controller:** `DelegationExportController` i `Altinn.AccessManagement.UI/Controllers`.
2. **Service:** `IDelegationExportService` / `DelegationExportService` i Core/Services som:
   - resolverer reportee + underenheter,
   - kaller eksisterende `IRoleService`, `IAccessPackageService`, `ISingleRightService`,
     `IInstanceService` (gjenbruk, ikke nye backend-klienter),
   - flater ut til rad-modeller per CSV.
   - Kjør per-part-kallene parallelt (`Task.WhenAll`) for ytelse ved mange underenheter.
3. **CSV-skriving (bruk bibliotek – ikke manuell strengbygging):** se egen seksjon
   «[CSV-format og escaping](#csv-format-og-escaping-sikkerhet)» under. Bruk `CsvHelper` for
   korrekt RFC 4180-quoting **og** beskyttelse mot CSV/formel-injection. ZIP bygges med
   innebygde `System.IO.Compression.ZipArchive` (ingen ekstra pakke nødvendig).
4. **Pakkenavn-oppslag (ett tomt søk, ikke per id):** kall `IAccessPackageService.GetSearch`
   med tom `searchString` **én gang** for å få alle pakker (→ `meta/info/accesspackages/search/`),
   flat ut til `Dictionary<Guid,string>` (`Id` → `Name`) og slå opp navn derfra. Unngår N+1
   (`GetAccessPackageById` per pakke). Speiler frontend-hooken `useAccessPackageLookup`.
5. **Mottaker-id:**
   - Person: formater `To.DateOfBirth` via `PersonIdentifierUtils.FormatDateOfBirth`
     (`dd.MM.yyyy`). Ingen register-oppslag.
   - Virksomhet: bruk `To.OrganizationIdentifier` direkte.
6. **Tester:**
   - Mocks i `Altinn.AccessManagement.UI.Mocks` for de fire tjenestene.
   - Integrasjonstest som verifiserer ZIP-struktur, filnavn, kolonner og at underenheter er med.
   - Enhetstest for `FormatDateOfBirth` (`1966-12-25` → `25.12.1966`, samt edge-cases/tom verdi).
   - Enhetstest for CSV-escaping/injection (verdier med `;`, `"`, linjeskift og `=`/`+`/`-`/`@`-prefiks).

---

## CSV-format og escaping (sikkerhet)

CSV-en inneholder eksterne, ukontrollerte verdier (virksomhets-/personnavn, ressursnavn,
pakkenavn). Disse kan inneholde skilletegn, anførselstegn og linjeskift – og i verste fall
**formel-injection** (verdier som starter med `=`, `+`, `-`, `@`, TAB eller CR, som Excel/Sheets
tolker som formler). **Ikke bygg CSV med manuell strengsammensetting / `string.Join(";", ...)`.**

**Anbefaling: bruk biblioteket [`CsvHelper`](https://joshclose.github.io/CsvHelper/)** (de-facto
standard for .NET, aktivt vedlikeholdt, MS-PL/Apache-2.0). Det finnes ingen CSV-pakke i repoet i
dag, så `CsvHelper` legges til som ny `PackageReference` (f.eks. i Core- eller Integration-prosjektet).

Det dekker begge bekymringene:

1. **RFC 4180-quoting (escaping):** felt som inneholder skilletegnet, `"` eller linjeskift
   omsluttes automatisk med `"..."`, og interne `"` dobles (`""`). Håndteres av `CsvWriter`.
2. **Injection-beskyttelse:** sett `InjectionOptions` slik at farlige ledetegn nøytraliseres.

```csharp
var config = new CsvConfiguration(CultureInfo.InvariantCulture)
{
    Delimiter = ";",                       // norsk Excel
    InjectionOptions = InjectionOptions.Escape, // prefiks farlige verdier (=,+,-,@,TAB,CR) med '
    // ev. ShouldQuote = args => true for å alltid quote
};

await using var stream = archive.CreateEntry("roller.csv").Open();
// UTF-8 MED BOM slik at Excel viser æ/ø/å riktig
await using var sw = new StreamWriter(stream, new UTF8Encoding(encoderShouldEmitUTF8Identifier: true));
await using var csv = new CsvWriter(sw, config);
csv.WriteRecords(rows);   // rows = typed rad-modeller per fil (ClassMap styrer kolonnerekkefølge)
```

**Detaljer:**
- **UTF-8 med BOM** er bevisst (Excel på Windows antar ellers ANSI for `;`-separerte filer).
- **Én `ClassMap` per filtype** gir eksplisitt og stabil kolonnerekkefølge.
- Hver CSV serialiseres til `byte[]` (UTF-8 m/BOM) og skrives deretter inn i sin `ZipArchive`-entry.
  (Eksportfilene er små, så enkel `byte[]`-bygging er greit; ved svært store filer kan man
  vurdere å streame direkte inn i entry-strømmen.)
- Alternativ til `InjectionOptions.Escape`: `InjectionOptions.Strip` (fjerner ledetegnet). Velg
  `Escape` for å bevare verdien mest mulig.

---

## Avklart

- **«Delegert av» + «Delegert tidspunkt»:** ✅ Disse **utelates i v1**. Datagrunnlaget
  eksponerer ikke aktør/tidspunkt (se «Viktig begrensning» over), og det er akseptert at
  kolonnene ikke tas med. Eventuell senere støtte krever ny audit-kilde fra Access Management-backend.
- **Operasjoner (Les/Skriv/Signer):** ✅ **Utelates** – krever eget `.../rights`-oppslag per
  ressurs/instans og kompliserer nedlastingen kraftig.
- **Filstruktur:** ✅ **Separate CSV-filer per rettighetstype** (roller, tilgangspakker,
  enkeltrettigheter, enkeltrettigheter-instans). Ikke én samlet fil.
- **Indirekte rettigheter:** ✅ **Tas ikke med** – kun direkte delegeringer fra virksomheten/
  underenheten. `IndirectRights` / arvede / `Via`-tilganger utelates.
- **Maskinporten / API-delegering:** ✅ **Tas ikke med** i v1. Eksporten dekker roller,
  tilgangspakker og enkeltrettigheter (ressurs + instans).
- **Språk:** ✅ **Bokmål (`nb`) som default.** Endepunktet skal støtte en valgfri språkkode-
  parameter (`languageCode`/`lang`) slik at navn kan hentes på annet språk.

---

## Akseptansekriterier

- [ ] Nytt BFF-endepunkt returnerer en gyldig `.zip` med `Content-Type: application/zip`.
- [ ] ZIP inneholder **separate CSV-filer per rettighetstype**: roller, tilgangspakker,
      enkeltrettigheter og enkeltrettigheter-instans.
- [ ] `includeSubunits=true` (default): rettigheter fra **både hovedenhet og alle underenheter**
      er inkludert. `includeSubunits=false`: **kun** hovedenheten.
- [ ] Kun **direkte** delegeringer tas med (ingen indirekte/arvede/`Via`-tilganger).
- [ ] Maskinporten/API-delegering er **ikke** med i v1.
- [ ] Endepunktet støtter valgfri `languageCode` med **bokmål (`nb`) som default**.
- [ ] Hver rad inneholder mottakernavn + -id, samt relevant navn/kode/resourceId/instans-id.
- [ ] `mottaker_id` viser orgnr for virksomheter og **fødselsdato** `dd.MM.yyyy` for personer;
      fnr forekommer aldri i fila eller i logg.
- [ ] Tilgangspakkenavn hentes via **ett** tomt pakkesøk og oppslag `Id → Name` (ikke per-pakke-kall).
- [ ] Funksjonen er **kun tilgjengelig når parten er en virksomhet/organisasjon**; person-part avvises.
- [ ] Autorisasjon: bare reportees i brukerens egen liste (inkl. underenheter) kan eksporteres.
- [ ] CSV åpner korrekt i Excel (UTF-8 BOM, `;`-separator).
- [ ] CSV-en bruker `CsvHelper` med RFC 4180-quoting og `InjectionOptions` (formel-injection-trygg);
      ingen manuell strengsammensetting.
- [ ] Enhets-/integrasjonstester dekker struktur, underenheter og tom-tilstand.
- [ ] README/dokumentasjon noterer den kjente forskjellen mot Altinn 2 (manglende «Delegert av»/tidspunkt).

---

## Referanse: Altinn 2-format «DelegerteRettigheter»

Kolonner i dagens Altinn 2-eksport:

```
Organisasjonsnummer | Enhetsnavn | Operasjoner | Tjeneste navn | Tjeneste id |
Tjeneste type | ElementId | Mottaker id | Mottaker navn |
Delegert tidspunkt | Delegert av id | Delegert av navn
```

De tre siste kolonnene kan **ikke** fylles ut fra dagens datagrunnlag (se begrensning over).
