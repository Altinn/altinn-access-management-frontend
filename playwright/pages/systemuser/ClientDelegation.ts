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
  removeCustomerButtonByName(name: string): Locator {
    return this.page.getByRole('button', { name: `Fjern ${name}` });
  }

  confirmationText(text: string): Locator {
    return this.page.getByText(text);
  }

  async confirmDelegation() {
    await expect(this.confirmButton).toBeVisible();
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
    await expect(this.addCustomerButton).toBeVisible();
    await this.addCustomerButton.click();
    const customerButton = this.addCustomerButtonByName(customerLabel);
    await expect(customerButton).toBeVisible();
    await this.addCustomerButtonByName(customerLabel).click();
    const confirmation = this.confirmationText(`${confirmationText} er lagt`);
    await expect(confirmation).toBeVisible();
    await this.confirmationText(`${confirmationText} er lagt`).click();
    await expect(this.confirmAndCloseButton).toBeVisible();
    await this.confirmAndCloseButton.click();
  }

  async removeCustomer(name: string) {
    await expect(this.modifyCustomersButton).toBeVisible();
    await this.modifyCustomersButton.click();
    const removeButton = this.removeCustomerButtonByName(name);
    await expect(removeButton).toBeVisible();
    await this.removeCustomerButtonByName(name).click();
    const confirmation = this.confirmationText(`${name} er fjernet fra Systemtilgangen`);
    await expect(confirmation).toBeVisible();
    await this.confirmationText(`${name} er fjernet fra Systemtilgangen`).click();
    await expect(this.confirmAndCloseButton).toBeVisible();
    await this.confirmAndCloseButton.click();
  }

  async deleteSystemUser(name: string) {
    await this.deleteSystemAccessButtons.first().click();
    await this.deleteSystemAccessButtons.nth(1).click();
    await expect(this.accessPackageModal(name)).toHaveCount(0);
  }
}
