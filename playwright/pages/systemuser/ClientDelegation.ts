// playwright/pages/ClientDelegationPage.ts
import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class ClientDelegationPage {
  readonly page: Page;

  readonly confirmButton: Locator;
  readonly addCustomerButton: Locator;
  readonly confirmAndCloseButton: Locator;
  readonly deleteSystemAccessButtons: Locator;
  readonly modifyCustomersButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.confirmButton = page.getByRole('button', { name: 'Godkjenn' });
    this.addCustomerButton = page.getByRole('button', { name: 'Legg til kunder' });
    this.modifyCustomersButton = page.getByRole('button', { name: 'Legg til eller fjern kunder' });
    this.confirmAndCloseButton = page.getByRole('button', { name: 'Bekreft og lukk' });
    this.deleteSystemAccessButtons = page.getByRole('button', { name: 'Slett systemtilgang' });
  }

  accessPackageModal(name: string): Locator {
    return this.page.getByRole('link', { name });
  }

  accessPackageButton(name: string): Locator {
    return this.page.getByRole('button', { name });
  }

  addCustomerButtonByName(name: string): Locator {
    return this.page.getByRole('button', { name: `Legg til ${name}` });
  }

  removeCustomerButtonByName(name: string): Locator {
    return this.page.getByRole('button', { name });
  }

  confirmationText(text: string): Locator {
    return this.page.getByText(text);
  }

  async confirmDelegation() {
    await this.confirmButton.click();
  }

  async openAccessPackageModal(name: string) {
    await this.accessPackageModal(name).click();
  }

  async openAccessPackage(accessPackage: string) {
    const label = accessPackage.replace(/-/g, ' ');
    const button = this.page.getByRole('button', { name: label });
    await expect(button).toBeVisible();
    await button.click();
    await this.page.keyboard.press('Escape');
  }

  async addCustomer(customerLabel: string, confirmationText: string) {
    await this.addCustomerButton.click();
    await this.addCustomerButtonByName(customerLabel).click();
    await this.confirmationText(`${confirmationText} er lagt`).click();
    await this.confirmAndCloseButton.click();
  }

  async removeCustomer(name: string) {
    await this.modifyCustomersButton.click();
    await this.removeCustomerButtonByName(name).click();
    await this.confirmationText(`${name} er fjernet fra Systemtilgangen`).click();
    await this.confirmAndCloseButton.click();
  }

  async deleteSystemUser(name: string) {
    await this.deleteSystemAccessButtons.first().click();
    await this.deleteSystemAccessButtons.nth(1).click();
    await expect(this.accessPackageModal(name)).toHaveCount(0);
  }
}
