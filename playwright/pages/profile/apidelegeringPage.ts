/* eslint-disable import/no-unresolved */
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import no_nb from '../../../src/localizations/no_nb.json';

export class apiDelegation {
  public apiAccessButton: Locator;
  public confirmationHeading: Locator;

  constructor(public page: Page) {
    //Should be done to more elements, but this is a start. Should be moved to "profile page" as well?
    this.apiAccessButton = page.getByText('Tilgang til programmeringsgrensesnitt - API', {
      exact: true,
    });
    this.confirmationHeading = page.getByRole('heading', {
      name: no_nb.api_delegation.confirmation_page_content_top_text,
    });
  }

  async delegateAPI(apiName: string, orgNumber: string) {
    //This occasionally fails
    await this.apiAccessButton.click();

    await this.page.getByRole('button').filter({ hasText: 'Gi og fjerne API tilganger' }).click();
    await this.page.getByRole('button', { name: 'Deleger nytt API' }).click();
    await this.page.getByLabel('Søk etter API').click();
    await this.page.getByLabel('Søk etter API').fill(apiName);
    await this.page.getByLabel('Legg til Maskinporten Schema - AM - K6', { exact: true }).click();
    await this.page.getByRole('button', { name: 'Neste' }).last().click();
    await this.page.getByLabel('Søk på organisasjonsnummer').click();
    await this.page.getByLabel('Søk på organisasjonsnummer').fill(orgNumber);
    await this.page.getByLabel('Legg til').click();
    await this.page.getByRole('button', { name: 'Neste' }).click();
  }

  async deleteDelegatedAPIs() {
    await this.navigateToDelegateApis();

    await this.page.waitForTimeout(1000);
    const editRightsButton = this.page.getByRole('button', { name: 'Rediger tilganger' });

    if ((await editRightsButton.count()) > 0) {
      console.log(
        `Found ${await editRightsButton.count()} elements to delete, attemtping to clean up`,
      );
      await editRightsButton.click();
      await this.page.waitForTimeout(1000);

      while (true) {
        // Find the first "Slett" button with exact text match
        // We have to look for a "Slett" element each time, since all other elements move when you click it
        const deleteButton = this.page.getByText('Slett', { exact: true }).first();

        if ((await deleteButton.count()) === 0) {
          break; // Break the loop if no "Slett" button is found
        }
        await deleteButton.click();
      }

      // Save changes after all deletions
      await this.page.getByRole('button', { name: 'Lagre' }).click();
      await this.page.getByLabel('Avbryt').click();
    } else {
      console.log('Found no elements to delete, navigating to profile');
      await this.page.goto(process.env.BASE_URL + '/ui/profile');
    }
  }

  async navigateToDelegateApis() {
    await this.apiAccessButton.click();
    const giveAccessButton = this.page.getByRole('button', { name: 'Gi og fjerne API tilganger' });
    await expect(giveAccessButton).toBeVisible();
    await giveAccessButton.click();
  }

  async delegatedAPIOverviewPage(selectedApiName: string, orgName: string) {
    const apiNameLocator = this.page.getByText(selectedApiName);
    await expect(apiNameLocator).toHaveText(selectedApiName);
    const orgNameLocator = this.page.getByText(orgName);
    await expect(orgNameLocator).toHaveText(orgName);
    await this.page.getByRole('button', { name: 'Bekreft' }).click();
    await this.page.getByRole('button', { name: 'Til totaloversikt' }).click();

    await this.page.getByTestId('action-bar').first().click();

    await expect(this.page.getByTestId('action-bar').first()).toContainText(
      'INTERESSANT KOMPATIBEL TIGER ASOrg.nr. INTERESSANT KOMPATIBEL TIGER AS',
    );
  }

  async receiverAPIOverviewPage(receivedApiName: string) {
    await this.apiAccessButton.click();
    await this.page.getByRole('button', { name: 'Mottatte API tilganger' }).click();
    await this.page.getByTestId('action-bar').first().click();
    await this.page.getByRole('heading', { name: receivedApiName });
  }

