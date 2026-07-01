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

  async grantAccessPkgNameDirect(packageName: string) {
    const searchBox = this.packageSearchBox;

    await searchBox.click();
    await searchBox.fill(packageName);

    const grantButton = this.page.getByRole('button', {
      name: withPoaObject(this.texts.common.give_poa_for, packageName),
    });

    await expect(grantButton).toBeVisible({ timeout: 10000 });
    await grantButton.click();

    // Clear search so the next package starts fresh
    await expect(this.clearSearchButton).toBeVisible();
    await this.clearSearchButton.click();
  }

  async grantAccessPkgName(packageName: string) {
    const searchBox = this.packageSearchBox;

    await searchBox.waitFor({ state: 'visible', timeout: 15000 });
    await searchBox.click();
    await searchBox.fill(packageName);

    const packageButton = this.page.getByRole('button', { name: packageName, exact: true });

    await expect(packageButton).toBeVisible({ timeout: 10000 });
    await packageButton.click();

    const modal = this.page.getByRole('dialog').first();
    await expect(modal).toBeVisible({ timeout: 10000 });

    const grantBtn = modal.getByRole('button', {
      name: this.texts.access_packages.give_new_button,
    });
    await expect(grantBtn).toBeVisible({ timeout: 10000 });
    await grantBtn.click();

    // "Tilbake" from the result screen
    const tilbakeButton = this.page.getByRole('button', {
      name: this.texts.common.back,
      exact: true,
    });
    await expect(tilbakeButton).toBeVisible({ timeout: 10000 });
    await tilbakeButton.click();
  }

  async closeAccessModal(buttonName: string = 'Lukk') {
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
  async verifyDelegatedPackage(areaName: string, pacakageName: string) {
    const areaBtn = this.page.getByRole('list').getByRole('button', { name: areaName }).first();
    await expect(areaBtn).toBeVisible();
    await areaBtn.click();

    const packageBtn = this.page.getByRole('button', { name: pacakageName, exact: true });
    await expect(packageBtn).toBeVisible();
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

    // 2. Click org button
    const orgButton = this.page.getByRole('button', { name: orgButtonName });
    await expect(orgButton).toBeVisible({ timeout: 10_000 });
    await orgButton.click();

    // 3. Click key role user
    const keyUserLink = this.page.getByRole('link', { name: keyRoleUserName });
    await expect(keyUserLink).toBeVisible({ timeout: 10_000 });
    await keyUserLink.click();

    // 4. Verify all expected packages
    await this.verifyDelegatedPackages(expectations);
  }
}
