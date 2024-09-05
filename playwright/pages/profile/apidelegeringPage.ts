/* eslint-disable import/no-unresolved */
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import no_nb from '../../../src/localizations/no_nb.json';

export class apiDelegation {
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
  public testDepartmentLabel: Locator;
  public digitalizationDirectorateLabel: Locator;
  public resetSelectionButton: Locator;
  public applyButton: Locator;
  public searchApiInput: Locator;
  public searchOrgNumberInput: Locator;
  public addOrgButton: Locator;
  public confirmAccessHeading: Locator;
  public apiDelegationHeading: Locator;
  public leggTilMaskinportenButton: Locator;

  constructor(public page: Page) {
    this.apiAccessButton = page.getByText('Tilgang til programmeringsgrensesnitt - API', {
      exact: true,
    });
    this.confirmationHeading = page.getByRole('heading', {
      name: no_nb.api_delegation.confirmation_page_content_top_text,
    });
    this.giveAccessButton = page.getByRole('button', { name: 'Gi og fjerne API tilganger' });
    this.nextButton = page.getByRole('button', { name: 'Neste' });
    this.searchApiLabel = page.getByLabel('Søk etter API');
    this.searchOrgNumberLabel = page.getByLabel('Søk på organisasjonsnummer');
    this.addButton = page.getByLabel('Legg til');
    this.confirmButton = page.getByRole('button', { name: 'Bekreft' });
    this.totalOverviewButton = page.getByRole('button', { name: 'Til totaloversikt' });
    this.actionBar = page.getByTestId('action-bar');
    this.delegateNewApiButton = page.getByRole('button', { name: 'Deleger nytt API' });
    this.editRightsButton = page.getByRole('button', { name: 'Rediger tilganger' });
    this.deleteButton = page.getByText('Slett', { exact: true });
    this.saveButton = page.getByRole('button', { name: 'Lagre' });
    this.cancelButton = page.getByLabel('Avbryt');
    this.receivedApiAccessButton = page.getByRole('button', { name: 'Mottatte API tilganger' });
    this.filterByAgencyButton = page.getByRole('button', { name: 'Filtrer på etat' });
    this.testDepartmentLabel = page.getByLabel('Testdepartement');
    this.digitalizationDirectorateLabel = page.getByLabel('Digitaliseringsdirektoratet');
    this.resetSelectionButton = page.getByRole('button', { name: 'Nullstill valg' });
    this.applyButton = page.getByRole('button', { name: 'Bruk' });
    this.searchApiInput = page.getByLabel('Søk etter API');
    this.searchOrgNumberInput = page.getByLabel('Søk på organisasjonsnummer');
    this.addOrgButton = page.getByRole('button', { name: 'Legg til' });
    this.confirmAccessHeading = page.getByRole('heading', { name: 'API-tilgangene blir gitt til' });
    this.apiDelegationHeading = page.getByRole('heading', {
      name: 'Disse api-delegeringene ble gitt',
    });
    this.leggTilMaskinportenButton = page.getByLabel('Legg til Maskinporten Schema - AM - K6', {
      exact: true,
    });
  }

  get getApiAccessButton(): Locator {
    return this.page.getByText('Tilgang til programmeringsgrensesnitt - API', { exact: true });
  }

  async delegateAPI(apiName: string, orgNumber: string) {
    await this.apiAccessButton.click();
    await this.giveAccessButton.click();
    await this.delegateNewApiButton.click();
    await this.searchApiLabel.click();
    await this.searchApiLabel.fill(apiName);
    await this.leggTilMaskinportenButton.click();
    await this.nextButton.last().click();
    await this.searchOrgNumberLabel.click();
    await this.searchOrgNumberLabel.fill(orgNumber);
    await this.addButton.click();
    await this.nextButton.click();
  }

  async deleteDelegatedAPIs() {
    await this.navigateToDelegateApis();
    await this.page.waitForTimeout(1000);

    if ((await this.editRightsButton.count()) > 0) {
      console.log(
        `Found ${await this.editRightsButton.count()} elements to delete, attempting to clean up`,
      );
      await this.editRightsButton.click();
      await this.page.waitForTimeout(1000);

      while (true) {
        const deleteButton = this.page.getByText('Slett', { exact: true });
        if ((await deleteButton.count()) === 0) {
          break;
        }
        await deleteButton.first().click();
      }

      await this.saveButton.click();
      await this.cancelButton.click();
    } else {
      console.log('Found no elements to delete, navigating to profile');
      await this.page.goto(process.env.BASE_URL + '/ui/profile');
    }
  }

  async navigateToDelegateApis() {
    await this.apiAccessButton.click();
    await expect(this.giveAccessButton).toBeVisible();
    await this.giveAccessButton.click();
  }

  async delegatedAPIOverviewPage(selectedApiName: string, orgName: string) {
    const apiNameLocator = this.page.getByText(selectedApiName);
    await expect(apiNameLocator).toHaveText(selectedApiName);
    const orgNameLocator = this.page.getByText(orgName);
    await expect(orgNameLocator).toHaveText(orgName);
    await this.confirmButton.click();
    await this.totalOverviewButton.click();
    await this.actionBar.first().click();
    await expect(this.actionBar.first()).toContainText(
      'INTERESSANT KOMPATIBEL TIGER ASOrg.nr. INTERESSANT KOMPATIBEL TIGER AS',
    );
  }

