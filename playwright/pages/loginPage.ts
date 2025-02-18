/* eslint-disable @typescript-eslint/no-unused-vars */
import { chromium, type Page, expect, Locator } from '@playwright/test';
import { login } from '../pageSelectors/login';

export class LoginPage {
  constructor(public page: Page) {
    this.loginButton = page.getByText('Logg inn/Min profil', { exact: true });
    this.testIDButton = page.getByText('TestID Lag din egen');
    this.identInput = page.locator('input[name="pid"]');
    this.autentiserButton = page.getByText('Autentiser');
  }

  // Define locators
  public loginButton: Locator;
  public testIDButton: Locator;
  public identInput: Locator;
  public autentiserButton: Locator;

  // Define methods
  public async loginWithUser(testUser: string) {
    await this.page.goto(process.env.BASE_URL as string);
    await this.loginButton.click();
    await this.testIDButton.click();
    await this.identInput.fill(testUser);
    await this.autentiserButton.click();
  }

  async chooseReportee(reportee: string) {
    await this.page.getByRole('searchbox', { name: 'Søk etter aktør' }).fill(reportee);
    const chosenReportee = this.page.getByRole('button').filter({ hasText: reportee });
    await chosenReportee.click();
  }
}

export class logoutWithUser {
  constructor(public page: Page) {}

  async gotoLogoutPage(logoutReportee: string) {
    await this.page.goto(process.env.BASE_URL + '/ui/profile');
    if (await this.page.getByText('Oida, denne siden kjenner vi ikke til...').isVisible()) {
      await this.page.click("'profil'");
    }
    await this.page.getByRole('button', { name: logoutReportee }).click();
    await this.page.getByRole('link', { name: 'Logg ut' }).click();
  }
}
