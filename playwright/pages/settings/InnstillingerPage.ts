import { expect, type Locator, type Page } from '@playwright/test';
import { env } from 'playwright/util/helper';

import { LANGUAGE_DICTIONARIES, Language, type Dict } from '../LanguageMenu';
import { SidebarNav } from '../SidebarNav';

type SmsAddress = { countryCode: string; phone: string };

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
  readonly emailAddressCount: Locator;

  readonly dialog: Locator;
  readonly emailRows: Locator;
  readonly emailFields: Locator;
  readonly smsRows: Locator;
  readonly phoneFields: Locator;
  readonly countryCodeFields: Locator;
  readonly addMoreButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;
  readonly noAddressesError: Locator;
  readonly savingError: Locator;
  readonly ugyldigEpostFeilmelding: Locator;

  constructor(page: Page, language: Language = Language.NB) {
    this.page = page;
    this.texts = LANGUAGE_DICTIONARIES[language];
    this.sidebar = new SidebarNav(page, language);
    const settings = this.texts.settings_page;

    this.pageHeading = this.page.getByTestId('settings-page-heading');
    this.notAdminAlert = this.page.getByTestId('settings-not-admin-alert');
    this.sectionHeading = this.page.getByRole('heading', {
      name: settings.alert_settings_heading,
    });

    // Each row is a button whose accessible name starts with the title and then
    // repeats the current addresses and the badge, so this matches as a substring.
    this.emailRow = this.page.getByRole('button', { name: settings.alerts_on_email });
    this.smsRow = this.page.getByRole('button', { name: settings.alerts_on_sms });
    this.emailAddressCount = this.page.getByTestId('email-address-count');

    this.dialog = this.page.getByRole('dialog');
    this.emailRows = this.dialog.getByTestId('email-address-row');
    this.emailFields = this.emailRows.getByTestId('email-address');
    this.smsRows = this.dialog.getByTestId('sms-address-row');
    this.phoneFields = this.smsRows.getByTestId('sms-phone');
    this.countryCodeFields = this.smsRows.getByTestId('sms-country-code');
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
    this.ugyldigEpostFeilmelding = this.dialog.getByText(
      this.texts.text_field_errors.invalid_email_pattern,
    );
  }

  /** Find a controlled email input by its exact value, regardless of row order. */
  emailField(email: string): Locator {
    return this.emailFields.and(this.dialog.locator(`input[value=${JSON.stringify(email)}]`));
  }

  /** Match both values to distinguish local numbers with different country codes. */
  private smsAddressRow(address: SmsAddress): Locator {
    return this.smsRows
      .filter({ has: this.page.locator(`input[value=${JSON.stringify(address.phone)}]`) })
      .filter({ has: this.page.locator(`input[value=${JSON.stringify(address.countryCode)}]`) });
  }

  /** Find the remove button in the row containing this email address. */
  removeEmailButton(email: string): Locator {
    return this.emailRows
      .filter({ has: this.page.locator(`input[value=${JSON.stringify(email)}]`) })
      .getByRole('button', { name: this.texts.settings_page.remove_email, exact: true });
  }

  removeSmsButton(address: SmsAddress): Locator {
    return this.smsAddressRow(address).getByRole('button', {
      name: this.texts.settings_page.remove_sms,
      exact: true,
    });
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
    await expect(this.emailFields.first()).toBeVisible();
  }

  async openSmsDialog() {
    await this.smsRow.click();
    await expect(this.dialog).toBeVisible();
    await expect(this.smsRows.first()).toBeVisible();
  }

  async skrivEpost(currentEmail: string, email: string) {
    await this.emailField(currentEmail).fill(email);
    // The field validates on blur, so move focus off it before saving —
    // otherwise a bad address can still leave the save button enabled.
    await this.emailField(email).blur();
  }

  async leggTilTelefonnummer(address: SmsAddress) {
    await expect(this.phoneFields).toHaveValue('');
    await this.countryCodeFields.fill(address.countryCode);
    await this.phoneFields.fill(address.phone);
    await this.phoneFields.blur();
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
