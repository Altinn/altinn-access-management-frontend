import { expect, type Locator, type Page } from '@playwright/test';
import { env } from 'playwright/util/helper';

import { LANGUAGE_DICTIONARIES, Language, type Dict } from '../LanguageMenu';
import { SidebarNav } from '../SidebarNav';

/**
 * Innstillinger (https://am.ui.<env>.altinn.cloud/accessmanagement/ui/settings).
 *
 * The page itself is a list of two rows — "Varslinger på e-post" and "Varslinger
 * på SMS" — that each open a dialog holding the actual address fields. Almost
 * every interaction therefore happens inside `dialog`, so the locators below are
 * scoped to it to avoid matching the row behind the open modal (the row's
 * accessible name repeats the dialog heading).
 */
export class InnstillingerPage {
  readonly page: Page;
  readonly texts: Dict;
  readonly sidebar: SidebarNav;

  readonly pageHeading: Locator;
  readonly notAdminAlert: Locator;
  readonly sectionHeading: Locator;
  readonly emailRow: Locator;
  readonly smsRow: Locator;

  readonly dialog: Locator;
  readonly addMoreButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;
  readonly noAddressesError: Locator;
  readonly savingError: Locator;

  constructor(page: Page, language: Language = Language.NB) {
    this.page = page;
    this.texts = LANGUAGE_DICTIONARIES[language];
    this.sidebar = new SidebarNav(page, language);
    const settings = this.texts.settings_page;

    // page_heading is "Innstillinger for {{name}}" — match the static prefix.
    this.pageHeading = this.page.getByRole('heading', {
      name: settings.page_heading.split('{{name}}')[0].trim(),
    });
    this.notAdminAlert = this.page.getByText(settings.not_admin_alert.split('{{name}}')[0].trim());
    this.sectionHeading = this.page.getByRole('heading', {
      name: settings.alert_settings_heading,
    });

    // Each row is a button whose accessible name starts with the title and then
    // repeats the current addresses and the badge, so this matches as a substring.
    this.emailRow = this.page.getByRole('button', { name: settings.alerts_on_email });
    this.smsRow = this.page.getByRole('button', { name: settings.alerts_on_sms });

    this.dialog = this.page.getByRole('dialog');
    this.addMoreButton = this.dialog.getByRole('button', { name: settings.add_more });
    this.saveButton = this.dialog.getByRole('button', {
      name: this.texts.common.save_changes,
    });
    // Both are `exact` because the dialog also carries an icon-only X button
    // labelled "Lukk dialogvindu", which a substring match on "Lukk" would hit.
    this.cancelButton = this.dialog.getByRole('button', {
      name: this.texts.common.cancel,
      exact: true,
    });
    this.closeButton = this.dialog.getByRole('button', {
      name: this.texts.common.close,
      exact: true,
    });
    this.noAddressesError = this.dialog.getByText(settings.no_addresses_error);
    this.savingError = this.dialog.getByText(settings.error_saving_addresses);
  }

  /** The nth (0-based) email field in the open dialog. Labelled "Adresse 1", "Adresse 2", … */
  emailField(index = 0): Locator {
    return this.dialog.getByRole('textbox', {
      name: this.texts.settings_page.address_number.replace('{{number}}', String(index + 1)),
      exact: true,
    });
  }

  /** The nth (0-based) phone field in the open dialog. Labelled "Telefonnummer 1", … */
  phoneField(index = 0): Locator {
    return this.dialog.getByRole('textbox', {
      name: this.texts.settings_page.phone_number.replace('{{number}}', String(index + 1)),
      exact: true,
    });
  }

  /** The nth (0-based) country code field in the open dialog. Labelled "Landskode 1", … */
  countryCodeField(index = 0): Locator {
    return this.dialog.getByRole('textbox', {
      name: this.texts.settings_page.country_code_number.replace('{{number}}', String(index + 1)),
      exact: true,
    });
  }

