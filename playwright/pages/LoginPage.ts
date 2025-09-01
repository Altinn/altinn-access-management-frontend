import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly searchBox: Locator;
  readonly pidInput: Locator;
  readonly testIdLink: Locator;
  readonly loginButton: Locator;
  readonly profileLink: Locator;
  readonly velgAktoerHeading: Locator;
  readonly autentiserButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchBox = this.page.getByRole('searchbox', { name: 'Søk etter aktør' });
    this.pidInput = this.page.locator("input[name='pid']");
    this.testIdLink = this.page.getByRole('link', { name: 'TestID Lag din egen' });
    this.loginButton = this.page.getByRole('button', { name: 'Logg inn', exact: true });
    this.profileLink = this.page.getByRole('link', { name: 'profil' });
    this.velgAktoerHeading = this.page.getByRole('heading', { level: 1, name: 'Velg aktør' });
    this.autentiserButton = this.page.getByRole('button', { name: 'Autentiser' });
  }

  async loginWithUser(testUser: string) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await this.navigateToLoginPage();
        await this.authenticateUser(testUser);
        await this.verifyLoginSuccess();
        return;
      } catch (error) {
        console.log(`Login attempt ${attempt} failed with error: ${error}`);
        if (attempt === 3) {
          throw new Error('Login failed after 3 retries');
        }
        await this.page.waitForTimeout(2000 * attempt);
      }
    }
  }

  async loginNotChoosingActor(pid: string) {
    await this.testIdLink.click();
    await this.pidInput.fill(pid);
    await this.autentiserButton.click();
  }

  async loginAcActorOrg(pid: string, orgnummer: string) {
    const baseUrl = process.env.BASE_URL as string;
    await this.page.goto(baseUrl);
    await this.loginButton.click();
    await this.testIdLink.click();
    await this.pidInput.fill(pid);
    await this.autentiserButton.click();

    await expect(this.velgAktoerHeading).toBeVisible();
    await this.selectActor(this.searchBox, orgnummer);
  }

  async loginAsActorPid(pid: string) {
    await this.testIdLink.click();
    await this.pidInput.fill(pid);
    await this.autentiserButton.click();
  }

  async chooseReportee(reportee: string) {
    const chosenReportee = this.page.getByRole('button').filter({ hasText: reportee });
    await chosenReportee.click();

    await this.page.goto(`${process.env.BASE_URL}/ui/profile`);
    await this.profileLink.click();

    const profileHeader = this.page.getByRole('heading', {
      name: new RegExp(
        `Profil for (.*${reportee}.*|.*${reportee.split(' ').reverse().join(' ')}.*)`,
        'i',
      ),
    });
    await expect(profileHeader).toBeVisible();
  }

  private async navigateToLoginPage() {
    await this.page.goto(process.env.BASE_URL as string);
    await this.loginButton.click();
    await this.testIdLink.click();
  }

  private async authenticateUser(pid: string) {
    await this.pidInput.fill(pid);
    await this.autentiserButton.click();
  }

  private async verifyLoginSuccess() {
    await expect(this.velgAktoerHeading).toBeVisible();
  }

  async selectActor(input: Locator, orgnummer: string) {
    const page = input.page();
    const aktorPartial = `${orgnummer.slice(0, 3)} ${orgnummer.slice(3, 6)}`;
    const button = page.getByRole('button', { name: new RegExp(`Org\\.nr\\. ${aktorPartial}`) });

    try {
      await this.tryTypingInSearchbox(input, orgnummer);
      await expect(button).toBeVisible({ timeout: 2000 }); // No need to wait long to figure out if this failed
    } catch (error: unknown) {
      console.log(`Retrying input after reload due to: ${error}`);
      await this.tryTypingInSearchbox(input, orgnummer);
    }

    await button.click();
  }

  async tryTypingInSearchbox(input: Locator, party: string) {
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
    await input.click();
    await input.clear();
    await input.pressSequentially(party);
  }
}

export class logoutWithUser {
  constructor(public page: Page) {}

  async gotoLogoutPage(logoutReportee: string) {
    await this.page.goto(`${process.env.BASE_URL}/ui/profile`);

    if (await this.page.getByText('Oida, denne siden kjenner vi ikke til...').isVisible()) {
      await this.page.getByRole('link', { name: 'profil' }).click();
    }

    await this.page.getByRole('button', { name: logoutReportee }).click();
    await this.page.getByRole('link', { name: 'Logg ut' }).click();
  }
}
