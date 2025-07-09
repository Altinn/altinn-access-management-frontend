/* eslint-disable @typescript-eslint/no-unused-vars */
import { type Page, expect, Locator } from '@playwright/test';

export class loginWithUser {
  readonly searchBox: Locator;

  constructor(public page: Page) {
    this.searchBox = this.page.getByRole('searchbox', { name: 'Søk etter aktør' });
  }

  async loginWithUser(testUser: string) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await this.page.goto(process.env.BASE_URL as string);
        await this.page.click("'Logg inn/Min profil'");
        await this.page.getByText('TestID Lag din egen').click();
        await this.page.locator("input[name='pid']").fill(testUser);
        await this.page.click("'Autentiser'");

        //Verify you're actually logged in
        await expect(
          this.page.getByRole('heading', { level: 1, name: 'Velg aktør' }),
        ).toBeVisible();

        return; // Exit function if login is successful
      } catch (error) {
        if (attempt === 3) {
          throw new Error('Login failed after 3 retries');
        }

        await this.page.waitForTimeout(2000 * attempt);
      }
    }
  }

  async chooseReportee(reportee: string) {
    let searchbox = this.page.getByRole('searchbox', { name: 'Søk etter aktør' });
    await searchbox.click();
    await searchbox.type(reportee, { delay: 30 }); // delay in milliseconds between key presses, otherwise it won't render content

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

export async function loginNotChoosingActor(page: Page, pid: string) {
  // Ensure we're on a page where login elements are available
  await page.getByRole('link', { name: 'TestID Lag din egen' }).click();
  await page.locator("input[name='pid']").fill(pid);
  await page.click("'Autentiser'");
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

export async function loginAs(page: Page, pid: string, orgnummer: string) {
  await page.goto(process.env.BASE_URL as string);
  await page.click("'Logg inn/Min profil'");
  await page.getByText('TestID Lag din egen').click();
  await page.locator("input[name='pid']").fill(pid);
  await page.click("'Autentiser'");

  // Wait for "Velg aktør" heading to appear
  await expect(page.getByRole('heading', { level: 1, name: 'Velg aktør' })).toBeVisible();

  let searchbox = page.getByRole('searchbox', { name: 'Søk etter aktør' });
  await searchbox.click();
  await searchbox.type(orgnummer, { delay: 0 }); // delay in milliseconds between key presses, otherwise it won't render content

  const aktorPartial = `${orgnummer.slice(0, 3)} ${orgnummer.slice(3, 6)}`; // e.g. "314 239"
  await page.getByRole('button', { name: new RegExp(`Org\\.nr\\. ${aktorPartial}`) }).click();
}
