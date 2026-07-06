import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

import { LANGUAGE_DICTIONARIES, Language, type Dict } from '../LanguageMenu';
import { withPoaObject } from '../../util/helper';

export class DelegationPage {
  readonly page: Page;
  readonly texts: Dict;

  readonly addUserBtn: Locator;
  readonly addOrgBtn: Locator;
  readonly grantAccessBtn: Locator;
  readonly deleteAccessBtn: Locator;
  readonly deleteUserBtn: Locator;
  readonly confirmDeleteBtn: Locator;
  readonly closeModalBtn: Locator;
  readonly backBtn: Locator;
  readonly menubtn: Locator;
  readonly logoutBtn: Locator;
  readonly packageSearchBox: Locator;
  readonly clearSearchButton: Locator;

  constructor(page: Page, language: Language = Language.NB) {
    this.page = page;
    this.texts = LANGUAGE_DICTIONARIES[language];

    this.addUserBtn = page.getByRole('button', { name: this.texts.new_user_modal.trigger_button });
    this.addOrgBtn = page.getByRole('button', { name: this.texts.new_user_modal.add_org_button });
    this.grantAccessBtn = page.getByRole('button', {
      name: this.texts.access_packages.give_new_button,
    });
    this.deleteAccessBtn = page.getByRole('button', { name: this.texts.common.delete_poa });
    this.deleteUserBtn = page.getByRole('button', {
      name: this.texts.delete_user.user_trigger_button,
    });
    this.confirmDeleteBtn = page.getByRole('button', { name: this.texts.common.yes_delete });
    this.closeModalBtn = page.getByRole('button', { name: this.texts.common.close });
    this.backBtn = page.getByRole('button', { name: this.texts.common.back });
    this.menubtn = page.getByRole('button', { name: this.texts.header['menu-label'] });
    this.logoutBtn = page.getByRole('button', { name: this.texts.header.log_out });
    // Scoped to the access-package delegation dialog: the same searchbox name
    // also exists on the page behind the modal, so an unscoped locator matches two.
    this.packageSearchBox = page
      .getByRole('dialog', { name: this.texts.delegation_modal.aria_label.access_package })
      .getByRole('searchbox', { name: this.texts.access_packages.search_label });
    this.clearSearchButton = page.getByRole('button', { name: /Tøm/ });
  }

  async addUser() {
    const addUserBtn = this.page.getByRole('button', {
      name: this.texts.new_user_modal.trigger_button,
    });
    await expect(addUserBtn).toBeVisible();
    await addUserBtn.click();
  }

  async addOrganization(orgNumber: string) {
    await this.page.getByRole('tab', { name: this.texts.new_user_modal.organization }).click();
    const orgInput = this.page.getByRole('textbox', { name: this.texts.common.org_number });
    await orgInput.fill(orgNumber);
    const addOrgBtn = this.page.getByRole('button', {
      name: this.texts.new_user_modal.add_org_button,
    });
    await expect(addOrgBtn).toBeVisible();
    await addOrgBtn.click();

    const openModalButton = this.page.getByRole('button', {
      name: this.texts.access_packages.give_new_button,
    });
    await expect(openModalButton).toBeVisible();
    await openModalButton.click();
  }

  /**
   * Delegerer en tilgangspakke fra søket i delegeringsmodalen. Klikker den
   * innebygde «Gi fullmakt for {pakke}»-knappen på pakkeraden (samme knapp for
   * alle pakker — pakkenavnet ligger i knappens `aria-label`, ikke som egen
   * knapp), og tømmer søket så neste pakke starter rent.
   */
  async grantAccessPkgName(packageName: string) {
    const searchBox = this.packageSearchBox;
    await searchBox.waitFor({ state: 'visible', timeout: 15000 });

    const grantButton = this.page.getByRole('button', {
      name: withPoaObject(this.texts.common.give_poa_for, packageName),
      exact: true,
    });

    // Søkefeltet gjenbrukes mellom pakkene og kan re-rendre rett etter forrige
    // tømming (React), så et enkelt `fill` kan bli forkastet før lista filtreres.
    // Fyll på nytt til «Gi fullmakt»-knappen dukker opp, i stedet for å stole på
    // at første tastetrykk «tar».
    await expect(async () => {
      await searchBox.fill('');
      await searchBox.fill(packageName);
      await expect(grantButton).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 15000 });

    await grantButton.click();

    // Tøm søket så neste pakke starter rent.
    await expect(this.clearSearchButton).toBeVisible();
    await this.clearSearchButton.click();
  }

  async closeAccessModal() {
    await expect(this.closeModalBtn).toBeVisible();
    await this.closeModalBtn.click();
  }

  async logoutFromBrukerflate() {
    const menuBtn = this.page.getByRole('button', { name: this.texts.header['menu-label'] });
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // Click logout
    const logoutBtn = this.page.getByRole('button', { name: this.texts.header.log_out });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    await this.page.context().clearCookies();
  }

  // Delete delegated package directly from area list
  async deleteDelegatedPackage(areaName: string, packageName: string) {
    const areaButton = this.page.getByRole('button', { name: areaName });
    await expect(areaButton).toBeVisible();
    await areaButton.click();

    const deleteButton = this.page.getByRole('button', {
      name: withPoaObject(this.texts.common.delete_poa_for, packageName),
    });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
  }