  async receiverAPIOverviewPage(receivedApiName: string) {
    await this.apiAccessButton.click();
    await this.receivedApiAccessButton.click();
    await this.actionBar.first().click();
    this.page.getByRole('heading', { name: receivedApiName });
  }

  async chooseApiToDelegate(newAPiName: string, orgName: string) {
    await this.delegateNewApiButton.click();
    await this.searchApiLabel.click();
    await this.searchApiLabel.fill(newAPiName);
    await this.page.getByLabel(`Legg til ${newAPiName}`, { exact: true }).last().click();
    await this.nextButton.last().click();
    await this.searchOrgNumberLabel.click();
    const heading = await this.page.getByRole('heading', {
      name: 'Tidligere tildelegerte virksomheter:',
    });
    await expect(heading).toBeVisible();
    await this.addButton.click();
    await this.nextButton.click();

    const apiNameLocator = this.page.getByText(newAPiName);
    await expect(apiNameLocator).toHaveText(newAPiName);

    const orgNameLocator = this.page.getByText(orgName);
    await expect(orgNameLocator).toHaveText(orgName);

    await this.confirmButton.click();
    await this.totalOverviewButton.click();
    await this.actionBar.click();
    const receivedApiName = this.actionBar;
    await expect(receivedApiName).toContainText(
      'INTERESSANT KOMPATIBEL TIGER ASOrg.nr. INTERESSANT KOMPATIBEL TIGER AS',
    );
  }

  async velgOgDelegerApi(apiName: string, orgNumber: string) {
    await this.apiAccessButton.click();
    await this.giveAccessButton.click();
    await this.delegateNewApiButton.click();
    await this.filterByAgencyButton.click();
    await this.testDepartmentLabel.check();
    await this.digitalizationDirectorateLabel.isChecked();
    await this.resetSelectionButton.isEnabled();
    await this.testDepartmentLabel.uncheck();
    await this.digitalizationDirectorateLabel.uncheck();
    await this.resetSelectionButton.isDisabled();
    await this.testDepartmentLabel.check();
    await this.applyButton.click();
    await this.searchApiLabel.click();
    await this.searchApiLabel.fill(apiName);
    await this.leggTilMaskinportenButton.click();
    await this.nextButton.last().click();
    await this.searchOrgNumberLabel.click();
    await this.searchOrgNumberLabel.fill(orgNumber);
    await this.addButton.click();
    await this.nextButton.click();
  }

  async selectApiAccess() {
    await this.page
      .getByRole('button', {
        name: 'Legg til AuthorizedParties: Mainunit to Organization Maskinporten Schema for utviklingstester',
      })
      .click();

    await this.page
      .getByRole('button', {
        name: 'Legg til Automation Regression',
      })
      .last()
      .click();

    await this.page
      .getByRole('button', {
        name: 'AuthorizedParties: Subunit to Organization Maskinporten Schema for utviklingstester',
      })
      .last()
      .click();

    await Promise.all([
      expect(
        this.page.getByLabel(
          'Fjern AuthorizedParties: Subunit to Organization Maskinporten Schema for',
        ),
      ).toBeVisible(),
      expect(this.page.getByLabel('Fjern Automation Regression')).toBeVisible(),
      expect(
        this.page.getByLabel(
          'Fjern AuthorizedParties: Subunit to Organization Maskinporten Schema for',
        ),
      ).toBeVisible(),
    ]);

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

  async confirmAccessGranted() {
    await Promise.all([
      expect(this.confirmationHeading).toBeVisible(),
      expect(
        this.page.getByText(
          'AuthorizedParties: Mainunit to Organization Maskinporten Schema for utviklingstester',
        ),
      ).toBeVisible(),
      expect(this.page.getByText('Automation Regression')).toBeVisible(),
      expect(
        this.page.getByText('Mainunit to Organization Maskinporten Schema for utviklingstester'),
      ).toBeVisible(),
      expect(
        this.page.getByText('Subunit to Organization Maskinporten Schema for utviklingstester'),
      ).toBeVisible(),

      expect(this.confirmAccessHeading).toBeVisible(),

      expect(this.page.getByText('INTERESSANT KOMPATIBEL TIGER AS')).toBeVisible(),
      expect(this.page.getByText('Org.nr. 310661414')).toBeVisible(),

      expect(this.page.getByText('LYKKELIG DRIFTIG APE')).toBeVisible(),
      expect(this.page.getByText('Org.nr. 310110914')).toBeVisible(),

      expect(this.page.getByText('INTERESSANT KOMPATIBEL TIGER AS')).toBeVisible(),
      expect(this.page.getByText('Org.nr. 313259412')).toBeVisible(),
    ]);

    await this.confirmButton.click();
  }

  async verify() {
    await Promise.all([
      expect(this.apiDelegationHeading).toBeVisible(),
      expect(
        this.page.getByText(
          'AuthorizedParties: Subunit to Organization Maskinporten Schema for utviklingstester',
        ),
      ).toBeVisible(),
      expect(this.page.getByText('Automation Regression')).toBeVisible(),
    ]);
    await this.totalOverviewButton.click();
  }
}
