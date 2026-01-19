import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

import { env } from 'playwright/util/helper';

export class ClientDelegationPage {
  readonly page: Page;

  readonly confirmButton: Locator;
  readonly customersButton: Locator;
  readonly addAllCustomersButton: Locator;
  readonly addAllCustomersSuccessText: Locator;
  readonly confirmAndCloseButton: Locator;
  readonly deleteSystemAccessButtons: Locator;
  readonly clientSearchBox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.confirmButton = page.getByRole('button', { name: 'Godkjenn' });
    this.customersButton = page.getByRole('button', {
      name: /^(Legg til kunder|Legg til eller fjern kunder)$/,
    });

    // Scope modal-specific locators to the open dialog to avoid strict mode violations
    this.addAllCustomersButton = page
      .getByRole('dialog')
      .getByRole('button', { name: 'Legg til alle kunder' });
    this.addAllCustomersSuccessText = page
      .getByRole('dialog')
      .getByText(/Alle kunder er lagt til\.?/);
    this.confirmAndCloseButton = page
      .getByRole('dialog')
      .getByRole('button', { name: 'Bekreft og lukk' });
    this.deleteSystemAccessButtons = page.getByRole('button', { name: 'Slett systemtilgang' });
    this.clientSearchBox = page
      .getByRole('dialog')
      .getByRole('searchbox', { name: 'Søk etter kunde' });
  }

  systemUserLink(name: string): Locator {
    return this.page.getByRole('link', { name });
  }

  addCustomerButtonByName(name: string): Locator {
    return this.page.getByRole('dialog').getByRole('button', { name: `Legg til ${name}` });
  }

  removeCustomerButtonByName(name: string): Locator {
    return this.page.getByRole('dialog').getByRole('button', { name: `Fjern ${name}` });
  }

  confirmationText(text: string): Locator {
    return this.page.getByRole('dialog').getByText(text);
  }

  async confirmAndCreateSystemUser(accessPackage: string) {
    const button = this.page.getByRole('button', { name: accessPackage });
    expect(button).toBeVisible();
    await expect(this.confirmButton).toBeVisible();
    await this.confirmButton.click();
  }

  async openSystemUser(accessPackage: string) {
    const label = accessPackage.replace(/-/g, ' ');
    const button = this.page.getByRole('button', { name: label });
    await expect(button).toBeVisible();
    await button.click();
    await this.page.keyboard.press('Escape');
  }

  // Backwards-compatible alias (typo kept because older specs referenced it)
  async openSystemUSer(accessPackage: string) {
    await this.openSystemUser(accessPackage);
  }

  async addCustomer(
    customerLabel: string,
    confirmationText: string,
    orgnummer: string = '234234234',
  ) {
    await expect(this.customersButton).toBeVisible();
    await this.customersButton.click();

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

  async addAllCustomers() {
    await expect(this.customersButton).toBeVisible();
    await this.customersButton.click();

    await expect(this.addAllCustomersButton).toBeVisible();
    await this.addAllCustomersButton.click();

    await expect(this.addAllCustomersSuccessText).toBeVisible();
    await expect(this.confirmAndCloseButton).toBeVisible();
  }

  async removeCustomer(name: string) {
    // Open the customers modal (works for both add and modify labels)
    await expect(this.customersButton).toBeVisible();
    await this.customersButton.click();

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
    await expect(this.page).toHaveURL(env('SYSTEMUSER_URL') + '/overview');
    await expect(this.systemUserLink(name)).toHaveCount(0);
  }
}
