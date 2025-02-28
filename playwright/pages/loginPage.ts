/* eslint-disable @typescript-eslint/no-unused-vars */
import { type Page, expect } from '@playwright/test';

export class loginWithUser {
  constructor(public page: Page) {}

  async loginWithUser(testUser: string) {
    await this.page.goto(process.env.BASE_URL as string);
    await this.page.click("'Logg inn/Min profil'");
    await this.page.getByText('TestID Lag din egen').click();
    await this.page.locator("input[name='pid']").fill(testUser);
    await this.page.click("'Autentiser'");
  }

  async chooseReportee(reportee: string) {
    await this.page.getByRole('searchbox', { name: 'Søk etter aktør' }).fill(reportee);
    const chosenReportee = this.page.getByRole('button').filter({ hasText: reportee });
    await chosenReportee.click();
    await this.page.goto((process.env.BASE_URL as string) + '/ui/profile');
    await this.page.click("'profil'");

    //Some names are in reverse order, so we need to support that when verifying the profile header
    const profileHeader = this.page.getByRole('heading', {
      name: new RegExp(
        `Profil for (.*${reportee}.*|.*${reportee.split(' ').reverse().join(' ')}.*)`,
        'i',
      ),
    });
    await expect(profileHeader).toBeVisible();
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
