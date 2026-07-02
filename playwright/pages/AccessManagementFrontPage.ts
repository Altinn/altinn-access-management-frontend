import { expect, type Locator, type Page } from '@playwright/test';

import { SidebarNav } from './SidebarNav';
import { LANGUAGE_DICTIONARIES, Language, type Dict } from './LanguageMenu';
import { withPoaObject } from '../util/helper';

export class AccessManagementFrontPage {
  readonly page: Page;
  readonly texts: Dict;
  readonly sidebar: SidebarNav;
  readonly newUserButton: Locator;
  readonly singleServicesTab: Locator;
  readonly singleServicesPanel: Locator;

  constructor(page: Page, language: Language = Language.NB) {
    this.page = page;
    this.texts = LANGUAGE_DICTIONARIES[language];

    this.sidebar = new SidebarNav(page, language);
    this.newUserButton = this.page.getByRole('button', {
      name: this.texts.new_user_modal.trigger_button,
    });
    this.singleServicesTab = this.page.getByRole('tab', {
      name: this.texts.user_rights_page.single_rights_title,
    });
    this.singleServicesPanel = this.page.getByRole('tabpanel', {
      name: this.texts.user_rights_page.single_rights_title,
    });
  }

  get systemUserMenuLink(): Locator {
    return this.sidebar.systemAccess;
  }

  get usersLink(): Locator {
    return this.sidebar.users;
  }

  get powersOfAttorneyLink(): Locator {
    return this.sidebar.powersOfAttorney;
  }

  get ourAccessAtOthersLink(): Locator {
    return this.sidebar.reportees;
  }

  get consentAndPowerOfAttorneyAgreementsLink(): Locator {
    return this.sidebar.consent;
  }

  get klientadministrasjonButton(): Locator {
    return this.sidebar.clientAdministration;
  }

  async goToKlientAdministrasjon() {
    await this.sidebar.goToKlientAdministrasjon();
  }

  async goToUsers() {
    await this.sidebar.goToUsers();
  }

  async expandOrg(org: string) {
    await this.page.getByRole('button', { name: org }).click();
  }

  async clickUser(userName: string, num = 0) {
    await this.page.getByRole('link', { name: userName }).nth(num).click();
  }

  async goToEnkelttjenester() {
    await this.singleServicesTab.click();
    // Vent til fanen er valgt og innholdet er lastet før vi gjør noe i panelet.
    // Overskriften matcher både entall og flertall («Fullmakt til N enkelttjeneste(r)»).
    await expect(this.singleServicesTab).toHaveAttribute('aria-selected', 'true');
    await expect(this.singleServicesPanel).toBeVisible();
    await expect(this.page.getByText(/Fullmakt til \d+ enkelttjeneste/)).toBeVisible();
  }

  async goToFullmakterHosAndre() {
    await this.sidebar.goToFullmakterHosAndre();
  }

  async sokEtterEnkelttjeneste(tjenesteNavn: string) {
    await this.page
      .getByPlaceholder(this.texts.resource_list.resource_search_placeholder)
      .nth(1)
      .fill(tjenesteNavn);
  }

  async clickEnkelttjeneste(tjenesteNavn: string) {
    await this.page.getByRole('button', { name: tjenesteNavn }).first().click();
  }

  async expectEnkelttjenesteToBeDelegable(tjenesteNavn: string) {
    await expect(this.page.getByRole('button', { name: tjenesteNavn }).first()).toBeVisible();
  }

  async clickGiFullmakt() {
    // Begrens til det aktive fanepanelet og bruk eksakt navn, slik at vi ikke
    // treffer skjulte «Gi fullmakt»- eller «Gi fullmakt for …»-knapper i det
    // inaktive panelet (som ligger først i DOM-en).
    await this.page
      .getByRole('tabpanel')
      .getByRole('button', { name: this.texts.access_packages.give_new_button, exact: true })
      .click();
  }

  async clickGiFullmaktEnkelttjeneste() {
    await this.page
      .getByRole('dialog')
      .getByRole('button', { name: this.texts.access_packages.give_new_button, exact: true })
      .click();
  }

  async goToArea(areaName: string) {
    // The area list renders either inside the delegation dialog (when giving a
    // new fullmakt) or inline on the user-detail page (when viewing/deleting
    // existing ones). When the dialog is open the same-named area button also
    // exists on the page behind it, and the modal overlay intercepts the click —
    // so scope to the dialog when present, otherwise use the page.
    const scope = await this.currentScope();
    const area = scope.getByRole('button', { name: areaName });
    await expect(area).toBeVisible();
    await area.click();

    await expect(area).toHaveAttribute('aria-expanded', 'true');
  }

