/* eslint-disable import/no-unresolved */
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import no_nb from '../../../src/localizations/no_nb.json';

export class apiDelegation {
  public selectApiHeader: Locator;
  public apiAccessButton: Locator;
  public confirmationHeading: Locator;
  public giveAccessButton: Locator;
  public nextButton: Locator;
  public searchApiLabel: Locator;
  public searchOrgNumberLabel: Locator;
  public addButton: Locator;
  public confirmButton: Locator;
  public totalOverviewButton: Locator;
  public actionBar: Locator;
  public delegateNewApiButton: Locator;
  public editRightsButton: Locator;
  public deleteButton: Locator;
  public saveButton: Locator;
  public cancelButton: Locator;
  public receivedApiAccessButton: Locator;
  public filterByAgencyButton: Locator;
  public resetSelectionButton: Locator;
  public applyButton: Locator;
  public searchApiInput: Locator;
  public searchOrgNumberInput: Locator;
  public addOrgButton: Locator;
  public confirmAccessHeading: Locator;
  public apiDelegationHeading: Locator;
  public overviewHeadingLocator: Locator;
  public giveAccessToNewApiHeading: Locator;
  public previousButton: Locator;

  constructor(public page: Page) {
    this.apiAccessButton = page.getByText('Tilgang til programmeringsgrensesnitt - API', {
      exact: true,
    });
    this.confirmationHeading = page.getByRole('heading', {
      name: no_nb.api_delegation.confirmation_page_content_top_text,
    });
    this.giveAccessButton = page.getByRole('button', { name: 'Gi og fjerne API tilganger' });
    this.nextButton = page.getByRole('button', { name: no_nb.common.next, exact: true });
    this.previousButton = page.getByRole('button', { name: no_nb.common.previous, exact: true });
    this.searchApiLabel = page.getByLabel(no_nb.api_delegation.search_for_api);
    this.searchOrgNumberLabel = page.getByLabel(no_nb.api_delegation.search_for_buisness);
    this.addButton = page.getByLabel(no_nb.common.add);
    this.confirmButton = page.getByRole('button', { name: no_nb.common.confirm, exact: true });
    this.totalOverviewButton = page.getByRole('button', {
      name: no_nb.api_delegation.receipt_page_main_button,
    });
    this.actionBar = page.getByTestId('action-bar');
    this.delegateNewApiButton = page.getByRole('button', {
      name: no_nb.api_delegation.delegate_new_org,
    });
    this.editRightsButton = page.getByRole('button', { name: no_nb.api_delegation.edit_accesses });
    this.deleteButton = page.getByText(no_nb.common.delete, { exact: true });
    this.saveButton = page.getByRole('button', { name: no_nb.api_delegation.save });
    this.cancelButton = page.getByLabel(no_nb.common.cancel);
    this.receivedApiAccessButton = page.getByRole('button', { name: 'Mottatte API tilganger' });
    this.filterByAgencyButton = page.getByRole('button', {
      name: no_nb.api_delegation.filter_label,
    });
    this.resetSelectionButton = page.getByRole('button', {
      name: no_nb.common.reset_choices,
      exact: true,
    });
    this.applyButton = page.getByRole('button', { name: no_nb.common.apply, exact: true });
    this.searchApiInput = page.getByLabel(no_nb.api_delegation.search_for_api);
    this.searchOrgNumberInput = page.getByLabel(no_nb.api_delegation.search_for_buisness);
    this.addOrgButton = page.getByRole('button', { name: no_nb.common.add, exact: true });
    this.confirmAccessHeading = page.getByRole('heading', { name: 'API-tilgangene blir gitt til' });
    this.apiDelegationHeading = page.getByRole('heading', {
      name: no_nb.api_delegation.succesful_delegations,
    });
    this.overviewHeadingLocator = this.page.getByRole('heading', {
      name: 'Her finner du oversikt over',
    });

    this.giveAccessToNewApiHeading = page.getByRole('heading', {
      name: no_nb.api_delegation.give_access_to_new_api,
    });

    this.selectApiHeader = page.getByRole('heading', {
      name: no_nb.api_delegation.new_api_content_text2,
    });
  }

