import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class DelegationPage {
  readonly page: Page;

  readonly accessRightsLink: Locator;
  readonly newBrukerflateLink: Locator;
  readonly tryNewAccessBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accessRightsLink = page.getByRole('link', { name: 'Andre med rettigheter til' });
    this.newBrukerflateLink = page.getByRole('link', { name: 'Klikk her' });
    this.tryNewAccessBtn = page.getByRole('button', { name: 'Prøv ny tilgangsstyring' });
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

    const closeDialogBtn = this.page.getByRole('button', { name: 'Lukk dialogvindu' });
    await expect(closeDialogBtn).toBeVisible();
    await closeDialogBtn.click();
  }

  async addOrganization(orgNumber: string) {
    const orgInput = this.page.getByRole('textbox', { name: 'Organisasjonsnummer' });
    await orgInput.fill(orgNumber);
    const addOrgBtn = this.page.getByRole('button', { name: 'Legg til virksomhet' });
    await addOrgBtn.click();
  }

  async grantAccessPkgName(areaName: string, packageName: string) {
    const searchBox = this.page.getByRole('searchbox', { name: 'Søk etter tilgangspakker' });
    await expect(searchBox).toBeVisible();
    await searchBox.click();
    await searchBox.fill(areaName);

    const areaContainer = this.page.getByRole('search').locator(`text=${areaName}`).first();

    // Step 3: If packageName is provided, delegate that package
    if (packageName) {
      const packageButton = areaContainer
        .getByRole('button', { name: 'Gi fullmakt' })
        .filter({ hasText: packageName })
        .first();

      await expect(packageButton).toBeVisible();
      await packageButton.click();
    } else {
      // If no packageName, delegate the first package in the area
      const firstButton = areaContainer.getByRole('button', { name: 'Gi fullmakt' }).first();
      await expect(firstButton).toBeVisible();
      await firstButton.click();
    }
  }
  async closeAccessModal(buttonName: string = 'Lukk') {
    const closeBtn = this.page.getByRole('button', { name: buttonName });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
  }
}