  /**
   * The locator scope for delegation controls: the open dialog if there is one,
   * otherwise the whole page. Keeps selectors unambiguous whether the flow runs
   * in the delegation modal or inline on the user-detail page.
   */
  private async currentScope(): Promise<Locator | Page> {
    // Wait briefly for a dialog rather than taking an instant snapshot: a call
    // right after opening a modal could otherwise fall back to the page and hit
    // the covered background controls. No dialog within the window → inline flow.
    const dialog = this.page.getByRole('dialog').first();
    try {
      await expect(dialog).toBeVisible({ timeout: 1000 });
      return dialog;
    } catch {
      return this.page;
    }
  }

  async expectAccessPackageToBeDelegable(packageName: string) {
    // Scoped to the open dialog (when present) so we don't assert against the
    // identically-named button on the page behind the modal. `exact` so
    // "...Tilgangsstyrer" doesn't also match "...Tilgangsstyrer for enkeltmeldinger...".
    const scope = await this.currentScope();
    await expect(
      scope.getByRole('button', {
        name: withPoaObject(this.texts.common.give_poa_for, packageName),
        exact: true,
      }),
    ).toBeVisible();
  }

  async userCanDeletePackage(packageName: string) {
    await expect(
      this.page.getByRole('button', {
        name: withPoaObject(this.texts.common.delete_poa_for, packageName),
        exact: true,
      }),
    ).toBeVisible();
  }

  async expectUserToHavePackage(packageName: string) {
    await expect(this.page.getByRole('button', { name: packageName })).toBeVisible();
  }

  async userCanDeleteEnkelttjeneste(resourceName: string) {
    await expect(this.page.getByRole('button', { name: 'Slett ' + resourceName })).toBeVisible();
  }

  async expectUserToHaveEnkelttjeneste(tjenesteNavn: string) {
    await expect(this.page.getByText(tjenesteNavn)).toBeVisible();
  }

  async clickSlettFullmaktForTilgangspakke(packageName: string) {
    await this.page
      .getByRole('button', {
        name: withPoaObject(this.texts.common.delete_poa_for, packageName),
        exact: true,
      })
      .click();
  }

  async clickSlettEnkelttjeneste(resourceName: string) {
    await this.page
      .getByRole('button', { name: 'Slett ' + resourceName })
      .first()
      .click();
  }

  async clickGiFullmaktForTilgangspakke(packageName: string) {
    const giFullmaktKnapp = this.page.getByRole('button', {
      name: withPoaObject(this.texts.common.give_poa_for, packageName),
      exact: true,
    });
    await expect(giFullmaktKnapp).toBeVisible();
    await giFullmaktKnapp.click();
    await this.userCanDeletePackage(packageName);
  }

  async clickAccessAreaInPopup(areaName: string) {
    await this.page.getByRole('search').getByRole('button', { name: areaName }).click();
  }

  async expectAccessPackageToNotBeDelegable(packageName: string) {
    // Scope to the dialog (when open) like the positive check, so we don't match
    // a control behind an open modal.
    const scope = await this.currentScope();
    await expect(
      scope.getByRole('button', {
        name: withPoaObject(this.texts.common.give_poa_for, packageName),
        exact: true,
      }),
    ).not.toBeVisible();
  }

  async expectPowerOfAttorneyButtonToNotBeVisible() {
    await expect(
      this.page.getByRole('button', {
        name: this.texts.access_packages.give_new_button,
        exact: true,
      }),
    ).not.toBeVisible();
  }

  async expectOthersWithRightsListToBeVisible() {
    await expect(
      this.page.getByRole('heading', { name: this.texts.users_page.user_list_heading }),
    ).toBeVisible();
  }

  async expectOthersWithRightsListToNotBeVisible() {
    await expect(
      this.page.getByRole('heading', { name: this.texts.users_page.user_list_heading }),
    ).not.toBeVisible();
  }

  async clickLeggTilBruker() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.newUserButton.click();
  }

  async LukkGiFullmaktVindu() {
    await this.page.getByRole('button', { name: this.texts.common.close }).click();
  }

  async addPerson(fnr: string, lastName: string) {
    await this.page
      .getByRole('textbox', { name: this.texts.new_user_modal.person_identifier })
      .fill(fnr);
    await this.page.getByRole('textbox', { name: this.texts.common.last_name }).fill(lastName);
    await this.page
      .getByRole('button', { name: this.texts.new_user_modal.add_person_button })
      .click();
  }
  async addOrg(orgNo: string) {
    const virksomhetTab = this.page.getByRole('tab', {
      name: this.texts.new_user_modal.organization,
    });
    await expect(virksomhetTab).toBeVisible();
    await virksomhetTab.click();
    const orgNoField = this.page.getByRole('textbox', { name: this.texts.common.org_number });
    await orgNoField.fill(orgNo);
    await this.page.getByRole('button', { name: this.texts.new_user_modal.add_org_button }).click();
  }
}