  get getApiAccessButton(): Locator {
    return this.page.getByText('Tilgang til programmeringsgrensesnitt - API', { exact: true });
  }

  async selectApiToDelegate(apiName: string) {
    await expect(this.selectApiHeader).toBeVisible();

    await this.searchApiLabel.click();
    await this.searchApiLabel.fill(apiName);

    await this.page
      .getByLabel(`Legg til ${apiName}`, {
        exact: true,
      })
      .click();

    await this.nextButton.last().click();
  }

  async goToAccessToApiPageFromFrontPage() {
    for (let i = 0; i < 3; i++) {
      try {
        await this.apiAccessButton.waitFor({ state: 'visible' });
        await this.apiAccessButton.click();
        await this.page.waitForTimeout(1000); // Wait for the animation to finish
        await this.giveAccessButton.waitFor({ state: 'visible' });
        await this.giveAccessButton.click();

        break; // Exit loop if successful
      } catch (error) {
        if (i === 2) {
          console.error('Failed to navigate to the API access page after 3 attempts:', error);
          throw error;
        }
        console.log(`Retrying... (${i + 1}/3)`);
        await this.page.waitForTimeout(1000); // Wait for 1 second before retrying
      }
    }
  }

  async verifyDelegatedApiLandingPage() {
    await this.goToAccessToApiPageFromFrontPage();

    await expect(
      this.page.getByRole('heading', {
        name: 'Delegerte tilganger',
      }),
    ).toBeVisible();

    await expect(
      this.page.getByRole('heading', {
        name: no_nb.api_delegation.api_overview_text,
      }),
    ).toBeVisible();

    await expect(this.delegateNewApiButton).toBeVisible();
  }

  async delegateAPI(apiName: string, orgNumber: string) {
    await this.verifyDelegatedApiLandingPage();
    await this.delegateNewApiButton.click();
    await expect(this.giveAccessToNewApiHeading).toBeVisible();
    await this.selectApiToDelegate(apiName);
    await this.selectUsersThatShouldGetAccess(orgNumber);
  }

  async attemptToDelegateNonDelegableApi(apiName: string) {
    await this.verifyDelegatedApiLandingPage();

    await this.delegateNewApiButton.click();
    await expect(this.giveAccessToNewApiHeading).toBeVisible();
    await this.verifyErrorOnDelegate(apiName);
  }

  async verifyErrorOnDelegate(apiName: string) {
    await expect(this.selectApiHeader).toBeVisible();

    // Wait for the search label to be visible and clickable
    await this.searchApiLabel.waitFor({ state: 'visible' });
    await this.searchApiLabel.click();
    await this.searchApiLabel.fill(apiName);

    await this.page.waitForLoadState('networkidle');

    const addButton = this.page.getByRole('button', { name: `Legg til ${apiName}` });
    await addButton.waitFor({ state: 'visible' });
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click({ timeout: 10000 });
  }

  async selectUsersThatShouldGetAccess(orgNumber: string) {
    await expect(
      this.page.getByRole('heading', {
        name: 'Velg hvilke brukere som skal få tilgang ved å klikke pluss-tegnet. Du kan også legge til ny virksomhet ved å benytte søkefeltet.',
      }),
    ).toBeVisible();

    await this.searchOrgNumberLabel.click();
    await this.searchOrgNumberLabel.fill(orgNumber);
    await this.addButton.click();

    await this.page.pause();
    //Verify previous and next buttons work
    await this.previousButton.click();
    await this.nextButton.click();
    await this.nextButton.click();
  }

  async deleteDelegatedAPIs() {
    await this.goToAccessToApiPageFromFrontPage();
    await this.page.waitForTimeout(1000);

    if ((await this.editRightsButton.count()) > 0) {
      await this.editRightsButton.click();
      await this.page.waitForTimeout(1000);

      while (true) {
        const deleteButton = this.deleteButton;
        if ((await deleteButton.count()) === 0) {
          break;
        }
        await deleteButton.first().click();
      }

      await this.saveButton.click();
      await this.cancelButton.click();
    } else {
      await this.page.goto(process.env.BASE_URL + '/ui/profile');
    }
  }

