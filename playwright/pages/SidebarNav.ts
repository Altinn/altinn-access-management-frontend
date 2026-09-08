import { type Locator, type Page } from '@playwright/test';

import { LANGUAGE_DICTIONARIES, Language } from './LanguageMenu';

/**
 * The left-hand sidebar navigation that is present on every authenticated
 * access management view (https://am.ui.<env>.altinn.cloud/accessmanagement/ui).
 *
 * Because it is a cross-cutting component rather than a page of its own, it is
 * composed into AccessManagementFrontPage as `.sidebar`, but can also be used
 * standalone via the `sidebarNav` fixture.
 *
 * Every item renders as a link whose accessible name comes from its aria-label,
 * so they are addressed with `getByRole('link')` per the locator priority in
 * CLAUDE.md. The names read from the `dict` for the test's language, so they
 * follow whatever language the app was switched to (default: bokmål).
 */
/** U+00AD, used in localization strings as a line-break hint. */
const SOFT_HYPHEN = '\u00AD';

export class SidebarNav {
  readonly page: Page;
  readonly nav: Locator;
  readonly systemAccess: Locator;
  readonly users: Locator;
  readonly powersOfAttorney: Locator;
  readonly reportees: Locator;
  readonly consent: Locator;
  readonly clientAdministration: Locator;
  readonly settings: Locator;
  readonly requests: Locator;
  readonly myClients: Locator;
  readonly maskinporten: Locator;

  constructor(page: Page, language: Language = Language.NB) {
    this.page = page;
    const dict = LANGUAGE_DICTIONARIES[language];

    this.nav = page.getByRole('navigation', { name: 'Sidebar' });

    this.systemAccess = this.navLink(dict.sidebar.systemaccess);
    this.users = this.navLink(dict.sidebar.users);
    this.powersOfAttorney = this.navLink(dict.sidebar.poa_overview);
    this.reportees = this.navLink(dict.sidebar.reportees);
    this.consent = this.navLink(dict.sidebar.consent);
    this.clientAdministration = this.navLink(dict.sidebar.client_administration);
    this.settings = this.navLink(dict.sidebar.settings);
    // Matched on the title alone because this item's aria-label gains a count
    // suffix once the pending-request query resolves — "Forespørsler" becomes
    // "Forespørsler (1 mottatt)". Name matching is substring by default, so the
    // title covers both, and the locator is not racing that update.
    this.requests = this.navLink(dict.sidebar.requests);
    this.myClients = this.navLink(dict.sidebar.your_clients);
    // The Maskinporten label carries a soft hyphen for line breaking, and whether
    // it survives into the accessible name depends on the component. Matching the
    // part before it is a substring that holds either way. Written as an escape
    // rather than the literal character, which is invisible in source.
    this.maskinporten = this.navLink(dict.sidebar.maskinporten.split(SOFT_HYPHEN)[0]);
  }

  /**
   * One sidebar item, by the accessible name of its link.
   *
   * Substring matching is deliberate: some labels carry a suffix (a pending
   * count) that appears only after data loads.
   */
  private navLink(name: string): Locator {
    return this.nav.getByRole('link', { name });
  }

  async goToUsers() {
    await this.users.click();
  }

  async goToFullmakterHosAndre() {
    await this.reportees.click();
  }

  async goToKlientAdministrasjon() {
    await this.clientAdministration.click();
  }

  async goToInnstillinger() {
    await this.settings.click();
  }

  async goToForespoersler() {
    await this.requests.click();
  }

  async goToDineKlienter() {
    await this.myClients.click();
  }

  async goToMaskinporten() {
    await this.maskinporten.click();
  }

  async goToFullmakter() {
    await this.powersOfAttorney.click();
  }
}
