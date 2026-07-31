import type { FacilitatorRolle } from './TenorApiRequests';
import type {
  Testperson,
  DagligLederMedOrg,
  HovedenhetMedUnderenhet,
  OrganisasjonMedKlienter,
  Organisasjon,
} from './TenorTestData';

/**
 * Felles kontrakt for testdata-kilder. Implementeres av {@link TenorTestData}
 * (ferske, tilfeldige data fra Tenor) og {@link StaticTestData} (hardkodede
 * data). Testene forholder seg kun til dette grensesnittet — hvilken
 * implementasjon som brukes avgjøres ett sted, i {@link createTestData}.
 *
 * FINNE DE HARDKODEDE VARIANTENE (USE_TENOR=false): klikk deg fra `beforeEach`
 * hit, og hver metode under peker på hvilken pool i `playwright/tenor/StaticTestData.ts`
 * verdiene kommer fra. Åpne den fila og søk på pool-navnet (f.eks. `DAGLIG_LEDER_POOL`).
 */
export interface TestDataProvider {
  /**
   * Én bosatt, myndig privatperson.
   * @remarks Hardkodet (USE_TENOR=false): `BOSATT_PERSON_POOL` i `StaticTestData.ts`.
   */
  bosattMyndigPerson(): Promise<Testperson>;

  /**
   * N distinkte bosatte, myndige privatpersoner.
   * @remarks Hardkodet (USE_TENOR=false): `BOSATT_PERSON_POOL` i `StaticTestData.ts`.
   */
  bosatteMyndigePersoner(antall: number): Promise<Testperson[]>;

  /**
   * En daglig leder og virksomheten hen representerer.
   * @remarks Hardkodet (USE_TENOR=false): `DAGLIG_LEDER_POOL` i `StaticTestData.ts`.
   */
  dagligLederMedOrg(opts?: {
    organisasjonsform?: string;
    ekskluder?: string[];
  }): Promise<DagligLederMedOrg>;

  /**
   * En hovedenhet med underenhet og felles daglig leder.
   * @remarks Hardkodet (USE_TENOR=false): `HOVED_POOL` i `StaticTestData.ts`.
   */
  hovedenhetMedUnderenhet(organisasjonsform?: string): Promise<HovedenhetMedUnderenhet>;

  /**
   * En facilitator (revisor/regnskapsfører/forretningsfører) med klienter.
   * @remarks Hardkodet (USE_TENOR=false): `FACILITATOR_POOL` i `StaticTestData.ts`
   * (revisor deler `FAST_REVISOR` i `TenorTestData.ts` — fast, få klienter).
   */
  facilitatorMedKlienter(rolle: FacilitatorRolle): Promise<OrganisasjonMedKlienter>;

  /**
   * En forretningsfører med én eiendomsklient (BRL/ESEK).
   * @remarks Hardkodet (USE_TENOR=false): `FACILITATOR_POOL.forretningsfoerer` i `StaticTestData.ts`.
   */
  forretningsfoererMedEiendomsklient(): Promise<{
    dagligLeder: Testperson;
    org: Organisasjon;
    klient: Organisasjon;
  }>;

  /**
   * En tilfeldig virksomhet (orgnr + navn) fra en pool.
   * @remarks Hardkodet (USE_TENOR=false): `TILFELDIG_VIRKSOMHET_POOL` i `StaticTestData.ts`.
   */
  hentTilfeldigVirksomhet(opts?: {
    organisasjonsform?: string;
    ekskluder?: string[];
  }): Promise<Organisasjon>;
}
