# UU-skanning i Playwright

Alle beståtte E2E-tester får automatisk ett axe-scan (WCAG 2.2 A/AA) av sluttsiden sin, via en fixture i `pomFixture.ts`. Sider utenfor `/accessmanagement/ui` (f.eks. redirect etter samtykke) skannes ikke.

UU-funn feiler aldri testen. Feil under selve skanningen fanges og logges som `UU-feil`.

## Ekstra skanninger i en test

Når sluttsiden ikke er det interessante, eller testen går gjennom flere skjermbilder, skann eksplisitt. Da hoppes det automatiske scannet over.

```ts
await expect(consentPage.buttonApprove).toBeEnabled();
await runAccessibilityTest.scan('samtykke-før-godkjenning');
```

Vent alltid til innholdet er synlig før `scan()`; axe ser bare det som er i DOM akkurat da.

## Hvor finner jeg resultatene?

- **Per test** i Playwright-rapporten: axe sin standard HTML-rapport som vedlegg, med et skjermbilde der bruddene er markert med rød ramme, og en `UU-funn`-annotasjon per brudd.
- **Samlet** i GitHub-oppsummeringen for kjøringen (lokalt: i konsollen): én rad per axe-regel med antall skanninger, elementer og hvilke områder det gjelder.

## Skru av lokalt

```sh
yarn run env:AT23:noUU <path>   # eller env:TT02:noUU, evt. UU_SCAN=0
```
