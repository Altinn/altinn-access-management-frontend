import type { FacilitatorRolle } from './TenorApiRequests';
import { FAST_REVISOR } from './TenorTestData';
import type {
  Testperson,
  DagligLederMedOrg,
  HovedenhetMedUnderenhet,
  OrganisasjonMedKlienter,
  Organisasjon,
} from './TenorTestData';
import type { TestDataProvider } from './TestDataProvider';

/**
 * Statisk (hardkodet) testdata-kilde. Brukes når Tenor slås av med
 * `USE_TENOR=false` (se {@link createTestData}). Alle aktører er hentet fra
 * Tenor (og verifisert mot AT23), og ligger som TS-lister nederst — lette å
 * finne og bytte ut.
 *
 * KOLLISJONSFRI VED PARALLELLKJØRING: Playwright setter `TEST_PARALLEL_INDEX`
 * (0..workers-1) per worker-prosess og garanterer at to tester som kjører
 * SAMTIDIG aldri deler samme parallelIndex. Vi partisjonerer derfor hver pool i
 * disjunkte «band» per parallelIndex — to samtidige tester trekker fra hvert
 * sitt bånd og kan aldri mutere samme aktør. Tester som kjører etter hverandre
 * på samme slot gjenbruker båndet, men det er trygt (beforeEach/afterEach
 * rydder). Dette gjelder uten at testene endres — all logikk ligger her.
 *
 * Poolene er dimensjonert for 5 samtidige slots (jf. CI). Kjører du med flere
 * workers enn det poolen har bånd til, logges en advarsel og bånd gjenbrukes
 * (da kan samtidige slots kollidere — øk poolen eller bruk færre workers).
 *
 * Innen ett bånd holdes brukte orgnr/pid per test-instans, så flere kall i
 * samme test (f.eks. addOwnOrg: eier + 2 klienter) får distinkte aktører.
 */

// Playwright-satt per worker-prosess; 0 utenfor Playwright (f.eks. tsx-script).
const PARALLEL_INDEX = Number.parseInt(process.env.TEST_PARALLEL_INDEX ?? '0', 10) || 0;

// For 2–3 SAMTIDIGE RUNS (f.eks. CI + lokalt, eller to CI-jobber): gi hver run
// en egen `TEST_RUN_OFFSET` (0, 1, 2 …). Da tar hver run en DISJUNKT blokk av
// poolen (offset × SLOTS_PER_RUN bånd), mens parallelIndex holder workerne innen
// én run adskilt. Env arves av alle workere i samme run, så den er stabil der.
const RUN_OFFSET = Number.parseInt(process.env.TEST_RUN_OFFSET ?? '0', 10) || 0;
const SLOTS_PER_RUN = 5; // antatt maks workers pr run (jf. CI); poolene er dimensjonert 3×5 = 15 bånd

// Maks antall aktører én enkelt test trenger fra hver pool (= båndstørrelse).
const DAGLIG_LEDER_PER_BAND = 3; // addOwnOrg: eier + 2 klienter
const BOSATT_PERSON_PER_BAND = 2; // bosatteMyndigePersoner(2)
const TILFELDIG_VIRKSOMHET_PER_BAND = 1;
const HOVED_PER_BAND = 1;

/**
 * Disjunkt bånd av `pool` for denne (run, worker)-kombinasjonen. Båndindeks =
 * RUN_OFFSET × SLOTS_PER_RUN + parallelIndex, så både samtidige workers (ulik
 * parallelIndex) og samtidige runs (ulik RUN_OFFSET) får hvert sitt bånd.
 */
function band<T>(pool: T[], perBand: number, navn: string): T[] {
  const antallBand = Math.max(1, Math.floor(pool.length / perBand));
  const slot = RUN_OFFSET * SLOTS_PER_RUN + PARALLEL_INDEX;
  if (slot >= antallBand) {
    console.warn(
      `[testData:STATIC] slot ${slot} (runOffset ${RUN_OFFSET}, parallelIndex ${PARALLEL_INDEX}) ` +
        `≥ ${antallBand} bånd for «${navn}» (pool=${pool.length}, perBand=${perBand}); ` +
        `bånd gjenbrukes og samtidige slots/runs kan kollidere. Øk poolen eller bruk færre workers/runs.`,
    );
  }
  const b = slot % antallBand;
  return pool.slice(b * perBand, b * perBand + perBand);
}

