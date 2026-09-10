import { expect, type Locator, type Page } from '@playwright/test';
import { env } from 'playwright/util/helper';

import { LANGUAGE_DICTIONARIES, Language, type Dict } from '../LanguageMenu';
import { SidebarNav } from '../SidebarNav';

/** U+00AD, used in localization strings as a line-break hint. */
const SOFT_HYPHEN = '\u00AD';

/**
 * Maskinporten-administrasjon
 * (https://am.ui.<env>.altinn.cloud/accessmanagement/ui/maskinporten).
 *
 * Two tabs: "Leverandører" (organisations that have received API access from the
 * acting party) and "Konsumenter" (organisations that have given it access).
 * Selecting a supplier opens its own page, where API access is granted or the
 * supplier deleted.
 *
 * The page is only reachable for a Maskinporten administrator — everyone else is
 * redirected to the landing page rather than shown an alert.
 */
export class MaskinportenPage {
  readonly page: Page;
  readonly texts: Dict;
  readonly sidebar: SidebarNav;

  readonly pageHeading: Locator;
  readonly leverandoererFane: Locator;
  readonly konsumenterFane: Locator;
  readonly ingenLeverandoererTekst: Locator;
  readonly ingenKonsumenterTekst: Locator;
  readonly leggTilLeverandoerKnapp: Locator;

  readonly dialog: Locator;
  readonly orgNummerFelt: Locator;
  readonly leggTilVirksomhetKnapp: Locator;

  readonly slettLeverandoerKnapp: Locator;
  readonly slettLeverandoerBekreftKnapp: Locator;
  readonly giFullmaktKnapp: Locator;

  constructor(page: Page, language: Language = Language.NB) {
    this.page = page;
    this.texts = LANGUAGE_DICTIONARIES[language];
    this.sidebar = new SidebarNav(page, language);
    const mp = this.texts.maskinporten_page;

    // heading is "Maskinporten<soft hyphen>administrasjon for {{name}}" — match
    // the part before the soft hyphen, which holds whether or not the accessible
    // name preserves that character.
    this.pageHeading = this.page.getByRole('heading', {
      name: mp.heading.split(SOFT_HYPHEN)[0],
    });
    this.leverandoererFane = this.page.getByRole('tab', { name: mp.suppliers_tab });
    this.konsumenterFane = this.page.getByRole('tab', { name: mp.consumers_tab });
    this.ingenLeverandoererTekst = this.page.getByText(mp.no_suppliers);
    this.ingenKonsumenterTekst = this.page.getByText(mp.no_consumers);

    // The trigger and the dialog heading share this label, so the button is
    // matched outside the dialog and the dialog's own controls are scoped to it.
    this.leggTilLeverandoerKnapp = this.page
      .getByRole('button', { name: mp.add_supplier_button })
      .first();

    this.dialog = this.page.getByRole('dialog');
    this.orgNummerFelt = this.dialog.getByRole('textbox', {
      name: this.texts.common.org_number,
    });
    this.leggTilVirksomhetKnapp = this.dialog.getByRole('button', {
      name: this.texts.new_user_modal.add_org_button,
    });

    // On a supplier's page: the delete trigger and the confirm button in its
    // dialog share the same label, so the trigger is taken outside the dialog.
    this.slettLeverandoerKnapp = this.page
      .getByRole('button', { name: mp.remove_supplier_confirm })
      .first();
    this.slettLeverandoerBekreftKnapp = this.dialog.getByRole('button', {
      name: mp.remove_supplier_confirm,
    });
    this.giFullmaktKnapp = this.page.getByRole('button', { name: mp.add_scope_button });
  }

  /** A supplier or consumer row, by organisation name. */
  connectionRad(orgName: string): Locator {
    return this.page.getByRole('link', { name: orgName });
  }

  async goToMaskinporten() {
    await this.sidebar.goToMaskinporten();
    await expect(this.pageHeading).toBeVisible();
  }

  /**
   * Opens Maskinporten-administrasjon by URL.
   *
   * The sidebar item only renders for a Maskinporten administrator, so a user
   * without that right has to be sent there directly to observe the redirect.
   */
  async goToMaskinportenViaUrl() {
    await this.page.goto(`${env('BASE_URL')}/maskinporten`);
  }

  async verifyPaaMaskinporten() {
    await expect(this.pageHeading).toBeVisible();
    await expect(this.leverandoererFane).toBeVisible();
    await expect(this.konsumenterFane).toBeVisible();
  }

  async goToKonsumenterFane() {
    await this.konsumenterFane.click();
    await expect(this.konsumenterFane).toHaveAttribute('aria-selected', 'true');
  }

  async leggTilLeverandoer(orgNummer: string) {
    await this.leggTilLeverandoerKnapp.click();
    await expect(this.dialog).toBeVisible();
    await this.orgNummerFelt.fill(orgNummer);
    await this.leggTilVirksomhetKnapp.click();
  }

  async aapneLeverandoer(orgName: string) {
    await this.connectionRad(orgName).click();
  }

  async slettLeverandoer() {
    await this.slettLeverandoerKnapp.click();
    await expect(this.dialog).toBeVisible();
    await this.slettLeverandoerBekreftKnapp.click();
  }
}
