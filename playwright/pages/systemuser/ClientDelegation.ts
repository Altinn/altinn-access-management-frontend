import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

import { env, withCustomerName } from 'playwright/util/helper';
import { LANGUAGE_DICTIONARIES, Language, type Dict } from '../LanguageMenu';

export class ClientDelegationPage {
  readonly page: Page;
  readonly texts: Dict;

  readonly confirmButton: Locator;
  readonly customersButton: Locator;
  readonly addAllCustomersButton: Locator;
  readonly addAllCustomersSuccessText: Locator;
  readonly confirmAndCloseButton: Locator;
  readonly deleteSystemAccessButtons: Locator;
  readonly clientSearchBox: Locator;
  readonly addOwnOrgButton: Locator;
  readonly ownOrgBadge: Locator;
  readonly removeOwnOrgButton: Locator;

  constructor(page: Page, language: Language = Language.NB) {
    this.page = page;
    this.texts = LANGUAGE_DICTIONARIES[language];
    const agent = this.texts.systemuser_agent_delegation;

    this.confirmButton = page.getByRole('button', {
      name: this.texts.request_page.approve_request,
    });
    // The button reads "Legg til klienter" on first delegation and "Legg til
    // eller fjern klienter" afterwards — match either.
    this.customersButton = page
      .getByRole('button', { name: agent.add_customers, exact: true })
      .or(page.getByRole('button', { name: agent.edit_customers, exact: true }));

    this.addAllCustomersButton = page.getByRole('button', { name: agent.add_all_customers });

    this.addAllCustomersSuccessText = page.getByText(agent.add_all_customers_success);

    this.confirmAndCloseButton = page.getByRole('button', { name: agent.confirm_close });

    this.deleteSystemAccessButtons = page.getByRole('button', {
      name: this.texts.systemuser_detailpage.delete_systemuser,
    });

    this.clientSearchBox = page
      .getByRole('dialog')
      .getByRole('searchbox', { name: agent.customer_search });

    this.addOwnOrgButton = page.getByRole('button', { name: agent.add_own_organization });

    this.ownOrgBadge = page.getByText(agent.own_organization, { exact: true });

    this.removeOwnOrgButton = page.getByRole('button', { name: agent.remove_own_organization });
  }

  systemUserLink(name: string): Locator {
    return this.page.getByRole('link', { name });
  }

  // Klientraden i listen. I noen miljøer rendres klientnavnet som heading
  // (level 3), i andre som ren tekst i listeelementet. Vi scoper derfor til
  // selve listeelementet via navnetekst i stedet for å kreve heading-rollen.
  clientRow(orgName: string): Locator {
    return this.page.getByRole('listitem').filter({ hasText: orgName });
  }

  ownOrgHeading(orgName: string): Locator {
    return this.clientRow(orgName);
  }

  ownOrgNumber(orgName: string, formattedOrgNo: string): Locator {
    return this.clientRow(orgName).getByText(formattedOrgNo);
  }

  clientOrgNumber(orgName: string, formattedOrgNo: string): Locator {
    return this.clientRow(orgName).getByText(formattedOrgNo);
  }

  addCustomerButtonByName(name: string): Locator {
    return this.page.getByRole('dialog').getByRole('button', {
      name: withCustomerName(this.texts.systemuser_agent_delegation.add_to_system_user_aria, name),
    });
  }

  removeCustomerButtonByName(name: string): Locator {
    return this.page.getByRole('dialog').getByRole('button', {
      name: withCustomerName(
        this.texts.systemuser_agent_delegation.remove_from_system_user_aria,
        name,
      ),
    });
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
    const confirmation = this.confirmationText(
      withCustomerName(this.texts.systemuser_agent_delegation.customer_added, confirmationText),
    );
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

    // This may take long since there are 100 clients ++
    await expect(this.addAllCustomersSuccessText).toBeVisible({ timeout: 30000 });
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

    // Verify the customer removal confirmation text is visible
    const confirmation = this.confirmationText(
      withCustomerName(this.texts.systemuser_agent_delegation.customer_removed, name),
    );
    await expect(confirmation).toBeVisible();

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