// --- Pools (hentet fra Tenor, verifisert mot AT23) ------------------------

// Virksomheter med bosatt daglig leder — leder logger inn og representerer org.
const DAGLIG_LEDER_POOL: DagligLederMedOrg[] = [
  {
    dagligLeder: { pid: '19885196724', navn: 'Selvtilfreds Linjal', etternavn: 'Linjal' },
    org: { orgnr: '310468045', navn: 'KJEMPENDE EKSAKT TIGER AS' },
  },
  {
    dagligLeder: { pid: '13889497720', navn: 'Oppklarende Tunnel', etternavn: 'Tunnel' },
    org: { orgnr: '313878546', navn: 'UVANLIG SIGEN TIGER AS' },
  },
  {
    dagligLeder: { pid: '20907196748', navn: 'Urimelig Boom', etternavn: 'Boom' },
    org: { orgnr: '312258390', navn: 'UFØLSOM FESTLIG TIGER AS' },
  },
  {
    dagligLeder: { pid: '24879798910', navn: 'Gnien Stol', etternavn: 'Stol' },
    org: { orgnr: '313177386', navn: 'MEMORERENDE PUSSIG TIGER AS' },
  },
  {
    dagligLeder: { pid: '24876097520', navn: 'Dypsindig Beundring', etternavn: 'Beundring' },
    org: { orgnr: '310891436', navn: 'URIMELIG UROKKELIG TIGER AS' },
  },
  {
    dagligLeder: { pid: '16847095818', navn: 'Stadig Bit', etternavn: 'Bit' },
    org: { orgnr: '312710447', navn: 'SAMLET DYP TIGER AS' },
  },
  {
    dagligLeder: { pid: '10909397982', navn: 'Internasjonal Åker', etternavn: 'Åker' },
    org: { orgnr: '313681432', navn: 'BERIKENDE RASK TIGER AS' },
  },
  {
    dagligLeder: { pid: '06887095726', navn: 'Reflekterende Kråkebolle', etternavn: 'Kråkebolle' },
    org: { orgnr: '312251345', navn: 'FRISK RETT TIGER AS' },
  },
  {
    dagligLeder: { pid: '04857498556', navn: 'Stridlynt Infeksjon', etternavn: 'Infeksjon' },
    org: { orgnr: '210802312', navn: 'ESTETISK PASSIV TIGER AS' },
  },
  {
    dagligLeder: { pid: '28866297519', navn: 'Verdifull Bas', etternavn: 'Bas' },
    org: { orgnr: '312256371', navn: 'SPETTETE MEMORERENDE TIGER AS' },
  },
  {
    dagligLeder: { pid: '09813448979', navn: 'Gøyal Bok', etternavn: 'Bok' },
    org: { orgnr: '312993872', navn: 'TYPISK ARITMETISK TIGER AS' },
  },
  {
    dagligLeder: { pid: '26814795941', navn: 'Empirisk Rubin', etternavn: 'Rubin' },
    org: { orgnr: '313745678', navn: 'EKSPLOSIV KUNNSKAPSRIK TIGER AS' },
  },
  {
    dagligLeder: { pid: '20855099900', navn: 'Overfølsom Kamera', etternavn: 'Kamera' },
    org: { orgnr: '311805991', navn: 'HARDHUDET KANTETE TIGER AS' },
  },
  {
    dagligLeder: { pid: '15929899358', navn: 'Komplisert Mandel', etternavn: 'Mandel' },
    org: { orgnr: '314215362', navn: 'ALMINNELIG SPRUDLENDE TIGER AS' },
  },
  {
    dagligLeder: { pid: '01816596641', navn: 'Stadig Film', etternavn: 'Film' },
    org: { orgnr: '310496081', navn: 'VENSTRE ERFAREN TIGER AS' },
  },
  {
    dagligLeder: { pid: '04925799314', navn: 'Storartet Balsam', etternavn: 'Balsam' },
    org: { orgnr: '313600335', navn: 'RIKTIG ANSVARSFULL TIGER AS' },
  },
  {
    dagligLeder: { pid: '06886799584', navn: 'Anonym Hunkatt', etternavn: 'Hunkatt' },
    org: { orgnr: '313491013', navn: 'NATURSTRIDIG POSITIV TIGER AS' },
  },
  {
    dagligLeder: { pid: '19875996943', navn: 'Innesluttet Spenne', etternavn: 'Spenne' },
    org: { orgnr: '311125524', navn: 'SMIGRENDE KUNST TIGER AS' },
  },
  {
    dagligLeder: { pid: '08925199193', navn: 'Dyp Akupunktør', etternavn: 'Akupunktør' },
    org: { orgnr: '312584832', navn: 'ETTERPÅKLOK TILFELDIG TIGER AS' },
  },
  {
    dagligLeder: { pid: '26825599516', navn: 'Humoristisk Film', etternavn: 'Film' },
    org: { orgnr: '210090622', navn: 'GLAD ULLEN TIGER AS' },
  },
  {
    dagligLeder: { pid: '10837299786', navn: 'Presis Region', etternavn: 'Region' },
    org: { orgnr: '312689480', navn: 'EVIG FLEKSIBEL TIGER AS' },
  },
  {
    dagligLeder: { pid: '13855195946', navn: 'Utholden Gluten', etternavn: 'Gluten' },
    org: { orgnr: '314011066', navn: 'UTMERKET FYSISK TIGER AS' },
  },
  {
    dagligLeder: { pid: '12876397372', navn: 'Tøff Kartlegging', etternavn: 'Kartlegging' },
    org: { orgnr: '313475670', navn: 'AUTENTISK JORDNÆR TIGER AS' },
  },
  {
    dagligLeder: { pid: '11814696172', navn: 'Lydig Sofa', etternavn: 'Sofa' },
    org: { orgnr: '310516325', navn: 'OPPKLARENDE ANSVARSFULL TIGER AS' },
  },
  {
    dagligLeder: { pid: '22907099419', navn: 'Kognitiv Aktualitet', etternavn: 'Aktualitet' },
    org: { orgnr: '310706426', navn: 'GEOMETRISK LYKKELIG TIGER AS' },
  },
  {
    dagligLeder: { pid: '14896397592', navn: 'Upresis Seigmann', etternavn: 'Seigmann' },
    org: { orgnr: '312435276', navn: 'INTUITIV FAMILIÆR TIGER AS' },
  },
  {
    dagligLeder: { pid: '18825298939', navn: 'Smigrende Hette', etternavn: 'Hette' },
    org: { orgnr: '312245701', navn: 'TILBAKEHOLDEN UFORGJENGELIG TIGER AS' },
  },
  {
    dagligLeder: { pid: '10843347911', navn: 'Styrbar Flekk', etternavn: 'Flekk' },
    org: { orgnr: '313267091', navn: 'NATURSTRIDIG SAKTE TIGER AS' },
  },
  {
    dagligLeder: { pid: '11904498604', navn: 'Djerv Hingst', etternavn: 'Hingst' },
    org: { orgnr: '310136697', navn: 'INNESLUTTET SKEPTISK TIGER AS' },
  },
  {
    dagligLeder: { pid: '09824098503', navn: 'Fiktiv Arterie', etternavn: 'Arterie' },
    org: { orgnr: '313145751', navn: 'UTROLIG MODERNE TIGER AS' },
  },
  {
    dagligLeder: { pid: '17847798335', navn: 'Forståelsesfull Magesekk', etternavn: 'Magesekk' },
    org: { orgnr: '310735388', navn: 'GØYAL AKTIV TIGER AS' },
  },
  {
    dagligLeder: { pid: '18886997120', navn: 'Pratsom Diode', etternavn: 'Diode' },
    org: { orgnr: '312625857', navn: 'ORANSJE LILLA TIGER AS' },
  },
  {
    dagligLeder: { pid: '09847399586', navn: 'Lat Kø', etternavn: 'Kø' },
    org: { orgnr: '314220412', navn: 'FRUKTBAR SMIGRENDE TIGER AS' },
  },
  {
    dagligLeder: { pid: '14899499760', navn: 'Munter Frekvens', etternavn: 'Frekvens' },
    org: { orgnr: '314036484', navn: 'LEI UTÅLMODIG TIGER AS' },
  },
  {
    dagligLeder: { pid: '06842647728', navn: 'Lysegul Oppvartning', etternavn: 'Oppvartning' },
    org: { orgnr: '312993163', navn: 'SPISS SART TIGER AS' },
  },
  {
    dagligLeder: { pid: '28926699824', navn: 'Ullen Bad', etternavn: 'Bad' },
    org: { orgnr: '313804577', navn: 'AKUSTISK MATT TIGER AS' },
  },
  {
    dagligLeder: { pid: '26906498374', navn: 'Gul Skrivemaskin', etternavn: 'Skrivemaskin' },
    org: { orgnr: '313679551', navn: 'KONKURRANSEDYKTIG OPPRETTHOLDENDE TIGER AS' },
  },
  {
    dagligLeder: { pid: '31887396429', navn: 'Kognitiv Dessert', etternavn: 'Dessert' },
    org: { orgnr: '314009606', navn: 'UINTERESSERT PERFEKT TIGER AS' },
  },
  {
    dagligLeder: { pid: '15867296937', navn: 'Rund Kalender', etternavn: 'Kalender' },
    org: { orgnr: '313604519', navn: 'TENTATIV KOMPETENT TIGER AS' },
  },
  {
    dagligLeder: { pid: '03874998779', navn: 'Maritim Handelsmann', etternavn: 'Handelsmann' },
    org: { orgnr: '313490114', navn: 'DYREBAR FIRKANTET TIGER AS' },
  },
  {
    dagligLeder: { pid: '06815597735', navn: 'Kostbar Trane', etternavn: 'Trane' },
    org: { orgnr: '210143572', navn: 'TREG OPPRETT TIGER AS' },
  },
  {
    dagligLeder: { pid: '22857998352', navn: 'Dypsindig Konferanse', etternavn: 'Konferanse' },
    org: { orgnr: '313603156', navn: 'DEMOKRATISK SKYFRI TIGER AS' },
  },
  {
    dagligLeder: {
      pid: '12927497229',
      navn: 'Teoretisk Fastlandsforbindelse',
      etternavn: 'Fastlandsforbindelse',
    },
    org: { orgnr: '312243148', navn: 'EVIG USELVSTENDIG TIGER AS' },
  },
  {
    dagligLeder: { pid: '23917996954', navn: 'Usikker Matte', etternavn: 'Matte' },
    org: { orgnr: '313269744', navn: 'TYDELIG OPPLAGT TIGER AS' },
  },
  {
    dagligLeder: { pid: '20855496756', navn: 'Flott Bær', etternavn: 'Bær' },
    org: { orgnr: '313071103', navn: 'KONSENTRISK RUSTEN TIGER AS' },
  },
];