  async chooseApiToDelegate(newAPiName: string, orgName: string) {
    await this.page.getByRole('button', { name: 'Deleger nytt API' }).click();
    await this.page.getByLabel('Søk etter API').click();
    await this.page.getByLabel('Søk etter API').fill(newAPiName);
    await this.page.getByLabel(`Legg til ${newAPiName}`, { exact: true }).last().click();
    await this.page.getByRole('button', { name: 'Neste' }).last().click();
    await this.page.getByLabel('Søk på organisasjonsnummer').click();
    const heading = await this.page.getByRole('heading', {
      name: 'Tidligere tildelegerte virksomheter:',
    });
    await expect(heading).toBeVisible();
    await this.page.getByLabel('Legg til').click();
    await this.page.getByRole('button', { name: 'Neste' }).click();
    const apiNameLocator = await this.page.getByText(newAPiName);
    await expect(apiNameLocator).toHaveText(newAPiName);
    const orgNameLocator = await this.page.getByText(orgName);
    await expect(orgNameLocator).toHaveText(orgName);
    await this.page.getByRole('button', { name: 'Bekreft' }).click();
    await this.page.getByRole('button', { name: 'Til totaloversikt' }).click();

    // This occasionally fails
    await this.page.getByTestId('action-bar').click();
    const receivedApiName = this.page.getByTestId('action-bar');
    await expect(receivedApiName).toContainText(
      'INTERESSANT KOMPATIBEL TIGER ASOrg.nr. INTERESSANT KOMPATIBEL TIGER AS',
    );
  }

  async apiFiltering() {
    await this.apiAccessButton.click();
    await this.page.getByRole('button', { name: 'Gi og fjerne API tilganger' }).click();
    await this.page.getByRole('button', { name: 'Deleger nytt API' }).click();
    await this.page.getByRole('button', { name: 'Filtrer på etat' }).click();
    await this.page.getByLabel('Testdepartement').check();
    await this.page.getByLabel('Digitaliseringsdirektoratet').isChecked();
    await this.page.getByRole('button', { name: 'Nullstill valg' }).isEnabled();
    await this.page.getByLabel('Testdepartement').uncheck();
    await this.page.getByLabel('Digitaliseringsdirektoratet').uncheck();
    await this.page.getByRole('button', { name: 'Nullstill valg' }).isDisabled();
    await this.page.getByLabel('Testdepartement').check();
    await this.page.getByRole('button', { name: 'Bruk' }).click();
    await this.page.getByLabel('Søk etter API').click();
    await this.page.getByLabel('Søk etter API').fill('Maskinporten Schema - AM - K6');
    await this.page.getByLabel('Legg til Maskinporten Schema - AM - K6', { exact: true }).click();
    await this.page.getByRole('button', { name: 'Neste' }).last().click();
    await this.page.getByLabel('Søk på organisasjonsnummer').click();
    await this.page.getByLabel('Søk på organisasjonsnummer').fill('310661414');
    await this.page.getByLabel('Legg til').click();
    await this.page.getByRole('button', { name: 'Neste' }).click();
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

    await this.page.getByRole('button', { name: 'Neste' }).click();
  }

  async grantUserAccess() {
    await this.page.getByLabel('Søk på organisasjonsnummer').fill('310661414');
    await this.page.getByRole('button', { name: 'Legg til 310661414' }).click();
    expect(await this.page.getByLabel('Fjern INTERESSANT KOMPATIBEL').isVisible());

    await this.page.getByLabel('Søk på organisasjonsnummer').fill('310110914');
    await this.page.getByRole('button', { name: 'Legg til 310110914' }).click();
    expect(await this.page.getByLabel('Fjern LYKKELIG DRIFTIG APE').isVisible());

    await this.page.getByLabel('Søk på organisasjonsnummer').fill('313259412');
    await this.page.getByRole('button', { name: 'Legg til 313259412' }).click();
    expect(await this.page.getByLabel('Fjern UROMANTISK ALTERNATIV KATT GÅS').isVisible());

    await this.page.getByRole('button', { name: 'Neste' }).click();
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

      expect(
        this.page.getByRole('heading', { name: 'API-tilgangene blir gitt til' }),
      ).toBeVisible(),

      expect(this.page.getByText('INTERESSANT KOMPATIBEL TIGER AS')).toBeVisible(),
      expect(this.page.getByText('Org.nr. 310661414')).toBeVisible(),

      expect(this.page.getByText('LYKKELIG DRIFTIG APE')).toBeVisible(),
      expect(this.page.getByText('Org.nr. 310110914')).toBeVisible(),

      expect(this.page.getByText('INTERESSANT KOMPATIBEL TIGER AS')).toBeVisible(),
      expect(this.page.getByText('Org.nr. 313259412')).toBeVisible(),
    ]);

    await this.page.getByRole('button', { name: 'Bekreft' }).click();
  }

  async verify() {
    await Promise.all([
      expect(
        this.page.getByRole('heading', { name: 'Disse api-delegeringene ble gitt' }),
      ).toBeVisible(),
      expect(
        this.page.getByText(
          'AuthorizedParties: Subunit to Organization Maskinporten Schema for utviklingstester',
        ),
      ).toBeVisible(),
      expect(this.page.getByText('Automation Regression')).toBeVisible(),
    ]);
    await this.page.getByRole('button', { name: 'Til totaloversikt' }).click();
  }
}