  //Delete package by opening package first
  async deletePackageInside(packageAreaName: string, accesspackageName: string) {
    const areaButton = this.page.getByRole('button', { name: packageAreaName, exact: true });
    await expect(areaButton).toBeVisible({ timeout: 10000 });
    await areaButton.click();

    // Find the specific package row inside the modal
    const packageRow = this.page.getByRole('button', { name: accesspackageName, exact: true });
    await expect(packageRow).toBeVisible({ timeout: 10000 });
    await packageRow.click();

    const modal = this.page.locator('dialog[open]');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Click the "Slett fullmakt" button inside that specific package row
    const deleteButton = modal.getByRole('button', {
      name: this.texts.common.delete_poa,
      exact: true,
    });
    await expect(deleteButton).toBeVisible({ timeout: 10000 });
    await deleteButton.click();

    // Close the modal ("Lukk dialogvindu" has no matching localization key — kept literal)
    const closeButton = this.page.getByRole('button', { name: 'Lukk dialogvindu', exact: true });
    await expect(closeButton).toBeVisible();
    await closeButton.click();
  }

  async deleteDelegatedUser() {
    // Click "Slett bruker" button
    const deleteUserBtn = this.page.getByRole('button', {
      name: this.texts.delete_user.user_trigger_button,
      exact: true,
    });
    await expect(deleteUserBtn).toBeVisible({ timeout: 10000 });
    await deleteUserBtn.click();

    // Confirm deletion
    const confirmBtn = this.page.getByRole('button', {
      name: this.texts.delete_user.yes_button,
      exact: true,
    });
    await expect(confirmBtn).toBeVisible({ timeout: 10000 });
    await confirmBtn.click();
  }
  async verifyDelegatedPackage(areaName: string, packageName: string) {
    const areaBtn = this.page.getByRole('list').getByRole('button', { name: areaName }).first();
    await expect(areaBtn).toBeVisible();

    // Området må være utvidet for at pakken skal vises. Klikk bare når det ikke
    // allerede er åpent (et klikk på et åpent område kollapser det).
    if ((await areaBtn.getAttribute('aria-expanded')) !== 'true') {
      await areaBtn.click();
      await expect(areaBtn).toHaveAttribute('aria-expanded', 'true');
    }

    // Pakkeknappen har navnet «{pakkenavn} {n} tjenester» (arvet pakke) eller
    // «Slett fullmakt for {pakkenavn}» (direkte delegert, med slett-kontroll).
    // Begge inneholder pakkenavnet, så et ikke-eksakt navnetreff dekker begge
    // uten spesialtilfeller.
    await expect(this.page.getByRole('button', { name: packageName }).first()).toBeVisible({
      timeout: 10000,
    });
  }

  async verifyDelegatedPackages(expectations: { areaName: string; packageName: string }[]) {
    for (const { areaName, packageName } of expectations) {
      await this.verifyDelegatedPackage(areaName, packageName);
    }
  }

  async verifyKeyRoleUserHasDelegatedPackages(
    orgButtonName: string,
    keyRoleUserName: string,
    expectations: { areaName: string; packageName: string }[],
  ) {
    // 1. Back to brukerpanel
    const backLink = this.page.getByRole('link', { name: this.texts.common.back });
    await expect(backLink).toBeVisible();
    await backLink.click();

    // 2. Filtrer brukerlista på virksomheten. Lista er paginert («Se mer»), og
    // en tilfeldig avgiver-org kan ha mange rettighetshavere, så mottakeren
    // ligger ofte forbi første side hvis vi ikke søker den fram.
    const search = this.page.getByPlaceholder(this.texts.users_page.user_search_placeholder);
    await expect(search).toBeVisible();
    await search.fill(orgButtonName);
    await this.page.waitForLoadState('networkidle').catch(() => {});

    // 3. Utvid virksomhetsraden (en knapp med arvende nøkkelrolle-brukere) og
    // gå til nøkkelrolle-brukeren. Søke-re-renderet kan kollapse raden og
    // detache lenka midt i et klikk ("element detached"), så vi navigerer via
    // lenkas href i stedet — utvid→les href→naviger som én atomær operasjon.
    const orgButton = this.page.getByRole('button', { name: orgButtonName }).first();
    const keyUserLink = this.page.getByRole('link', { name: keyRoleUserName });
    await expect(async () => {
      if ((await keyUserLink.count()) === 0) {
        await expect(orgButton).toBeVisible({ timeout: 5_000 });
        await orgButton.click();
        await expect(keyUserLink.first()).toBeVisible({ timeout: 3_000 });
      }
      const href = await keyUserLink.first().getAttribute('href');
      if (!href) {
        throw new Error(`Fant ingen href på lenka for "${keyRoleUserName}" (raden re-rendrer).`);
      }
      await this.page.goto(new URL(href, this.page.url()).toString());
    }).toPass({ timeout: 25_000 });

    // 4. Verify all expected packages
    await this.verifyDelegatedPackages(expectations);
  }
}