// Bosatte, myndige privatpersoner (navnet vises i brukerflaten).
const BOSATT_PERSON_POOL: Testperson[] = [
  { pid: '28859098799', navn: 'Puslete Tone', etternavn: 'Tone' },
  { pid: '06850899809', navn: 'Varm Halvøy', etternavn: 'Halvøy' },
  { pid: '06883449604', navn: 'Utålmodig Fille', etternavn: 'Fille' },
  { pid: '19849797142', navn: 'Vrien Konsonant', etternavn: 'Konsonant' },
  { pid: '17924398507', navn: 'Nyttig Ordbok', etternavn: 'Ordbok' },
  { pid: '16907299507', navn: 'Utålmodig Alderstrygd', etternavn: 'Alderstrygd' },
  { pid: '22850048707', navn: 'Utrolig Kasjott', etternavn: 'Kasjott' },
  { pid: '09826099787', navn: 'Forståelsesfull Bygg', etternavn: 'Bygg' },
  { pid: '08889898683', navn: 'Utydelig Blund', etternavn: 'Blund' },
  { pid: '10827099592', navn: 'Betydelig Kyst', etternavn: 'Kyst' },
  { pid: '04835398841', navn: 'Usikker Hotellsuite', etternavn: 'Hotellsuite' },
  { pid: '11866998304', navn: 'Uglesett Matematiker', etternavn: 'Matematiker' },
  { pid: '06888197352', navn: 'Bløt Borg', etternavn: 'Borg' },
  { pid: '14927898064', navn: 'Entusiastisk Alligator', etternavn: 'Alligator' },
  { pid: '17862949943', navn: 'Grå Dronning', etternavn: 'Dronning' },
  { pid: '06914898844', navn: 'Gjestfri Adjutant', etternavn: 'Adjutant' },
  { pid: '12814697671', navn: 'Kvart Konjakk', etternavn: 'Konjakk' },
  { pid: '06877398836', navn: 'Fantastisk Lapp', etternavn: 'Lapp' },
  { pid: '11849498748', navn: 'Rettferdig Skål', etternavn: 'Skål' },
  { pid: '07829296688', navn: 'Aktuell Dyne', etternavn: 'Dyne' },
  { pid: '10918798469', navn: 'Uinspirert Røyskatt', etternavn: 'Røyskatt' },
  { pid: '13857297258', navn: 'Omsorgsfull Fotnote', etternavn: 'Fotnote' },
  { pid: '03864998002', navn: 'Streng Dans', etternavn: 'Dans' },
  { pid: '21819597119', navn: 'Utgått Helt', etternavn: 'Helt' },
  { pid: '05830299450', navn: 'Spennende Brøkstrek', etternavn: 'Brøkstrek' },
  { pid: '22916298033', navn: 'Pålitelig Hatt', etternavn: 'Hatt' },
  { pid: '08818097299', navn: 'Misfornøyd Innsjø', etternavn: 'Innsjø' },
  { pid: '11929398795', navn: 'Masse Handelsreisende', etternavn: 'Handelsreisende' },
  { pid: '04855399534', navn: 'Tilfeldig Banjo', etternavn: 'Banjo' },
  { pid: '17857096398', navn: 'Sjokkert Sol', etternavn: 'Sol' },
];

