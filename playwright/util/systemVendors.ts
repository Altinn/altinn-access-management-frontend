import { pickRandom } from 'playwright/util/helper';

/**
 * Leverandør-orgnr til systembruker-testene.
 *
 * En hvilken som helst virksomhet kan opptre som systemleverandør (opprette et
 * system i systemregisteret), så vi roterer over en liste hentet fra Tenor i
 * stedet for at alle testene bruker samme leverandør. Systemene som opprettes
 * får unike navn, så samme leverandør tåler parallelle kjøringer.
 *
 * NB: Testene som bruker et PREBYGD system (approveSystemUserRequest /
 * approveSystemUserChangeRequest) må fortsatt bruke leverandøren det prebygde
 * systemet er registrert på – de kan ikke rotere.
 */
export const SYSTEM_VENDOR_ORGS = [
  '313490114', // DYREBAR FIRKANTET TIGER AS
  '313071103', // KONSENTRISK RUSTEN TIGER AS
  '313594343', // INTUITIV ENKEL TIGER AS
  '314061276', // METT ORDENTLIG TIGER AS
  '313269744', // TYDELIG OPPLAGT TIGER AS
  '314223543', // AKROBATISK IMPULSIV TIGER AS
  '310241598', // ROMANTISK UKLAR TIGER AS
  '314009606', // UINTERESSERT PERFEKT TIGER AS
  '210143572', // TREG OPPRETT TIGER AS
  '310091812', // UGLESETT SKRAVLETE TIGER AS
  '313014614', // MISFORNØYD KONTANT TIGER AS
  '314254619', // LEGITIM SUNN TIGER AS
  '312650363', // VRIEN PRAGMATISK TIGER AS
  '311088564', // KORREKT SELVHJULPEN TIGER AS
  '310735388', // GØYAL AKTIV TIGER AS
  '314210964', // INTERESSANT HARDHUDET TIGER AS
  '314321448', // MINKENDE PERFEKT TIGER AS
  '312456206', // MELANKOLSK ALLSLAGS TIGER AS
  '312993163', // SPISS SART TIGER AS
  '313309932', // OVERSIKTLIG ERFAREN TIGER AS
] as const;

/** Et tilfeldig leverandør-orgnr fra {@link SYSTEM_VENDOR_ORGS}. */
export function pickVendorOrg(): string {
  return pickRandom([...SYSTEM_VENDOR_ORGS]);
}
