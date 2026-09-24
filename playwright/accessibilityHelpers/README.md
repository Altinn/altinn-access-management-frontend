# Hvordan UU-helperen fungerer

Helperen kjører axe på siden testen allerede har åpnet, og legger resultatene i Playwright-rapporten.

## Slik bruker du den i en test

```ts
test('Godkjenn samtykke', async ({ reportContext, runAccessibilityTest, consentPage }) => {
  reportContext.set({ from, to, validTo });
  await expect(consentPage.buttonApprove).toBeEnabled();
  await runAccessibilityTest.scan('samtykke-før-godkjenning');
  await consentPage.approveStandardAndWaitLogout(redirectUrl);
});
```

- `reportContext.set(...)` registrerer testdata (personer, org, system-ID) som brukes i rapporten. Helt valgfritt, testen fungerer fint uten.
- Vent alltid til ønsket innhold er synlig før du kaller `scan()`. Axe ser kun tilstanden som er tilgjengelig akkurat da.
- Sett fagområde på testsuiten, ikke på hver test:

```ts
test.describe('Samtykke', { annotation: { type: 'report-area', description: 'Samtykke' } }, () => {
  // Testene arver annotasjonen.
});
```

## Hva `scan()` gjør

1. Kjører axe (WCAG A/AA) på siden slik den ser ut akkurat nå.
2. Legger ved axe-resultat og en HTML-rapport med skjermbilde på testen.
3. Ved funn: tegner et rødt merke rundt de berørte elementene på skjermbildet.
4. Kan aldri feile testen. Feil under skanning fanges og logges som `UU-feil` i stedet.

Alle beståtte tester som ikke selv kaller `scan()` får automatisk ett scan av sluttilstanden (via en fixture). Det er et sikkerhetsnett, ikke full dekning av brukerreisen.

## Hva rapporten betyr

- **Brudd**: bekreftet regelbrudd fra axe.
- **Krever manuell vurdering**: axe klarte ikke avgjøre det automatisk (f.eks. kontrast bak et overlappende element). Ikke et bekreftet brudd.
- **Ingen funn**: ingen automatiske funn i den skannede tilstanden. Ikke det samme som at hele siden er universelt utformet.

UU-funn feiler aldri den funksjonelle testen, uansett hvor mange eller alvorlige. UU-stegene i workflowen (eksport og opplasting av rapport) har `continue-on-error: true`, så de feiler heller ikke bygget. Funksjonelle E2E-feil gir fortsatt rødt bygg.

## Dialogkontroller

`checkDialog()` er en egen, mer inngripende sjekk: tabulatorfelle, at Escape lukker dialogen, at fokus returnerer til utløserknappen, og en simulert søkefeil. Kjøres etter de funksjonelle testtrinnene, siden den endrer siden aktivt. Søkeruten (`searchRoute`) og navnet på lukkeknappen (`closeButtonName`, fra oversettelsene) sendes inn, så helperen fungerer for andre dialoger og språk. Alle delsjekkene havner på én rad i rapporten per dialog.

## Skru av UU lokalt

UU kjører som standard sammen med E2E-testene. Sett `UU_SCAN=0` for å hoppe over skanning og dialogkontroller, f.eks. når du feilsøker en funksjonell test:

```sh
yarn run env:AT23:noUU <path>   # tilsvarende env:AT22:noUU og env:TT02:noUU
```

## Kjør UU manuelt

For å kjøre mot et valgfritt miljø uten å vente på deploy eller planlagt kjøring:

```sh
gh workflow run template-playwright.yml -f environment=AT23 -f project=e2e-tests
```

Rapporteksporten (`exportAccessibilityReports.cjs`) kan testes uten nettleser eller testmiljø:

```sh
node --test playwright/util/accessibilityReports.test.cjs
```
