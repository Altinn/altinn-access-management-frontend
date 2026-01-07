import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class DelegationPage {
  readonly page: Page;

  readonly accessRightsLink: Locator;
  readonly newBrukerflateLink: Locator;
  readonly addUserBtn: Locator;
  readonly addOrgBtn: Locator;
  readonly grantAccessBtn: Locator;
  readonly deleteAccessBtn: Locator;
  readonly deleteUserBtn: Locator;
  readonly confirmDeleteBtn: Locator;
  readonly closeModalBtn: Locator;
  readonly backBtn: Locator;
  readonly ourAcessButton: Locator;
  readonly rightsAccessLink: Locator;
  readonly menubtn: Locator;
  readonly logoutBtn: Locator;
  readonly packageSearchBox: Locator;
  readonly clearSearchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accessRightsLink = page.getByRole('link', { name: 'Andre med rettigheter til' });
    this.newBrukerflateLink = page.getByRole('link', { name: 'Klikk her' });
    this.addUserBtn = page.getByRole('button', { name: 'Legg til Ny bruker' });
    this.addOrgBtn = page.getByRole('button', { name: 'Legg til virksomhet' });
    this.grantAccessBtn = page.getByRole('button', { name: 'Gi fullmakt' });
    this.deleteAccessBtn = page.getByRole('button', { name: 'Slett fullmakt' });
    this.deleteUserBtn = page.getByRole('button', { name: 'Slett bruker' });
    this.confirmDeleteBtn = page.getByRole('button', { name: 'Ja, slett' });
    this.closeModalBtn = page.getByRole('button', { name: 'Lukk' });
    this.backBtn = page.getByRole('button', { name: 'Tilbake' });
    this.ourAcessButton = page.getByRole('button', { name: 'Våre tilganger hos andre' });
    this.rightsAccessLink = page.getByRole('link', {
      name: 'Våre tilganger hos andre',
    });
    this.menubtn = page.getByRole('button', { name: 'Meny' });
    this.logoutBtn = page.getByRole('button', { name: 'Logg ut' });
    this.packageSearchBox = page.locator('role=search >> input[type="search"]').first();
    this.clearSearchButton = page.getByRole('button', { name: /Tøm/ });
  }

  async openDelegationFlow() {
    await expect(this.accessRightsLink).toBeVisible();
    await this.accessRightsLink.click();

    await expect(this.newBrukerflateLink).toBeVisible();
    await this.newBrukerflateLink.click();
  }

  async addUser() {
    const addUserBtn = this.page.getByRole('button', { name: 'Ny bruker' });
    await expect(addUserBtn).toBeVisible();
    await addUserBtn.click();
  }

  async addOrganization(orgNumber: string) {
    await this.page.getByRole('tab', { name: 'Virksomhet' }).click();
    const orgInput = this.page.getByRole('textbox', { name: 'Organisasjonsnummer' });
    await orgInput.fill(orgNumber);
    const addOrgBtn = this.page.getByRole('button', { name: 'Legg til virksomhet' });
    await expect(addOrgBtn).toBeVisible();
    await addOrgBtn.click();

    const openModalButton = this.page.getByRole('button', { name: 'Gi fullmakt' });
    await expect(openModalButton).toBeVisible();
    await openModalButton.click();
  }

  async grantAccessPkgNameDirect(packageName: string) {
    const searchBox = this.packageSearchBox;

    await searchBox.click();
    await searchBox.fill(packageName);

    const grantButton = this.page.getByRole('button', { name: `Gi fullmakt for ${packageName}` });

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

    const grantBtn = modal.getByRole('button', { name: 'Gi fullmakt' });
    await expect(grantBtn).toBeVisible({ timeout: 10000 });
    await grantBtn.click();

    // "Tilbake" from the result screen
    const tilbakeButton = this.page.getByRole('button', { name: 'Tilbake', exact: true });
    await expect(tilbakeButton).toBeVisible({ timeout: 10000 });
    await tilbakeButton.click();
  }

  async closeAccessModal(buttonName: string = 'Lukk') {
    await expect(this.closeModalBtn).toBeVisible();
    await this.closeModalBtn.click();
  }

  async logoutFromBrukerflate() {
    const menuBtn = this.page.getByRole('button', { name: 'Meny' });
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // Click logout
    const logoutBtn = this.page.getByRole('button', { name: 'Logg ut' });
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
      name: `Slett fullmakt for ${packageName}`,
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
    const deleteButton = modal.getByRole('button', { name: 'Slett fullmakt', exact: true });
    await expect(deleteButton).toBeVisible({ timeout: 10000 });
    await deleteButton.click();

    // Close the modal
    const closeButton = this.page.getByRole('button', { name: 'Lukk dialogvindu', exact: true });
    await expect(closeButton).toBeVisible();
    await closeButton.click();
  }

  async deleteDelegatedUser() {
    // Click "Slett bruker" button
    const deleteUserBtn = this.page.getByRole('button', { name: 'Slett bruker', exact: true });
    await expect(deleteUserBtn).toBeVisible({ timeout: 10000 });
    await deleteUserBtn.click();

    // Confirm deletion
    const confirmBtn = this.page.getByRole('button', { name: 'Ja, slett', exact: true });
    await expect(confirmBtn).toBeVisible({ timeout: 10000 });
    await confirmBtn.click();
  }
  async newAccessRights(orgName: string) {
    await this.rightsAccessLink.click();

    //Click on Orgnization
    const orgbButton = this.page.getByRole('button', { name: orgName }).first();
    await expect(orgbButton).toBeVisible();
    await orgbButton.click();

    // TODO FIX THIS
    await this.page.getByText('UUtgått Fleksibel Tiger ASOrg.nr. 312973367').click();
  }

  async chooseOrg(chooseorgName: string) {
    const nameRegex = new RegExp(chooseorgName, 'i');

    // Stage 1: Try clicking button
    const orgButton = this.page.getByRole('button', { name: nameRegex }).first();
    if (await orgButton.isVisible().catch(() => false)) {
      await orgButton.click();
    }

    // Stage 2: Try clicking link inside (after expanding the button)
    const orgLink = this.page.getByRole('link', { name: nameRegex }).first();
    if (await orgLink.isVisible().catch(() => false)) {
      await orgLink.click();
      return;
    }

    throw new Error(`Org "${chooseorgName}" not found as button or link.`);
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
    const backLink = this.page.getByRole('link', { name: 'Tilbake' });
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
