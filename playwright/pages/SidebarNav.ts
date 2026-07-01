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
 * Text selectors read from the `texts` for the test's language, so the labels
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

  constructor(page: Page, language: Language = Language.NB) {
    this.page = page;
    const texts = LANGUAGE_DICTIONARIES[language];

    this.nav = page.getByRole('navigation', { name: 'Sidebar' });

    this.systemAccess = this.nav.getByLabel(texts.sidebar.systemaccess);
    this.users = this.nav.getByLabel(texts.sidebar.users);
    this.powersOfAttorney = this.nav.getByLabel(texts.sidebar.poa_overview);
    this.reportees = this.nav.getByLabel(texts.sidebar.reportees);
    this.consent = this.nav.getByLabel(texts.sidebar.consent);
    this.clientAdministration = this.nav.getByLabel(texts.sidebar.client_administration);
  }

  async goToUsers() {
    await this.users.click();
  }

  async goToFullmakterHosAndre() {
    await this.reportees.click();
  }

  async goToKlientAdministrasjon() {
    await Promise.all([
      this.page.waitForResponse(
        (resp) => resp.url().includes('/api/v1/connection/rightholders') && resp.ok(),
      ),
      this.page.waitForResponse(
        (resp) => resp.url().includes('/api/v1/clientdelegations/agents') && resp.ok(),
      ),
      this.clientAdministration.click(),
    ]);
  }
}