// Vilkårlige mottaker-virksomheter (mottar delegering; trenger ikke innlogging).
const TILFELDIG_VIRKSOMHET_POOL: Organisasjon[] = [
  { orgnr: '313603156', navn: 'DEMOKRATISK SKYFRI TIGER AS' },
  { orgnr: '310433640', navn: 'ALMINNELIG SKRAVLETE TIGER AS' },
  { orgnr: '314011066', navn: 'UTMERKET FYSISK TIGER AS' },
  { orgnr: '312764512', navn: 'HÅRSÅR OPPBLÅST TIGER AS' },
  { orgnr: '312256371', navn: 'SPETTETE MEMORERENDE TIGER AS' },
  { orgnr: '312650363', navn: 'VRIEN PRAGMATISK TIGER AS' },
  { orgnr: '310899461', navn: 'SØVNIG LIKEGYLDIG TIGER AS' },
  { orgnr: '314094948', navn: 'OVERSIKTLIG UPOPULÆR TIGER AS' },
  { orgnr: '213981102', navn: 'MORSOM FREDFULL TIGER AS' },
  { orgnr: '313679551', navn: 'KONKURRANSEDYKTIG OPPRETTHOLDENDE TIGER AS' },
  { orgnr: '314259122', navn: 'KOMPLISERT HEMMELIGHETSFULL TIGER AS' },
  { orgnr: '314220412', navn: 'FRUKTBAR SMIGRENDE TIGER AS' },
  { orgnr: '313491013', navn: 'NATURSTRIDIG POSITIV TIGER AS' },
  { orgnr: '313217655', navn: 'DYR BEGEISTRET TIGER AS' },
  { orgnr: '312969025', navn: 'INTERESSANT MORSK TIGER AS' },
];

