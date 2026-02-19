import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { env } from 'playwright/util/helper';

export class LoginPage {
  readonly page: Page;
  readonly searchBox: Locator;
  readonly pidInput: Locator;
  readonly testIdLink: Locator;
  readonly loginButton: Locator;
  readonly profileLink: Locator;
  readonly velgAktoerHeading: Locator;
  readonly autentiserButton: Locator;
  readonly tilgangsstyringLink: Locator;
  readonly testIdLinkText: Locator;
  readonly newSolutionHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchBox = this.page.getByRole('searchbox', { name: 'Søk etter aktør' });
    this.pidInput = this.page.locator("input[name='pid']");
    this.testIdLink = this.page.getByRole('link', { name: 'TestID Lag din egen' });
    this.loginButton = this.page.getByRole('button', { name: 'Logg inn', exact: true });
    this.profileLink = this.page.getByRole('link', { name: 'profil' });
    this.velgAktoerHeading = this.page.getByRole('heading', { level: 1, name: 'Velg aktør' });
    this.autentiserButton = this.page.getByRole('button', { name: 'Autentiser' });
    this.tilgangsstyringLink = this.page.getByRole('link', { name: 'Tilgangsstyring' });
    this.testIdLinkText = this.page.getByRole('link', {
      name: /TestID Lag din egen testbruker/i,
    });
    this.newSolutionHeading = this.page.getByRole('heading', {
      name: 'Du er nå i den nye løsningen',
    });
  }

  async LoginToAccessManagement(pid: string) {
    await this.clickLoginToAccessManagement();
    await this.authenticateUser(pid);
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

  async chooseReportee(currentReportee: string, targetReportee: string = '') {
    let selectReporteeButton = this.page.getByRole('button', { name: currentReportee });

    // Search for target reportee in the searchbox
    const searchBox = this.page.getByRole('searchbox', { name: 'Søk i aktører' });
    await searchBox.fill(targetReportee);

    const markedResult = this.page
      .locator('mark')
      .filter({ hasText: new RegExp(targetReportee, 'i') });
    await markedResult.first().click();
  }

  private async clickLoginToAccessManagement() {
    await this.page.getByRole('button', { name: 'Meny' }).click();
    await expect(
      this.page.getByRole('navigation', { name: 'Menu' }).getByLabel('Tilgangsstyring'),
    ).toBeVisible();
    await this.page.getByRole('navigation', { name: 'Menu' }).getByLabel('Tilgangsstyring').click();
    await this.testIdLink.click();
  }

  private async authenticateUser(pid: string) {
    await this.pidInput.fill(pid);
    await this.autentiserButton.click();
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