  /**
   * The remove button on the nth (0-based) address row.
   *
   * Every remove button carries the same label ("Fjern e-post"/"Fjern telefonnummer")
   * and the rows are plain divs with no role or accessible name of their own, so
   * there is nothing to scope or filter by — the row index is the only thing that
   * distinguishes them. Kept as a method so tests never index locators inline.
   */
  removeEmailButton(index: number): Locator {
    return this.dialog
      .getByRole('button', { name: this.texts.settings_page.remove_email })
      .nth(index);
  }

  removeSmsButton(index: number): Locator {
    return this.dialog
      .getByRole('button', { name: this.texts.settings_page.remove_sms })
      .nth(index);
  }

  /** The client-side validation message shown for a malformed e-mail. */
  get ugyldigEpostFeilmelding(): Locator {
    return this.dialog.getByText(this.texts.text_field_errors.invalid_email_pattern);
  }

  /** The badge on a row: "1 adresse" or "{{count}} adresser". */
  addressCountBadge(count: number): Locator {
    const label =
      count === 1
        ? this.texts.settings_page.one_address
        : this.texts.settings_page.num_of_addresses.replace('{{count}}', String(count));
    return this.page.getByText(label, { exact: true });
  }

  async goToInnstillinger() {
    await this.sidebar.goToInnstillinger();
    await expect(this.pageHeading).toBeVisible();
  }

  /**
   * Opens Innstillinger by URL instead of through the sidebar.
   *
   * The sidebar renders the Innstillinger item only for company profile admins
   * (see `useSidebarItems`), so a user without that right cannot navigate there
   * by clicking — the page has to be opened directly.
   */
  async goToInnstillingerViaUrl() {
    await this.page.goto(`${env('BASE_URL')}/settings`);
  }

  async verifyPaaInnstillinger() {
    await expect(this.pageHeading).toBeVisible();
    await expect(this.sectionHeading).toBeVisible();
  }

  async openEpostDialog() {
    await this.emailRow.click();
    await expect(this.dialog).toBeVisible();
    await expect(this.emailField(0)).toBeVisible();
  }

  async openSmsDialog() {
    await this.smsRow.click();
    await expect(this.dialog).toBeVisible();
    await expect(this.phoneField(0)).toBeVisible();
  }

  async skrivEpost(index: number, email: string) {
    await this.emailField(index).fill(email);
    // The field validates on blur, so move focus off it before saving —
    // otherwise a bad address can still leave the save button enabled.
    await this.emailField(index).blur();
  }

  async skrivTelefonnummer(index: number, countryCode: string, phone: string) {
    await this.countryCodeField(index).fill(countryCode);
    await this.phoneField(index).fill(phone);
    await this.phoneField(index).blur();
  }

  async klikkLeggTilFlere() {
    await this.addMoreButton.click();
  }

  /**
   * Saves the open dialog and closes it once the write has landed.
   *
   * Saving leaves the dialog open, so there is no "dialog gone" event to wait on.
   * The save button is NOT a usable signal either — it is disabled *while* the
   * write is in flight (`isSaving`), so it goes disabled within a few hundred
   * milliseconds and closing on that races the write.
   *
   * The secondary button is the reliable signal: it reads "Avbryt" while there
   * are unsaved changes and flips to "Lukk" only once the refetched addresses
   * match the form. Waiting for it also means a failed save fails loudly here,
   * rather than silently leaving stale values for the assertions to trip over.
   */
  async lagreEndringer() {
    await expect(this.saveButton).toBeEnabled();
    await this.saveButton.click();
    await expect(this.closeButton).toBeVisible();
    await this.closeButton.click();
    await expect(this.dialog).toBeHidden();
  }

  async lukkDialog() {
    // The secondary button reads "Avbryt" while there are unsaved changes and
    // "Lukk" otherwise, so click whichever one is showing.
    const closeOrCancel = this.cancelButton.or(this.closeButton);
    await closeOrCancel.click();
    await expect(this.dialog).toBeHidden();
  }
}