const HOVED_POOL: HovedenhetMedUnderenhet[] = [
  {
    dagligLeder: { pid: '21914599994', navn: 'Sky Opposisjon', etternavn: 'Opposisjon' },
    hovedenhet: { orgnr: '310718432', navn: 'SMISKENDE GUL TIGER AS' },
    underenhet: { orgnr: '314803108', navn: 'SMISKENDE GUL TIGER AS' },
  },
  {
    dagligLeder: { pid: '26865796713', navn: 'Falsk Svale', etternavn: 'Svale' },
    hovedenhet: { orgnr: '311130293', navn: 'PARODISK KUNSTIG TIGER AS' },
    underenhet: { orgnr: '311496891', navn: 'PARODISK KUNSTIG TIGER AS' },
  },
  {
    dagligLeder: { pid: '19867197160', navn: 'Overmodig Ektemann', etternavn: 'Ektemann' },
    hovedenhet: { orgnr: '310564427', navn: 'ARITMETISK UINSPIRERT TIGER AS' },
    underenhet: { orgnr: '315662745', navn: 'ARITMETISK UINSPIRERT TIGER AS' },
  },
  {
    dagligLeder: { pid: '05866098311', navn: 'Handlekraftig Arbeidsdag', etternavn: 'Arbeidsdag' },
    hovedenhet: { orgnr: '310227870', navn: 'ULIK AKTUELL TIGER AS' },
    underenhet: { orgnr: '314455010', navn: 'ULIK AKTUELL TIGER AS' },
  },
  {
    dagligLeder: { pid: '11918297881', navn: 'Rimelig Kunde', etternavn: 'Kunde' },
    hovedenhet: { orgnr: '313383032', navn: 'FAMØS NYTTIG TIGER AS' },
    underenhet: { orgnr: '315912822', navn: 'FAMØS NYTTIG TIGER AS' },
  },
  {
    dagligLeder: { pid: '30844499341', navn: 'Ivrig Kalori', etternavn: 'Kalori' },
    hovedenhet: { orgnr: '313612090', navn: 'STRENG HUMAN TIGER AS' },
    underenhet: { orgnr: '315854466', navn: 'STRENG HUMAN TIGER AS' },
  },
  {
    dagligLeder: { pid: '07918399857', navn: 'Fullkommen Brev', etternavn: 'Brev' },
    hovedenhet: { orgnr: '312666944', navn: 'INTERESSERT MOTVILLIG TIGER AS' },
    underenhet: { orgnr: '311197428', navn: 'INTERESSERT MOTVILLIG TIGER AS' },
  },
  {
    dagligLeder: { pid: '01922547366', navn: 'Sjokkert Overstyring', etternavn: 'Overstyring' },
    hovedenhet: { orgnr: '313817881', navn: 'SKEPTISK AKSELERERENDE TIGER AS' },
    underenhet: { orgnr: '315532116', navn: 'SKEPTISK AKSELERERENDE TIGER AS' },
  },
  {
    dagligLeder: { pid: '15826296949', navn: 'Rolig Purre', etternavn: 'Purre' },
    hovedenhet: { orgnr: '214135132', navn: 'BRA LIKEGYLDIG TIGER AS' },
    underenhet: { orgnr: '315922860', navn: 'BRA LIKEGYLDIG TIGER AS' },
  },
  {
    dagligLeder: { pid: '05925998844', navn: 'Kompleks Elg', etternavn: 'Elg' },
    hovedenhet: { orgnr: '310752592', navn: 'OPPKLARENDE SVENSK TIGER AS' },
    underenhet: { orgnr: '315497264', navn: 'OPPKLARENDE SVENSK TIGER AS' },
  },
  {
    dagligLeder: { pid: '19907199099', navn: 'Sky Elg', etternavn: 'Elg' },
    hovedenhet: { orgnr: '310356891', navn: 'ORDENTLIG KOMPLEKS TIGER AS' },
    underenhet: { orgnr: '311524615', navn: 'ORDENTLIG KOMPLEKS TIGER AS' },
  },
  {
    dagligLeder: { pid: '05815796944', navn: 'Urolig Kokeplate', etternavn: 'Kokeplate' },
    hovedenhet: { orgnr: '314258312', navn: 'VISSEN IHERDIG TIGER AS' },
    underenhet: { orgnr: '314413083', navn: 'VISSEN IHERDIG TIGER AS' },
  },
  {
    dagligLeder: { pid: '28866396908', navn: 'Maritim Fiskebutikk', etternavn: 'Fiskebutikk' },
    hovedenhet: { orgnr: '310241377', navn: 'FASCINERENDE HES TIGER AS' },
    underenhet: { orgnr: '315656621', navn: 'FASCINERENDE HES TIGER AS' },
  },
  {
    dagligLeder: { pid: '18816699734', navn: 'Kritisk Kveldsmat', etternavn: 'Kveldsmat' },
    hovedenhet: { orgnr: '312456842', navn: 'FORSTÅELSESFULL MUSKULØS TIGER AS' },
    underenhet: { orgnr: '311615483', navn: 'FORSTÅELSESFULL MUSKULØS TIGER AS' },
  },
  {
    dagligLeder: { pid: '01876098799', navn: 'Konsentrisk Katapult', etternavn: 'Katapult' },
    hovedenhet: { orgnr: '310701505', navn: 'UROKKELIG UROMANTISK TIGER AS' },
    underenhet: { orgnr: '211571632', navn: 'UROKKELIG UROMANTISK TIGER AS' },
  },
];