  async verifyApiDelegationsGiven(
    apiDetails: { name: string; department: string },
    orgUser: { orgNumber: string; reportee: string },
  ) {
    await expect(this.apiDelegationHeading).toBeVisible();
    await expect(this.page.getByText(orgUser.reportee)).toBeVisible();
    await expect(this.page.getByText(apiDetails.name)).toBeVisible();
    await this.totalOverviewButton.click();
  }

  async verifyDelegatedApisFinalPage(orgUser: { orgNumber: string; reportee: string }) {
    await expect(this.overviewHeadingLocator).toBeVisible();
    await this.actionBar.first().click();

    await expect(this.actionBar.first()).toContainText(
      `${orgUser.reportee}Org.nr. ${orgUser.orgNumber}`,
    );
  }

  async verifyConfirmationPage(
    apiDetails: { name: string; department: string },
    orgUser: { orgNumber: string; reportee: string },
  ) {
    const apiNameLocator = this.page.getByText(apiDetails.name);
    await expect(apiNameLocator).toHaveText(apiDetails.name);
    const orgNameLocator = this.page.getByText(orgUser.reportee);
    await expect(orgNameLocator).toContainText(orgUser.reportee);

    await this.confirmButton.click();
    await this.verifyApiDelegationsGiven(apiDetails, orgUser);
    await this.verifyDelegatedApisFinalPage(orgUser);
  }

  async verifyAPIOverviewPage(reportee: string, receivedApiName: string) {
    await this.apiAccessButton.click();

    await expect(this.receivedApiAccessButton).toBeVisible();
    await this.receivedApiAccessButton.click();

    //Refactor to this:
    await this.page.getByRole('button', { name: `${reportee} Org.nr` }).click();
    //What is this used for?
    const headingLocator = this.page.getByRole('heading', { name: receivedApiName });
    await expect(headingLocator).toBeVisible();
  }

  async selectApiAccess(apiNames: string[]) {
    for (const apiName of apiNames) {
      await this.page
        .getByRole('button', { name: `Legg til ${apiName}` })
        .last()
        .click();
    }

    // Verify that the correct number of remove buttons are visible
    const removeButtons = this.page.getByRole('button', { name: 'Fjern' });
    await expect(removeButtons).toHaveCount(apiNames.length);

    await this.nextButton.click();
  }

  /**
   * Grants user access to multiple organizations.
   *
   * @param {Array} organizations - An array where each element is an array containing the organization number and organization name.
   */
  async grantUserAccess(organizations: [string, string][]) {
    for (const [orgNumber, orgName] of organizations) {
      await this.searchOrgNumberLabel.fill(orgNumber);
      await this.page.getByRole('button', { name: `Legg til ${orgNumber}` }).click();
      expect(await this.page.getByLabel(`Fjern ${orgName}`).isVisible());
    }

    await this.nextButton.click();
  }

  async confirmAccessGranted(apiNames: string[], organizations: [string, string][]) {
    expect(this.confirmAccessHeading).toBeVisible();

    for (const apiName of apiNames) {
      await expect(this.page.getByText(apiName)).toBeVisible();
    }

    for (const [orgNumber, orgName] of organizations) {
      await expect(this.page.getByText(orgName)).toBeVisible();
      await expect(this.page.getByText(`Org.nr. ${orgNumber}`)).toBeVisible();
    }

    await this.confirmButton.click();
  }

  async verifyDelegatedRightsGiven(apiNames: string[], organizations: [string, string][]) {
    expect(this.apiDelegationHeading).toBeVisible();

    for (const apiName of apiNames) {
      const apiElements = this.page.locator(`text=${apiName}`);
      await expect(apiElements).toHaveCount(3);
    }

    for (const [orgNumber, orgName] of organizations) {
      const orgNameElements = this.page.locator(`text=${orgName}`);
      await expect(orgNameElements.first()).toBeVisible();
    }
    await this.totalOverviewButton.click();
  }
}
