/* eslint-disable @typescript-eslint/no-unused-vars */
import { chromium, type Page, expect } from '@playwright/test';

export class loginWithUser {
  constructor(public page: Page) {}

  async gotoLoginPage(testUser: string, page: Page) {
    await this.page.goto(process.env.BASE_URL as string);
    await this.page.click("'Logg inn/Min profil'");
    await this.page.click('xpath=//*[@id="testid1"]');
    await this.page.locator("input[name='pid']").fill(testUser);
    await this.page.click("'Autentiser'");
  }

  async chooseReportee(reportee: string, page: Page) {
    await this.page.getByRole('searchbox', { name: 'Søk etter aktør' }).fill(reportee);
    await this.page.keyboard.press('Enter');
    const chosenReportee = await this.page
      .getByRole('button', { name: reportee })
      .filter({ hasText: reportee });
    await chosenReportee.click();
    await this.page.keyboard.press('Enter');
    await this.page.goto((process.env.BASE_URL as string) + '/ui/profile');
    await this.page.click("'profil'");
    const profileHeader = await this.page.getByRole('heading', { name: new RegExp(reportee, 'i') });
    await expect(profileHeader).toBeVisible();
    console.log(profileHeader);
  }
}
export class logoutWithUser {
  constructor(public page: Page) {}

  async gotoLogoutPage(logoutReportee: string, page: Page) {
    await this.page.goto(process.env.BASE_URL + '/ui/profile');
    await this.page.getByRole('button', { name: logoutReportee }).click();
    await this.page.getByRole('link', { name: 'Logg ut' }).click();
  }
}