/** Facilitatorer med klienter (hentet fra Tenor, verifisert mot AT23). Én
 *  facilitator-test pr rolle med ulike metoder, så disse båndes ikke. Revisor
 *  deler den faste {@link FAST_REVISOR} (få klienter — se der). */
const FACILITATOR_POOL: Record<FacilitatorRolle, OrganisasjonMedKlienter> = {
  revisor: FAST_REVISOR,
  regnskapsfoerer: {
    dagligLeder: { pid: '07865998400', navn: 'Sannferdig Ramme', etternavn: 'Ramme' },
    org: { orgnr: '310015806', navn: 'INNBRINGENDE KOMFORTABEL TIGER AS' },
    klienter: [{ orgnr: '213204742', navn: 'MÅTEHOLDEN KJENT TIGER AS' }],
  },
  forretningsfoerer: {
    dagligLeder: { pid: '13846998807', navn: 'Subjektiv Jord', etternavn: 'Jord' },
    org: { orgnr: '210084592', navn: 'VIKTIG VOKSENDE TIGER AS' },
    klienter: [{ orgnr: '310748560', navn: 'SAMEIET ULASTELIG PRIKKETE LØVE' }],
  },
};

export class StaticTestData implements TestDataProvider {
  // Brukte orgnr/pid holdes per instans (= per test) så gjentatte kall i samme
  // test får distinkte aktører fra båndet.
  private readonly brukteOrgnr = new Set<string>();
  private readonly bruktePid = new Set<string>();

