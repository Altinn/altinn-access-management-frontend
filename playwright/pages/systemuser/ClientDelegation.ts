// playwright/pages/ClientDelegationPage.ts
import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

import { env } from 'playwright/util/helper';

export class ClientDelegationPage {
  readonly page: Page;

  readonly confirmButton: Locator;
  readonly addCustomersButton: Locator;
  readonly confirmAndCloseButton: Locator;
  readonly deleteSystemAccessButtons: Locator;
  readonly modifyCustomersButton: Locator;
  readonly clientSearchBox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.confirmButton = page.getByRole('button', { name: 'Godkjenn' });
    this.addCustomersButton = page.getByRole('button', { name: 'Legg til kunder' });
    this.modifyCustomersButton = page.getByRole('button', { name: 'Legg til eller fjern kunder' });
    this.confirmAndCloseButton = page.getByRole('button', { name: 'Bekreft og lukk' });
    this.deleteSystemAccessButtons = page.getByRole('button', { name: 'Slett systemtilgang' });
    this.clientSearchBox = page.getByRole('searchbox', { name: 'Søk etter kunde' });
  }

  systemUserLink(name: string): Locator {
    return this.page.getByRole('link', { name });
  }

  addCustomerButtonByName(name: string): Locator {
    return this.page.getByRole('button', { name: `Legg til ${name}` });
  }

  removeCustomerButtonByName(name: string): Locator {
    return this.page.getByRole('button', { name: `Fjern ${name}` });
  }

  confirmationText(text: string): Locator {
    return this.page.getByText(text);
  }

  async confirmAndCreateSystemUser(accessPackage: string) {
    const button = this.page.getByRole('button', { name: accessPackage });
    expect(button).toBeVisible();
    await expect(this.confirmButton).toBeVisible();
    await this.confirmButton.click();
  }

  async openAccessPackage(accessPackage: string) {
    const label = accessPackage.replace(/-/g, ' ');
    const button = this.page.getByRole('button', { name: label });
    await expect(button).toBeVisible();
    await button.click();
    await this.page.keyboard.press('Escape');
  }

  async addCustomer(
    customerLabel: string,
    confirmationText: string,
    orgnummer: string = '234234234',
  ) {
    await expect(this.addCustomersButton).toBeVisible();
    await this.addCustomersButton.click();

    //Customers have different sorting per environment, so most consistent option is to search
    await this.clientSearchBox.fill(orgnummer);

    // Add customer
    const customerButton = this.addCustomerButtonByName(customerLabel);
    await expect(customerButton).toBeVisible();
    await this.addCustomerButtonByName(customerLabel).click();

    // Verify customer was added
    const confirmation = this.confirmationText(`${confirmationText} er lagt`);
    await expect(confirmation).toBeVisible();

    //Close customers modal
    await expect(this.confirmAndCloseButton).toBeVisible();
    await this.confirmAndCloseButton.click();
  }

  async removeCustomer(name: string) {
    // Open the modify customers modal
    await expect(this.modifyCustomersButton).toBeVisible();
    await this.modifyCustomersButton.click();

    // Find and click the remove button for the specified customer
    const removeButton = this.removeCustomerButtonByName(name);
    await expect(removeButton).toBeVisible();
    await this.removeCustomerButtonByName(name).click();

    // Verify the customer removal confirmation text is visible and click it
    const confirmation = this.confirmationText(`${name} er fjernet fra Systemtilgangen`);
    await expect(confirmation).toBeVisible();
    // await this.confirmationText(`${name} er fjernet fra Systemtilgangen`).click();

    // Close the customers modal after removal
    await expect(this.confirmAndCloseButton).toBeVisible();
    await this.confirmAndCloseButton.click();
  }

  async deleteSystemUser(name: string) {
    const deleteButton = this.deleteSystemAccessButtons.first();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Same id on both delete buttons, have to use indexes
    const confirmDeleteButton = this.deleteSystemAccessButtons.nth(1);
    await expect(confirmDeleteButton).toBeVisible();
    await confirmDeleteButton.click();

    //Should close modal and take you back to overview page
    await expect(this.page).toHaveURL(env('SYSTEMUSER_URL'));
    await expect(this.systemUserLink(name)).toHaveCount(0);
  }
}
