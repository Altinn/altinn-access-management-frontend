import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class DelegationPage {
  readonly page: Page;

  readonly accessRightsLink: Locator;
  readonly newBrukerflateLink: Locator;
  readonly tryNewAccessBtn: Locator;
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
  readonly rightsNewBrukerFlateLink: Locator;
  readonly menubtn: Locator;
  readonly logoutBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accessRightsLink = page.getByRole('link', { name: 'Andre med rettigheter til' });
    this.newBrukerflateLink = page.getByRole('link', { name: 'Klikk her' });
    this.tryNewAccessBtn = page.getByRole('button', { name: 'Prøv ny tilgangsstyring' });
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
      name: 'Rettigheter virksomheten har hos andre',
    });
    this.rightsNewBrukerFlateLink = page.getByRole('link', { name: 'Klikk her for å se disse' });
    this.menubtn = page.getByRole('button', { name: 'Meny' });
    this.logoutBtn = page.getByRole('button', { name: 'Logg ut' });
  }

  async openDelegationFlow() {
    await expect(this.accessRightsLink).toBeVisible();
    await this.accessRightsLink.click();

    await expect(this.newBrukerflateLink).toBeVisible();
    await this.newBrukerflateLink.click();

    await expect(this.tryNewAccessBtn).toBeVisible();
    await this.tryNewAccessBtn.click();
  }

  async addUser() {
    const addUserBtn = this.page.getByRole('button', { name: 'Legg til Ny bruker' });
    await expect(addUserBtn).toBeVisible();
    await addUserBtn.click();
  }

  async addOrganization(orgNumber: string) {
    const orgInput = this.page.getByRole('textbox', { name: 'Organisasjonsnummer' });
    await orgInput.fill(orgNumber);
    const addOrgBtn = this.page.getByRole('button', { name: 'Legg til virksomhet' });
    await addOrgBtn.click();

    const openModalButton = this.page.getByRole('button', { name: 'Gi fullmakt' });
    await expect(openModalButton).toBeVisible();
    await openModalButton.click();
  }

  async grantAccessPkgNameDirect(areaName: string, packageName: string, orgName: string) {
    const searchBox = this.page.getByRole('searchbox', { name: 'Søk etter tilgangspakker' });
    await expect(searchBox).toBeVisible();
    await searchBox.fill(areaName);

    // Step 2: Find the list item containing the package name and click on packageName
    const grantButton = this.page.getByRole('button', { name: `Gi fullmakt for ${packageName}` });
    await grantButton.click();

    // Step 3: Verify the alert message appears inside the dialog
    /* const dialog = this.page.getByRole('dialog');
     const expectedMsg = `${orgName} har nå fått tilgang til ${packageName}`;
     const alertMsg = dialog.locator(`text=${expectedMsg}`);
     await expect(alertMsg).toBeVisible({ timeout: 5000 }); */
  }

  async grantAccessPkgName(areaName: string, packageName: string) {
    const searchBox = this.page.getByRole('searchbox', { name: 'Søk etter tilgangspakker' });
    await expect(searchBox).toBeVisible();
    await searchBox.fill(areaName);

    const modal = this.page.locator('dialog[open]');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Find the package container inside modal
    const packageItem = modal.getByRole('button', { name: packageName, exact: true });
    await expect(packageItem).toBeVisible({ timeout: 10000 });
    await packageItem.click();

    // Find the "Gi fullmakt" button inside package container
    const grantBtn = modal.getByRole('button').filter({ hasText: 'Gi fullmakt' }).first();
    await expect(grantBtn).toBeVisible({ timeout: 10000 });
    await grantBtn.click();

    const lukkButton = this.page.getByRole('button', { name: 'Tilbake', exact: true });
    await lukkButton.click();
  }

  async closeAccessModal(buttonName: string = 'Lukk') {
    const closeBtn = this.page.getByRole('button', { name: buttonName });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
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
    await this.rightsNewBrukerFlateLink.click();

    //Click on Orgnization
    const orgLink = this.page.getByRole('link', { name: orgName });
    await expect(orgLink).toBeVisible();
    await orgLink.click();
  }

  async verifyDelegatedPacakge(areanames: string, pacakageName: string) {
    const areaBtn = this.page.getByRole('button', { name: areanames });
    await expect(areaBtn).toBeVisible();
    await areaBtn.click();

    const packageBtn = this.page.getByRole('button', { name: pacakageName, exact: true });
    await expect(packageBtn).toBeVisible();
  }
}
