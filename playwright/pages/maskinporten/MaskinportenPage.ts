import { expect, type Locator, type Page } from '@playwright/test';
import { env, withPoaObject } from 'playwright/util/helper';

import { LANGUAGE_DICTIONARIES, Language, type Dict } from '../LanguageMenu';
import { SidebarNav } from '../SidebarNav';

/** U+00AD, used in localization strings as a line-break hint. */
const SOFT_HYPHEN = '\u00AD';

/**
 * A pattern matching the static part of a localized heading — everything before
 * the {{name}} placeholder.
 *
 * Two things make a plain string match unreliable here. The Norwegian headings
 * carry a soft hyphen that may or may not survive into the accessible name, so
 * it is matched optionally. And the placeholder has to be dropped rather than
 * matched literally, which the English heading (no soft hyphen) would otherwise
 * keep. Anchored at the start so it cannot match an unrelated heading.
 */
const headingPrefix = (template: string): RegExp => {
  const pattern = template
    .split('{{name}}')[0]
    .trim()
    .split(SOFT_HYPHEN)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join(`${SOFT_HYPHEN}?`);
  return new RegExp(`^${pattern}`);
};

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

    this.pageHeading = this.page.getByRole('heading', { name: headingPrefix(mp.heading) });
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

  /**
   * The "Fullmakt til N API" heading on a supplier's page.
   *
   * Matched as an anchored pattern with the count filled in, because the scope
   * modal's own heading ("Hvilke API vil du gi X fullmakt til?") also contains
   * "fullmakt til" and would otherwise collide.
   */
  delegerteApiOverskrift(antall: number): Locator {
    return this.page.getByRole('heading', {
      name: this.texts.maskinporten_page.delegated_resources_heading.replace(
        '{{count}}',
        String(antall),
      ),
      exact: true,
    });
  }

  /** The search field inside the "Gi fullmakt" scope modal. */
  get apiSokefelt(): Locator {
    return this.dialog.getByPlaceholder(this.texts.maskinporten_page.search_api_placeholder);
  }

  /**
   * The "Gi fullmakt for {{api}}" button on a search-result row.
   *
   * Each row carries its own grant button, so there is no need to open the
   * scope's detail step first. The button's visible text is just "Gi fullmakt";
   * the API name comes from its aria-label, which is what makes it addressable.
   */
  giFullmaktForApiKnapp(apiTittel: string): Locator {
    return this.dialog.getByRole('button', {
      name: withPoaObject(this.texts.common.give_poa_for, apiTittel),
      exact: true,
    });
  }

  /**
   * The "Slett fullmakt for {{api}}" button on a granted API's row.
   *
   * Visible text is just "Slett fullmakt"; the API name lives in the aria-label,
   * which is what distinguishes one row from another.
   */
  slettApiFullmaktKnapp(apiTittel: string): Locator {
    return this.page.getByRole('button', {
      name: withPoaObject(this.texts.common.delete_poa_for, apiTittel),
      exact: true,
    });
  }

  /** Shown on a supplier's page when it has no API access at all. */
  get ingenDelegerteApiTekst(): Locator {
    return this.page.getByText(this.texts.maskinporten_page.no_delegated_resources);
  }

  /** The row for an API already granted to the supplier. */
  delegertApi(apiTittel: string): Locator {
    return this.page.getByRole('button', { name: apiTittel });
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

  /**
   * Grants the open supplier access to one API, through the scope modal.
   *
   * Search first: the catalogue holds hundreds of APIs, so the wanted one is not
   * in the initial page of results.
   */
  async giFullmaktTilApi(apiTittel: string) {
    await this.giFullmaktKnapp.click();
    await expect(this.dialog).toBeVisible();
    await this.apiSokefelt.fill(apiTittel);
    await this.giFullmaktForApiKnapp(apiTittel).click();
    // The modal stays open after granting, so close it to get the supplier's
    // page (and its "Fullmakt til N API" list) back in view.
    await this.dialog.getByRole('button', { name: this.texts.common.close, exact: true }).click();
    await expect(this.dialog).toBeHidden();
  }

  async slettApiFullmakt(apiTittel: string) {
    await this.slettApiFullmaktKnapp(apiTittel).click();
  }

  async slettLeverandoer() {
    await this.slettLeverandoerKnapp.click();
    await expect(this.dialog).toBeVisible();
    await this.slettLeverandoerBekreftKnapp.click();
  }
}
