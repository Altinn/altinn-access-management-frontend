import { expect, type Locator, type Page } from '@playwright/test';

export class AccessManagementFrontPage {
  readonly page: Page;
  readonly systemAccessLink: Locator;
  readonly usersLink: Locator;
  readonly powersOfAttorneyLink: Locator;
  readonly ourAccessAtOthersLink: Locator;
  readonly consentAndPowerOfAttorneyAgreementsLink: Locator;
  readonly tryNewAccessManagementButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.systemAccessLink = this.page
      .getByRole('group')
      .getByRole('link', { name: 'Systemtilganger' });

    this.usersLink = this.page.getByRole('group').getByRole('link', { name: 'Brukere' });
    this.powersOfAttorneyLink = this.page
      .getByRole('group')
      .getByRole('link', { name: 'Fullmakter' });
    this.ourAccessAtOthersLink = this.page.getByRole('link', {
      name: 'Fullmakter hos andre',
    });
    this.consentAndPowerOfAttorneyAgreementsLink = this.page.getByRole('link', {
      name: 'Samtykke- og fullmaktsavtaler',
    });
    this.tryNewAccessManagementButton = this.page.getByRole('button', {
      name: 'Prøv ny tilgangsstyring',
    });
  }

  async goToUsers() {
    await this.usersLink.click();
  }

  async clickUser(userName: string) {
    await this.page.getByRole('link', { name: userName }).click();
  }

  async clickGiFullmakt() {
    await this.page.getByRole('button', { name: 'Gi fullmakt' }).click();
  }

  async goToArea(areaName: string) {
    await this.page.getByRole('button', { name: areaName }).first().click();
  }

  async expectAccessPackageToBeDelegable(packageName: string) {
    await expect(
      this.page.getByRole('button', { name: 'Gi fullmakt for ' + packageName }),
    ).toBeVisible();
  }

  async clickAccessPackageToDelegateIfVisible(packageName: string) {
    await expect(this.page.locator('.ds-spinner')).toHaveCount(0);
    const accessPackage = await this.page.getByRole('button', {
      name: 'Gi fullmakt for ' + packageName,
    });
    if (await accessPackage.isVisible()) {
      await accessPackage.click();
    }
  }

  async clickAccessAreaInPopup(areaName: string) {
    await this.page.getByRole('search').getByRole('button', { name: areaName }).click();
  }

  async expectAccessPackageToNotBeDelegable(packageName: string) {
    await expect(
      this.page.getByRole('button', { name: 'Gi fullmakt for ' + packageName }),
    ).not.toBeVisible();
  }

  async expectPowerOfAttourneyButtonToNotBeVisible() {
    await expect(this.page.getByRole('button', { name: 'Gi fullmakt' })).not.toBeVisible();
  }

  async expectOthersWithRightsListToBeVisible() {
    await expect(this.page.getByRole('heading', { name: 'Andre med fullmakt' })).toBeVisible;
  }

  async expectOthersWithRightsListToNotBeVisible() {
    await expect(this.page.getByRole('heading', { name: 'Andre med fullmakt' })).not.toBeVisible;
  }

  async clickLeggTilBruker() {
    await this.page.getByRole('button', { name: 'Legg til Ny bruker' }).click();
  }

  async addPerson(fnr: string, lastName: string) {
    const fnrField1 = await this.page.getByRole('textbox', { name: 'Fødselsnummer' }); // AT22 og AT23
    const fnrField2 = await this.page.getByRole('textbox', { name: 'Fødselsnr./brukernavn' }); //TT02

    if (await fnrField1.isVisible()) {
      await fnrField1.fill(fnr);
    } else if (await fnrField2.isVisible()) {
      await fnrField2.fill(fnr);
    }

    await this.page.getByRole('textbox', { name: 'Etternavn' }).fill(lastName);
    await this.page.getByRole('button', { name: 'Legg til person' }).click();
  }
}
