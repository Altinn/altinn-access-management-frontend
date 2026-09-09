/** Fjerner linjeskift fra Tenor-tekst, slik at ett navn ikke blir flere konsoll-linjer. */
export function rensTekst(verdi: string | null | undefined): string {
  return (verdi ?? '').replace(/[\r\n]+/g, ' ');
}

/** Kort navn på en pakke-urn, slik utskriften slipper å gjenta urn-prefikset. */
export function pakkenavn(urn: string): string {
  return urn.split(':').pop() ?? urn;
}

/** Gjør et kort pakkenavn om til full urn, og lar en ferdig urn stå. */
export function tilPakkeUrn(pakke: string): string {
  return pakke.startsWith('urn:') ? pakke : `urn:altinn:accesspackage:${pakke}`;
}
