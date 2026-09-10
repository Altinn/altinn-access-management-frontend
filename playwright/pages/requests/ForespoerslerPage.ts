import { expect, type Locator, type Page } from '@playwright/test';

import { env, withPoaObject } from 'playwright/util/helper';

import { LANGUAGE_DICTIONARIES, Language, type Dict } from '../LanguageMenu';
import { SidebarNav } from '../SidebarNav';

/** A regex matching text that begins with `value`, with regex chars escaped. */
const startsWith = (value: string): RegExp =>
  new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);

/**
 * Forespørsler (https://am.ui.<env>.altinn.cloud/accessmanagement/ui/requests).
 *
 * The page is two tabs of request rows. Opening a row opens a two-step dialog:
 * a list of the access packages or services being asked for, and — after
 * clicking one — a detail view with the approve/reject buttons for that single
 * item. Bulk approve/reject live on the list step.
 *
 * Locators for the dialog are scoped to `dialog`, because the row behind it
 * repeats the party name in its accessible name.
 */
export class ForespoerslerPage {
  readonly page: Page;
  readonly texts: Dict;
  readonly sidebar: SidebarNav;

  readonly pageHeading: Locator;
  readonly ownRequestsHeading: Locator;
  readonly noAccessAlert: Locator;
  readonly mottatteFane: Locator;
  readonly sendteFane: Locator;

  readonly dialog: Locator;
  readonly godkjennKnapp: Locator;
  readonly avvisKnapp: Locator;
  readonly godkjennAlleKnapp: Locator;
  readonly avvisAlleKnapp: Locator;
  readonly lukkKnapp: Locator;
  readonly godkjentStatus: Locator;
  readonly avvistStatus: Locator;
  readonly kanIkkeGodkjenneVarsel: Locator;

  constructor(page: Page, language: Language = Language.NB) {
    this.page = page;
    this.texts = LANGUAGE_DICTIONARIES[language];
    this.sidebar = new SidebarNav(page, language);
    const requests = this.texts.request_page;

    // heading is "Forespørsler for {{name}}" — match the static prefix.
    this.pageHeading = this.page.getByRole('heading', {
      name: requests.heading.split('{{name}}')[0].trim(),
    });
    // Shown instead of the above when acting as yourself.
    this.ownRequestsHeading = this.page.getByRole('heading', {
      name: requests.your_requests_heading,
    });
    this.noAccessAlert = this.page.getByText(this.texts.common.no_access_to_page);

    // Tab labels carry a count badge, so these match as a substring.
    this.mottatteFane = this.page.getByRole('tab', { name: requests.incoming_requests });
    this.sendteFane = this.page.getByRole('tab', { name: requests.sent_requests });

    this.dialog = this.page.getByRole('dialog');
    // `exact` so "Godkjenn" does not also match "Godkjenn alle".
    this.godkjennKnapp = this.dialog.getByRole('button', {
      name: requests.approve_request,
      exact: true,
    });
    this.avvisKnapp = this.dialog.getByRole('button', {
      name: requests.reject_request,
      exact: true,
    });
    this.godkjennAlleKnapp = this.dialog.getByRole('button', { name: requests.approve_all });
    this.avvisAlleKnapp = this.dialog.getByRole('button', { name: requests.reject_all });
    // `exact` so it does not match the icon-only "Lukk dialogvindu" button.
    this.lukkKnapp = this.dialog.getByRole('button', {
      name: this.texts.common.close,
      exact: true,
    });
    // Anchored rather than exact: the list step shows the bare status word while
    // the detail step renders it inside "{{status}} den {{date}}", so an exact
    // match misses the latter. A plain substring match is too loose in the other
    // direction — it also catches the "Forespørsel godkjent" snackbar, since
    // getByText matches case-insensitively. Anchoring to the start keeps both
    // status renderings and drops the snackbar.
    this.godkjentStatus = this.dialog.getByText(startsWith(requests.review_approved));
    this.avvistStatus = this.dialog.getByText(startsWith(requests.review_rejected));
    this.kanIkkeGodkjenneVarsel = this.dialog.getByText(requests.cannot_approve_package);
  }

  /** The row for one party's pending requests in the active tab. */
  forespoerselRad(partyName: string): Locator {
    return this.page.getByRole('button', { name: partyName });
  }

  /** The "{{name}} ber om disse fullmaktene" dialog heading. */
  dialogOverskrift(partyName: string): Locator {
    return this.page.getByRole('heading', {
      name: this.texts.request_page.review_modal_title.replace('{{fromPartyName}}', partyName),
    });
  }

  /** A single access package row on the dialog's list step. */
  pakkeRad(pakkeNavn: string): Locator {
    return this.dialog.getByRole('button', { name: pakkeNavn });
  }

  /**
   * The "Din forespørsel ... er sendt" dialog, opened from a row in the Sendte tab.
   * Matched on the static prefix before the party name.
   */
  sendtDialogOverskrift(): Locator {
    return this.page.getByRole('heading', {
      name: this.texts.delegation_modal.request.sent_requests_modal_header
        .split('{{partyName}}')[0]
        .trim(),
    });
  }

  /**
   * The button that withdraws one pending package request, in the Sendte dialog.
   *
   * Its visible text is just "Slett", but it carries an aria-label naming the
   * package ("Slett forespørsel for Posttjenester"), which is what makes it
   * addressable when several requests are listed. The label wins over the text
   * for the accessible name.
   */
  slettForespoerselKnapp(pakkeNavn: string): Locator {
    return this.dialog.getByRole('button', {
      name: withPoaObject(this.texts.common.delete_request_for, pakkeNavn),
      exact: true,
    });
  }

  async trekkTilbakeForespoersel(pakkeNavn: string) {
    await this.slettForespoerselKnapp(pakkeNavn).click();
  }

  /** "{{name}} har ingen mottatte forespørsler" — matched on the static tail. */
  get ingenMottatteTekst(): Locator {
    return this.page.getByText(
      this.texts.request_page.no_received_requests.split('{{name}}')[1].trim(),
    );
  }

  async goToForespoersler() {
    await this.sidebar.goToForespoersler();
    await expect(this.pageHeading.or(this.ownRequestsHeading)).toBeVisible();
  }

  /**
   * Opens Forespørsler by URL.
   *
   * The sidebar item is only rendered for users who may see the page, so a user
   * without that right has to open it directly to see the no-access alert.
   */
  async goToForespoerslerViaUrl() {
    await this.page.goto(`${env('BASE_URL')}/requests`);
  }

  async aapneForespoersel(partyName: string) {
    await this.forespoerselRad(partyName).click();
    await expect(this.dialog).toBeVisible();
  }

  async aapnePakke(pakkeNavn: string) {
    await this.pakkeRad(pakkeNavn).click();
  }

  async godkjenn() {
    await this.godkjennKnapp.click();
  }

  async avvis() {
    await this.avvisKnapp.click();
  }

  async godkjennAlle() {
    await this.godkjennAlleKnapp.click();
  }

  async avvisAlle() {
    await this.avvisAlleKnapp.click();
  }

  async lukkDialog() {
    await this.lukkKnapp.click();
    await expect(this.dialog).toBeHidden();
  }

  async goToSendteFane() {
    await this.sendteFane.click();
    await expect(this.sendteFane).toHaveAttribute('aria-selected', 'true');
  }
}
