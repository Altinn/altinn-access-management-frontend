import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { env } from 'playwright/util/helper';
import { AccessManagementFrontPage } from './AccessManagementFrontPage';

export class AktorvalgHeader {
  readonly page: Page;
  readonly infoportalLogo: Locator;
  readonly searchButton: Locator;
  readonly menuButton: Locator;
  readonly dummy: Locator;
  readonly searchBar: Locator;
  readonly menuInbox: Locator;
  readonly menuAccessManagement: Locator;
  readonly menuApps: Locator;
  readonly menuStartCompany: Locator;
  readonly menuHelp: Locator;
  readonly menuLanguage: Locator;
  readonly menuProfile: Locator;
  readonly menuLogout: Locator;
  readonly aktorvalgSearch: Locator;

  constructor(page: Page) {
    this.page = page;
    this.infoportalLogo = this.page.getByRole('link', { name: 'Gå til forsiden' });
    this.searchButton = this.page.getByText('Søk', { exact: true });
    this.menuButton = this.page.getByRole('button', { name: 'Meny', exact: true });
    this.dummy = this.page.getByRole('link', { name: 'Sjekk innboks' });
    this.searchBar = this.page.getByRole('searchbox', { name: 'Søk på altinn.no' });
    this.menuInbox = this.page.getByRole('link', { name: 'Innboks Beta', exact: true });
    this.menuAccessManagement = this.page
      .getByRole('group')
      .getByRole('link', { name: 'Tilgangsstyring' });
    this.menuApps = this.page
      .getByRole('group')
      .getByRole('link', { name: 'Alle skjema og tjenester' });
    this.menuStartCompany = this.page.getByRole('link', {
      name: 'Starte og drive bedrift',
      exact: true,
    });
    this.menuHelp = this.page.getByRole('link', { name: 'Trenger du hjelp?' });
    this.menuLanguage = this.page.locator('a').filter({ hasText: 'Språk/language' }).first();
    this.menuProfile = this.page.getByRole('link', { name: 'Din profil' });
    this.menuLogout = this.page.getByRole('button', { name: 'Logg ut' });
    this.aktorvalgSearch = this.page.getByRole('searchbox', { name: 'Søk i aktører' });
  }

  async goToSelectActor(actorName: string) {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.getByRole('button', { name: actorName }).click();
    await expect(this.page.locator('a').filter({ hasText: actorName }).first()).toBeVisible();
  }

  async selectActor(actorName: string) {
    await this.page.locator('a').filter({ hasText: actorName }).first().click();
    await expect(this.page.getByRole('button', { name: actorName })).toBeVisible();
  }

  async currentlySelectedActor(actorName: string) {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(50);
    await expect(this.page.getByRole('button', { name: actorName }).first()).toBeVisible();
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
    await expect(this.page.locator('a').filter({ hasText: name }).first()).toBeVisible();
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

  async clickFavorite(actorName: string) {
    await this.page
      .locator('span')
      .filter({ hasText: actorName })
      .getByLabel('Legg til i favorittar')
      .click();
    await expect(
      this.page.getByRole('button', { name: 'Fjern frå favorittar' }).first(),
    ).toBeVisible();
  }

  async unfavoriteFirstActor() {
    await this.page.getByRole('button', { name: 'Fjern frå favorittar' }).first().click();
    await expect(this.page.getByRole('button', { name: 'Fjern frå favorittar' })).toHaveCount(0);
  }

  async chooseBokmalLanguage() {
    await this.menuButton.click();
    await this.menuLanguage.click();
    await this.page.locator('a').filter({ hasText: 'Bokmål' }).click();
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
