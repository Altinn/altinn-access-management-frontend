import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { env } from 'playwright/util/helper';
import { AccessManagementFrontPage } from './AccessManagementFrontPage';

export class LoginPage {
  readonly page: Page;
  readonly searchBox: Locator;
  readonly pidInput: Locator;
  readonly testIdLink: Locator;
  readonly loginButton: Locator;
  readonly profileLink: Locator;
  readonly velgAktoerHeading: Locator;
  readonly autentiserButton: Locator;
  browserAlreadyUsed: boolean = false;

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

  async LoginWithUserFromFrontpage(pid: string) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await this.navigateToLoginPage();
        await this.authenticateUser(pid);
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
    const baseUrl = env('BASE_URL');
    await this.page.goto(baseUrl);
    await this.loginButton.click();
    await this.testIdLink.click();
    await this.pidInput.fill(pid);
    await this.autentiserButton.click();

    await expect(this.velgAktoerHeading).toBeVisible();
    await this.selectActor(this.searchBox, orgnummer);
  }

  async chooseReportee(reportee: string) {
    // Use test-data independent selector: match button containing "Født:" pattern for person actors
    // Falls back to name-based selector if "Født:" pattern not found (for organizations)
    let selectReporteeButton = this.page.getByRole('button').filter({ hasText: /Født:/ });
    await selectReporteeButton.first().click();

    // Search for reportee in the searchbox
    const searchBox = this.page.getByRole('searchbox', { name: 'Søk i aktører' });
    await searchBox.fill(reportee);

    // Click on the marked/highlighted result
    // The mark element contains the highlighted text, find the button that contains it
    const markedResult = this.page.locator('mark').filter({ hasText: new RegExp(reportee, 'i') });
    //await expect(markedResult).toBeVisible();
    await markedResult.first().click();
  }

  private async navigateToLoginPage() {
    await this.page.goto(env('BASE_URL'));
    await this.page.getByRole('button', { name: 'Meny' }).click();
    await this.page.getByRole('group').getByRole('link', { name: 'Tilgangsstyring' }).click();
    await this.testIdLink.click();
  }

  private async authenticateUser(pid: string) {
    await this.pidInput.fill(pid);
    await this.autentiserButton.click();
  }

  private async verifyLoginSuccess() {
    // Skip button click if browser is already used (e.g., for access package delegation test)
    if (this.browserAlreadyUsed) {
      return;
    }
    const frontPage = new AccessManagementFrontPage(this.page);
    await expect(frontPage.tryNewAccessManagementButton).toBeVisible();
    await frontPage.tryNewAccessManagementButton.click();
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
    await this.page.goto(`${env('BASE_URL')}/ui/profile`);

    if (await this.page.getByText('Oida, denne siden kjenner vi ikke til...').isVisible()) {
      await this.page.getByRole('link', { name: 'profil' }).click();
    }

    await this.page.getByRole('button', { name: logoutReportee }).click();
    await this.page.getByRole('link', { name: 'Logg ut' }).click();
  }
}
