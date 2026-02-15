import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AktorvalgHeader {
  readonly page: Page;
  readonly infoportalLogo: Locator;
  readonly searchButton: Locator;
  readonly menuButton: Locator;
  readonly dummy: Locator;
  readonly searchBar: Locator;
  readonly menuNavigation: Locator;
  readonly menuInbox: Locator;
  readonly menuAccessManagement: Locator;
  readonly menuApps: Locator;
  readonly menuStartCompany: Locator;
  readonly menuHelp: Locator;
  readonly menuLanguage: Locator;
  readonly menuProfile: Locator;
  readonly menuLogout: Locator;
  readonly aktorvalgSearch: Locator;
  readonly showDeletedSwitch: Locator;
  readonly bokmalLanguageOption: Locator;
  readonly VisibleActors: Locator;

  constructor(page: Page) {
    this.page = page;
    this.infoportalLogo = this.page.getByRole('link', { name: 'Gå til forsiden' });
    this.searchButton = this.page.getByText('Søk', { exact: true });
    this.menuButton = this.page.getByRole('button', { name: 'Meny', exact: true });
    this.dummy = this.page.getByRole('link', { name: 'Sjekk innboks' });
    this.searchBar = this.page.getByRole('searchbox', { name: 'Søk på altinn.no' });

    // Menu / Navigation
    this.menuNavigation = this.page.getByRole('navigation', { name: 'Menu' });
    this.menuInbox = this.menuItem('Innboks');
    this.menuAccessManagement = this.menuItem('Tilgangsstyring');
    this.menuApps = this.menuItem('Alle skjema og tjenester');
    this.menuStartCompany = this.menuItem('Starte og drive bedrift');
    this.menuHelp = this.menuItem('Trenger du hjelp?');
    this.menuLanguage = this.menuItem('Språk/language');
    this.menuProfile = this.menuItem('Din profil');

    this.menuLogout = this.page.getByRole('button', { name: 'Logg ut' });
    this.aktorvalgSearch = this.page.getByRole('searchbox', { name: 'Søk i aktører' });
    this.showDeletedSwitch = this.page.getByRole('switch', { name: 'Vis slettede' });
    this.bokmalLanguageOption = this.page.locator('#no_nb');

    const actorDetails = this.page
      .getByText('Født:', { exact: false })
      .or(this.page.getByText('Org.nr', { exact: false }));

    this.VisibleActors = this.page
      .getByRole('menuitem')
      .filter({ hasNot: this.page.getByRole('menuitem') })
      .filter({ has: actorDetails });
  }

  private menuItem(label: string): Locator {
    return this.menuNavigation.getByLabel(label);
  }

  private actorOption(actorName: string): Locator {
    return this.page.getByLabel(actorName).first();
  }

  private selectedActorButton(actorName: string): Locator {
    return this.page.getByRole('button', { name: actorName }).first();
  }

  async goToSelectActor(actorName: string) {
    await expect(this.actorOption(actorName)).toBeVisible();
    await this.actorOption(actorName).click();
  }

  async selectActorFromHeaderMenu(actorName: string) {
    await expect(this.actorOption(actorName)).toBeVisible();
    await this.actorOption(actorName).click();
  }

  async currentlySelectedActor(actorName: string) {
    await expect(this.selectedActorButton(actorName)).toBeVisible();
  }

  async goToInfoportal() {
    await this.infoportalLogo.click();
    await expect(this.dummy).toBeVisible();
  }

  async goToInbox() {
    await this.menuButton.click();
    await this.menuInbox.click();
    await this.closePopups();
  }

  async goToAccessManagement() {
    await this.menuButton.click();
    await this.menuAccessManagement.click();
  }

  async goToProfile() {
    await this.menuButton.click();
    await this.menuProfile.click();
    await this.closePopups();
  }

  async clickSearchButton() {
    await this.searchButton.click();
    await expect(this.searchBar).toBeVisible();
  }

  async typeInSearchField(text: string) {
    await this.aktorvalgSearch.fill(text);
  }

  async actorIsListed(name: string) {
    await expect(this.page.getByLabel(name).first()).toBeVisible();
  }

  async checkAllMenuButtons() {
    await this.menuButton.click();
    await expect(this.menuInbox).toBeVisible();
    await expect(this.menuAccessManagement).toBeVisible();
    await expect(this.menuApps).toBeVisible();
    await expect(this.menuStartCompany).toBeVisible();
    await expect(this.menuHelp).toBeVisible();
    await expect(this.menuProfile).toBeVisible();
    await expect(this.menuLanguage).toBeVisible();
    await expect(this.menuLogout).toBeVisible();
    await this.page.getByRole('button', { name: 'Lukk Meny Meny' }).click();
  }

  async clickFavorite() {
    await this.page.getByLabel('Legg til i favorittar').first().click();

    await expect(
      this.page.getByRole('button', { name: 'Fjern frå favorittar' }).first(),
    ).toBeVisible();
  }

  async removeAllFavorites() {
    var unfavoriteButtons = await this.page
      .getByRole('button', { name: 'Fjern frå favorittar' })
      .all();
    for (const button of unfavoriteButtons) {
      await button.click();
    }
  }

  async unfavoriteFirstActor() {
    await this.page.getByRole('button', { name: 'Fjern frå favorittar' }).first().click();
    await expect(this.page.getByRole('button', { name: 'Fjern frå favorittar' })).toHaveCount(0);
  }

  async checkShowDeletedSwitch() {
    const isChecked = await this.showDeletedSwitch.isChecked();
    if (!isChecked) {
      await this.showDeletedSwitch.click();
    }
  }

  async uncheckShowDeletedSwitch() {
    const isChecked = await this.showDeletedSwitch.isChecked();
    if (isChecked) {
      await this.showDeletedSwitch.click();
    }
  }

  async chooseBokmalLanguage() {
    await this.menuButton.click();
    await this.menuLanguage.click();
    await this.bokmalLanguageOption.click();
  }

  async expectedNumberOfActors(number: number) {
    await expect(this.VisibleActors).toHaveCount(number);
  }

  async expectActorToBeVisible(name: string) {
    await expect(this.VisibleActors.filter({ hasText: name })).toBeVisible();
  }

  async expectDeletedActorToBeVisible(name: string) {
    await expect(
      this.page
        .getByRole('menuitem', { name })
        .filter({ has: this.page.getByText('Slettet') })
        .first(),
    ).toBeVisible();
  }

  async closePopups() {
    try {
      await this.page.waitForTimeout(50);
      await this.page.getByRole('button', { name: 'Close' }).click();
    } catch (e) {}
    try {
      await this.page.waitForTimeout(50);
      await this.page.getByRole('button', { name: 'Lukk' }).click();
    } catch (e) {}
  }
}
