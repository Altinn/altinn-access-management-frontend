import { type Locator, type Page } from '@playwright/test';

import noNb from '../../src/localizations/no_nb.json';

/**
 * The left-hand sidebar navigation that is present on every authenticated
 * access management view (https://am.ui.<env>.altinn.cloud/accessmanagement/ui).
 *
 * Because it is a cross-cutting component rather than a page of its own, it is
 * composed into AccessManagementFrontPage as `.sidebar`, but can also be used
 * standalone via the `sidebarNav` fixture.
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

  constructor(page: Page) {
    this.page = page;

    this.nav = page.getByRole('navigation', { name: 'Sidebar' });

    this.systemAccess = this.nav.getByLabel(noNb.sidebar.systemaccess);
    this.users = this.nav.getByLabel(noNb.sidebar.users);
    this.powersOfAttorney = this.nav.getByLabel(noNb.sidebar.poa_overview);
    this.reportees = this.nav.getByLabel(noNb.sidebar.reportees);
    this.consent = this.nav.getByLabel(noNb.sidebar.consent);
    this.clientAdministration = this.nav.getByLabel(noNb.sidebar.client_administration);
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
