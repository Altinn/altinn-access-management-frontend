import { expect, type Locator, type Page } from '@playwright/test';

import { SidebarNav } from './SidebarNav';

export class AccessManagementFrontPage {
  readonly page: Page;
  readonly sidebar: SidebarNav;
  readonly tryNewAccessManagementButton: Locator;
  readonly newUserButton: Locator;
  readonly singleServicesTab: Locator;
  readonly singleServicesPanel: Locator;

  constructor(page: Page) {
    this.page = page;

    this.sidebar = new SidebarNav(page);

    this.tryNewAccessManagementButton = this.page.getByRole('button', {
      name: 'Prøv ny tilgangsstyring',
    });
    this.newUserButton = this.page.getByRole('button', { name: 'Ny bruker' });
    this.singleServicesTab = this.page.getByRole('tab', { name: 'Enkelttjenester' });
    this.singleServicesPanel = this.page.getByRole('tabpanel', { name: 'Enkelttjenester' });
  }

  // --- Sidebar facade: delegate to the SidebarNav component ---------------
  get systemUserMenuLink(): Locator {
    return this.sidebar.systemAccess;
  }

  get usersLink(): Locator {
    return this.sidebar.users;
  }

  get powersOfAttorneyLink(): Locator {
    return this.sidebar.powersOfAttorney;
  }

  get ourAccessAtOthersLink(): Locator {
    return this.sidebar.reportees;
  }

  get consentAndPowerOfAttorneyAgreementsLink(): Locator {
    return this.sidebar.consent;
  }

  get klientadministrasjonButton(): Locator {
    return this.sidebar.clientAdministration;
  }

  async goToKlientAdministrasjon() {
    await this.sidebar.goToKlientAdministrasjon();
  }

  async goToUsers() {
    await this.sidebar.goToUsers();
  }

  async expandOrg(org: string) {
    await this.page.getByRole('button', { name: org }).click();
  }

  async clickUser(userName: string, num = 0) {
    await this.page.getByRole('link', { name: userName }).nth(num).click();
  }

  async goToEnkelttjenester() {
    await this.singleServicesTab.click();
    // Vent til fanen er valgt og innholdet er lastet før vi gjør noe i panelet.
    // Overskriften matcher både entall og flertall («Fullmakt til N enkelttjeneste(r)»).
    await expect(this.singleServicesTab).toHaveAttribute('aria-selected', 'true');
    await expect(this.singleServicesPanel).toBeVisible();
    await expect(this.page.getByText(/Fullmakt til \d+ enkelttjeneste/)).toBeVisible();
  }

  async goToFullmakterHosAndre() {
    await this.sidebar.goToFullmakterHosAndre();
  }

  async sokEtterEnkelttjeneste(tjenesteNavn: string) {
    await this.page.getByPlaceholder('Søk etter tjenester').nth(1).fill(tjenesteNavn);
  }

  async clickEnkelttjeneste(tjenesteNavn: string) {
    await this.page.getByRole('button', { name: tjenesteNavn }).first().click();
  }

  async expectEnkelttjenesteToBeDelegable(tjenesteNavn: string) {
    await expect(this.page.getByRole('button', { name: tjenesteNavn }).first()).toBeVisible();
  }

  async clickGiFullmakt() {
    // Begrens til det aktive fanepanelet og bruk eksakt navn, slik at vi ikke
    // treffer skjulte «Gi fullmakt»- eller «Gi fullmakt for …»-knapper i det
    // inaktive panelet (som ligger først i DOM-en).
    await this.page
      .getByRole('tabpanel')
      .getByRole('button', { name: 'Gi fullmakt', exact: true })
      .click();
  }

  async clickGiFullmaktEnkelttjeneste() {
    await this.page.getByRole('dialog').getByRole('button', { name: 'Gi fullmakt' }).click();
  }

  async goToArea(areaName: string) {
    const area = this.page.getByRole('button', { name: areaName }).first();
    await expect(area).toBeVisible();
    await area.click();

    await expect(area).toHaveAttribute('aria-expanded', 'true');
  }

  async expectAccessPackageToBeDelegable(packageName: string) {
    await expect(
      this.page.getByRole('button', { name: 'Gi fullmakt for ' + packageName }).first(),
    ).toBeVisible();
  }

  async userCanDeletePackage(packageName: string) {
    await expect(
      this.page.getByRole('button', { name: 'Slett fullmakt for ' + packageName }),
    ).toBeVisible();
  }

  async expectUserToHavePackage(packageName: string) {
    await expect(this.page.getByRole('button', { name: packageName })).toBeVisible();
  }

  async userCanDeleteEnkelttjeneste(resourceName: string) {
    await expect(this.page.getByRole('button', { name: 'Slett ' + resourceName })).toBeVisible();
  }

  async expectUserToHaveEnkelttjeneste(tjenesteNavn: string) {
    await expect(this.page.getByText(tjenesteNavn)).toBeVisible();
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
    await this.userCanDeletePackage(packageName);
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
    await this.newUserButton.click();
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
    const virksomhetTab = this.page.getByRole('tab', { name: 'Virksomhet' });
    await expect(virksomhetTab).toBeVisible();
    await virksomhetTab.click();
    const orgNoField = this.page.getByRole('textbox', { name: 'Organisasjonsnummer' });
    await orgNoField.fill(orgNo);
    await this.page.getByRole('button', { name: 'Legg til virksomhet' }).click();
  }
}