  async bosattMyndigPerson(): Promise<Testperson> {
    const [person] = await this.bosatteMyndigePersoner(1);
    return person;
  }

  async bosatteMyndigePersoner(antall: number): Promise<Testperson[]> {
    const slice = band(BOSATT_PERSON_POOL, BOSATT_PERSON_PER_BAND, 'person');
    const ledige = slice.filter((p) => !this.bruktePid.has(p.pid));
    if (ledige.length < antall) {
      throw new Error(
        `StaticTestData: ba om ${antall} personer, men bare ${ledige.length} ledige i båndet ` +
          `(parallelIndex ${PARALLEL_INDEX}). Øk BOSATT_PERSON_POOL / BOSATT_PERSON_PER_BAND.`,
      );
    }
    const valgte = ledige.slice(0, antall);
    valgte.forEach((p) => this.bruktePid.add(p.pid));
    return valgte;
  }

  async dagligLederMedOrg(
    opts: { organisasjonsform?: string; ekskluder?: string[] } = {},
  ): Promise<DagligLederMedOrg> {
    const ekskluder = opts.ekskluder ?? [];
    const slice = band(DAGLIG_LEDER_POOL, DAGLIG_LEDER_PER_BAND, 'daglig leder med org');
    const valgt = slice.find(
      (d) => !this.brukteOrgnr.has(d.org.orgnr) && !ekskluder.includes(d.org.orgnr),
    );
    if (!valgt) {
      throw new Error(
        `StaticTestData: tom for daglig-leder-orgs i båndet (parallelIndex ${PARALLEL_INDEX}). ` +
          `Øk DAGLIG_LEDER_POOL / DAGLIG_LEDER_PER_BAND.`,
      );
    }
    this.brukteOrgnr.add(valgt.org.orgnr);
    this.bruktePid.add(valgt.dagligLeder.pid);
    return { dagligLeder: valgt.dagligLeder, org: valgt.org };
  }

