import { expect, type Locator, type Page } from '@playwright/test';

import { env } from 'playwright/util/helper';

import { LANGUAGE_DICTIONARIES, Language, type Dict } from '../LanguageMenu';
import { SidebarNav } from '../SidebarNav';

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Matches an accessible name that BEGINS with `value`. */
const startsWith = (value: string): RegExp => new RegExp(`^${escapeRegExp(value)}`);

/**
 * Fullmaktsoversikt
 * (https://am.ui.<env>.altinn.cloud/accessmanagement/ui/poa-overview).
 *
 * Lists every access package grouped by område, and links each one to its own
 * page where the users holding it are managed.
 *
 * Packages are found by typing in the search field rather than by expanding an
 * område: searching auto-expands the matching område, so a test does not need to
 * know which område a package belongs to.
 */
export class FullmaktsoversiktPage {
  readonly page: Page;
  readonly texts: Dict;
  readonly sidebar: SidebarNav;

  readonly pageHeading: Locator;
  readonly noAccessAlert: Locator;
  readonly lastNedKnapp: Locator;
  readonly tilgangspakkerFane: Locator;
  readonly pakkeSok: Locator;

  readonly brukereFane: Locator;
  readonly tjenesterFane: Locator;
  readonly brukerSok: Locator;
  readonly tjenesteSok: Locator;

  constructor(page: Page, language: Language = Language.NB) {
    this.page = page;
    this.texts = LANGUAGE_DICTIONARIES[language];
    this.sidebar = new SidebarNav(page, language);
    const poa = this.texts.poa_overview_page;
    const details = this.texts.package_poa_details_page;

    // heading is "Fullmaktsoversikt for {{name}}" — match the static prefix.
    this.pageHeading = this.page.getByRole('heading', {
      name: startsWith(poa.heading.split('{{name}}')[0].trim()),
    });
    this.noAccessAlert = this.page.getByText(poa.no_access_title);
    this.lastNedKnapp = this.page.getByRole('button', {
      name: this.texts.download_file.trigger_button,
    });
    this.tilgangspakkerFane = this.page.getByRole('tab', {
      name: this.texts.user_rights_page.access_packages_title,
    });
    this.pakkeSok = this.page.getByRole('searchbox', {
      name: this.texts.access_packages.search_label,
    });

    this.brukereFane = this.page.getByRole('tab', { name: details.users_tab_title });
    this.tjenesterFane = this.page.getByRole('tab', { name: details.services_tab_title });
    // The design-system searchbox on the package's Brukere tab is labelled "Søk".
    this.brukerSok = this.page.getByRole('searchbox', { name: this.texts.common.search });
    this.tjenesteSok = this.page.getByRole('searchbox', {
      name: this.texts.resource_list.resource_search_placeholder,
    });
  }

  /**
   * A package link in the overview.
   *
   * Anchored: the link's accessible name is "<name> N tjenester", so matching the
   * name alone would be ambiguous against packages whose names share a prefix.
   */
  pakkeLenke(pakkeNavn: string): Locator {
    return this.page.getByRole('link', { name: startsWith(pakkeNavn) });
  }

  /** A user row on a package's Brukere tab. */
  brukerRad(navn: string): Locator {
    return this.page.getByRole('button', { name: startsWith(navn) });
  }

  /** "Gi fullmakt til {{navn}}" — shown for a user who does not hold the package. */
  giFullmaktKnapp(navn: string): Locator {
    return this.page.getByRole('button', {
      name: this.texts.common.give_poa_to_name.replace('{{name}}', navn),
      exact: true,
    });
  }

  /** "Slett fullmakt til {{navn}}" — shown for a user who holds the package. */
  slettFullmaktKnapp(navn: string): Locator {
    return this.page.getByRole('button', {
      name: this.texts.common.delete_poa_to_name.replace('{{name}}', navn),
      exact: true,
    });
  }

  /** A service listed on a package's Tjenester tab. */
  tjenesteRad(tjenesteNavn: string): Locator {
    return this.page.getByRole('button', { name: startsWith(tjenesteNavn) });
  }

  async goToFullmakter() {
    await this.sidebar.goToFullmakter();
    await expect(this.pageHeading).toBeVisible();
  }

  /**
   * Opens Fullmaktsoversikt by URL.
   *
   * The sidebar item is not rendered for a user without access, so that case has
   * to navigate directly to observe what the page shows.
   */
  async goToFullmakterViaUrl() {
    await this.page.goto(`${env('BASE_URL')}/poa-overview`);
  }

  async verifyPaaFullmaktsoversikt() {
    await expect(this.pageHeading).toBeVisible();
    await expect(this.tilgangspakkerFane).toBeVisible();
  }

  /** Finds a package by search and opens its page. */
  async aapneTilgangspakke(pakkeNavn: string) {
    await this.pakkeSok.fill(pakkeNavn);
    await this.pakkeLenke(pakkeNavn).first().click();
    await expect(this.brukereFane).toBeVisible();
  }

  async goToTjenesterFane() {
    await this.tjenesterFane.click();
    await expect(this.tjenesterFane).toHaveAttribute('aria-selected', 'true');
  }

  /**
   * Finds a user on the package's Brukere tab.
   *
   * The tab lists only a handful of users up front — the ones holding the
   * package plus ER-role holders — so anyone else has to be searched for. The
   * tab's own description says as much: "Søk etter brukere for å gi eller slette
   * fullmakter."
   */
  async sokEtterBruker(navn: string) {
    await this.brukerSok.fill(navn);
  }

  async giFullmakt(navn: string) {
    await this.giFullmaktKnapp(navn).click();
  }

  async slettFullmakt(navn: string) {
    await this.slettFullmaktKnapp(navn).click();
  }
}
