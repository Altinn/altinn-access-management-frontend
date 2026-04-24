import { expect, type Locator, type Page } from '@playwright/test';

export class AccessManagementFrontPage {
  readonly page: Page;
  readonly systemAccessLink: Locator;
  readonly usersLink: Locator;
  readonly powersOfAttorneyLink: Locator;
  readonly ourAccessAtOthersLink: Locator;
  readonly consentAndPowerOfAttorneyAgreementsLink: Locator;
  readonly tryNewAccessManagementButton: Locator;
  readonly klientadministrasjonButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.systemAccessLink = this.page.getByRole('link', { name: 'Systemtilganger' });

    this.usersLink = this.page.getByRole('link', { name: 'Brukere' });

    this.powersOfAttorneyLink = this.page.getByRole('link', { name: 'Fullmakter' });

    this.ourAccessAtOthersLink = this.page.getByRole('link', {
      name: 'Fullmakter hos andre',
    });
    this.consentAndPowerOfAttorneyAgreementsLink = this.page.getByRole('link', {
      name: 'Samtykke- og fullmaktsavtaler',
    });
    this.tryNewAccessManagementButton = this.page.getByRole('button', {
      name: 'Prøv ny tilgangsstyring',
    });
    this.klientadministrasjonButton = this.page.locator('#client-admin');
  }

  async gotoKlientAdministrasjon() {
    await this.klientadministrasjonButton.click();
  }

  async goToUsers() {
    await this.usersLink.click();
  }

  async expandOrg(org: string) {
    await this.page.getByRole('button', { name: org }).click();
  }

  async clickUser(userName: string) {
    await this.page.getByRole('link', { name: userName }).click();
  }

  async goToEnkelttjenester() {
    await this.page.getByRole('tab', { name: 'Enkelttjenester' }).click();
  }

  async sokEtterEnkelttjeneste(tjenesteNavn: string) {
    await this.page
      .getByRole('searchbox', { name: 'Søk etter tjenester' })
      .first()
      .fill(tjenesteNavn);
  }

  async clickEnkelttjeneste(tjenesteNavn: string) {
    await this.page.getByRole('button', { name: tjenesteNavn }).first().click();
  }

  async expectEnkelttjenesteToBeDelegable(tjenesteNavn: string) {
    await expect(this.page.getByRole('button', { name: tjenesteNavn }).first()).toBeVisible();
  }

  async clickGiFullmakt() {
    await this.page.getByRole('button', { name: 'Gi fullmakt' }).click();
  }

  async clickGiFullmaktEnkelttjeneste() {
    await this.page.getByRole('dialog').getByRole('button', { name: 'Gi fullmakt' }).click();
  }

  async goToArea(areaName: string) {
    await this.page.getByRole('button', { name: areaName }).first().click();
  }

  async expectAccessPackageToBeDelegable(packageName: string) {
    await expect(
      this.page.getByRole('button', { name: 'Gi fullmakt for ' + packageName }).first(),
    ).toBeVisible();
  }

  async expectUserToHavePackage(packageName: string) {
    await expect(
      this.page.getByRole('button', { name: 'Slett fullmakt for ' + packageName }),
    ).toBeVisible();
  }

  async expectUserToHaveEnkelttjeneste(resourceName: string) {
    await expect(this.page.getByRole('button', { name: 'Slett ' + resourceName })).toBeVisible();
  }

  async clickSlettFullmaktForTilgangspakke(packageName: string) {
    await this.page.getByRole('button', { name: 'Slett fullmakt for ' + packageName }).click();
  }

  async clickSlettEnkelttjeneste(resourceName: string) {
    await this.page
      .getByRole('button', { name: 'Slett ' + resourceName })
      .first()
      .click();
  }

  async clickGiFullmaktForTilgangspakke(packageName: string) {
    const giFullmaktKnapp = this.page.getByRole('button', {
      name: 'Gi fullmakt for ' + packageName,
    });
    await expect(giFullmaktKnapp).toBeVisible();
    await giFullmaktKnapp.click();
    await this.expectUserToHavePackage(packageName);
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

  async expectPowerOfAttorneyButtonToNotBeVisible() {
    await expect(this.page.getByRole('button', { name: 'Gi fullmakt' })).not.toBeVisible();
  }

  async expectOthersWithRightsListToBeVisible() {
    await expect(this.page.getByRole('heading', { name: 'Andre med fullmakt' })).toBeVisible();
  }

  async expectOthersWithRightsListToNotBeVisible() {
    await expect(this.page.getByRole('heading', { name: 'Andre med fullmakt' })).not.toBeVisible();
  }

  async clickLeggTilBruker() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.getByRole('button', { name: 'Legg til Ny bruker' }).click();
  }

  async LukkGiFullmaktVindu() {
    await this.page.getByRole('button', { name: 'Lukk' }).click();
  }

  async addPerson(fnr: string, lastName: string) {
    const fnrField1 = this.page.getByRole('textbox', { name: 'Fødselsnummer' }); // AT22 og AT23
    const fnrField2 = this.page.getByRole('textbox', { name: 'Fødselsnr./brukernavn' }); //TT02

    if (await fnrField1.isVisible()) {
      await fnrField1.fill(fnr);
    } else if (await fnrField2.isVisible()) {
      await fnrField2.fill(fnr);
    }

    await this.page.getByRole('textbox', { name: 'Etternavn' }).fill(lastName);
    await this.page.getByRole('button', { name: 'Legg til person' }).click();
  }
  async addOrg(orgNo: string) {
    const virksomhetTab = await this.page.getByRole('tab', { name: 'Virksomhet' });
    await expect(virksomhetTab).toBeVisible();
    await virksomhetTab.click();
    // await this.page.getByRole('tab', { name: 'Virksomhet' }).click();
    const orgNoField = await this.page.getByRole('textbox', { name: 'Organisasjonsnummer' });
    await orgNoField.fill(orgNo);
    await this.page.getByRole('button', { name: 'Legg til virksomhet' }).click();
  }
}