  async hentTilfeldigVirksomhet(
    opts: { organisasjonsform?: string; ekskluder?: string[] } = {},
  ): Promise<Organisasjon> {
    const ekskluder = opts.ekskluder ?? [];
    const slice = band(TILFELDIG_VIRKSOMHET_POOL, TILFELDIG_VIRKSOMHET_PER_BAND, 'virksomhet');
    const valgt = slice.find((o) => !this.brukteOrgnr.has(o.orgnr) && !ekskluder.includes(o.orgnr));
    if (!valgt) {
      throw new Error(
        `StaticTestData: tom for virksomheter i båndet (parallelIndex ${PARALLEL_INDEX}). ` +
          `Øk TILFELDIG_VIRKSOMHET_POOL / TILFELDIG_VIRKSOMHET_PER_BAND.`,
      );
    }
    this.brukteOrgnr.add(valgt.orgnr);
    return { orgnr: valgt.orgnr, navn: valgt.navn };
  }

  async facilitatorMedKlienter(rolle: FacilitatorRolle): Promise<OrganisasjonMedKlienter> {
    const f = FACILITATOR_POOL[rolle as keyof typeof FACILITATOR_POOL];
    if (!f) {
      throw new Error(
        `StaticTestData: ingen hardkodet facilitator for rolle «${rolle}». ` +
          `Legg til i FACILITATOR_POOL eller kjør med Tenor.`,
      );
    }
    return f;
  }

  async forretningsfoererMedEiendomsklient(): Promise<{
    dagligLeder: Testperson;
    org: Organisasjon;
    klient: Organisasjon;
  }> {
    const f = FACILITATOR_POOL.forretningsfoerer;
    return { dagligLeder: f.dagligLeder, org: f.org, klient: f.klienter[0] };
  }

  async hovedenhetMedUnderenhet(_organisasjonsform?: string): Promise<HovedenhetMedUnderenhet> {
    const slice = band(HOVED_POOL, HOVED_PER_BAND, 'hovedenhet med underenhet');
    const valgt = slice.find((h) => !this.brukteOrgnr.has(h.hovedenhet.orgnr));
    if (!valgt) {
      throw new Error(
        `StaticTestData: tom for hovedenhet/underenhet i båndet (parallelIndex ${PARALLEL_INDEX}). ` +
          `Øk HOVED_POOL / HOVED_PER_BAND.`,
      );
    }
    this.brukteOrgnr.add(valgt.hovedenhet.orgnr);
    this.brukteOrgnr.add(valgt.underenhet.orgnr);
    this.bruktePid.add(valgt.dagligLeder.pid);
    return valgt;
  }
}
