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

  constructor(page: Page) {
    this.page = page;
    this.infoportalLogo = this.page.getByRole('link', { name: 'Gå til forsiden' });
    this.searchButton = this.page.getByText('Søk', { exact: true });
    this.menuButton = this.page.getByRole('button', { name: 'Meny' });
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
  }

  async GoToSelectActor(actorName: string) {
    await this.page.getByRole('button', { name: actorName }).click();
    await expect(this.page.locator('a').filter({ hasText: actorName }).first()).toBeVisible();
  }

  async SelectActor(actorName: string) {
    await this.page.locator('a').filter({ hasText: actorName }).first().click();
    await expect(this.page.getByRole('button', { name: actorName })).toBeVisible();
  }

  async GoToInfoportal() {
    await this.infoportalLogo.click();
    await expect(this.dummy).toBeVisible();
  }

  async ClickSearchButton() {
    await this.searchButton.click();
    await expect(this.searchBar).toBeVisible();
  }

  async CheckAllMenuButtons() {
    await this.menuButton.click();
    await expect(this.menuInbox).toBeVisible();
    await expect(this.menuAccessManagement).toBeVisible();
    await expect(this.menuApps).toBeVisible();
    await expect(this.menuStartCompany).toBeVisible();
    await expect(this.menuHelp).toBeVisible();
    await expect(this.menuProfile).toBeVisible();
    await expect(this.menuLanguage).toBeVisible();
    await expect(this.menuLogout).toBeVisible();
    await this.menuButton.click();
  }

  async ClickFavorite(actorName: string) {
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
}
