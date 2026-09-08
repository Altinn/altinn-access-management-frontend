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
 * Text selectors read from the `dict` for the test's language, so the labels
 * always match whatever language the app was switched to (default: bokmål).
 */
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

    this.systemAccess = this.nav.getByLabel(dict.sidebar.systemaccess);
    this.users = this.nav.getByLabel(dict.sidebar.users);
    this.powersOfAttorney = this.nav.getByLabel(dict.sidebar.poa_overview);
    this.reportees = this.nav.getByLabel(dict.sidebar.reportees);
    this.consent = this.nav.getByLabel(dict.sidebar.consent);
    this.clientAdministration = this.nav.getByLabel(dict.sidebar.client_administration);
    this.settings = this.nav.getByLabel(dict.sidebar.settings);
    // The requests item appends a badge ("Forespørsler (2 mottatt)") when there
    // are pending requests, so match the title as a prefix rather than exactly.
    this.requests = this.nav.getByLabel(new RegExp(`^${dict.sidebar.requests}`));
    this.myClients = this.nav.getByLabel(dict.sidebar.your_clients);
    // "Maskinporten­administrasjon" carries a soft hyphen (U+00AD) in the
    // localization files that the accessible name may or may not preserve, so
    // match on the part before it.
    this.maskinporten = this.nav.getByLabel(dict.sidebar.maskinporten.split('­')[0]);
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
