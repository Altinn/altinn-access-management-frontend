import { type Page, expect, Locator } from '@playwright/test';

export class loginWithUser {
  readonly page: Page;
  readonly searchBox: Locator;
  readonly pidInput: Locator;
  readonly testIdLink: Locator;
  readonly loginButton: Locator;
  readonly profileLink: Locator;
  readonly velgAktoerHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchBox = this.page.getByRole('searchbox', { name: 'Søk etter aktør' });
    this.pidInput = this.page.locator("input[name='pid']");
    this.testIdLink = this.page.getByRole('link', { name: 'TestID Lag din egen' });
    this.loginButton = this.page.getByText("'Logg inn/Min profil'");
    this.profileLink = this.page.getByRole('link', { name: 'profil' });
    this.velgAktoerHeading = this.page.getByRole('heading', { level: 1, name: 'Velg aktør' });
  }

  async loginWithUser(testUser: string) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await this.navigateToLoginPage();
        await this.authenticateUser(testUser);
        await this.verifyLoginSuccess();
        return;
      } catch (error) {
        if (attempt === 3) {
          throw new Error('Login failed after 3 retries');
        }
        await this.page.waitForTimeout(2000 * attempt);
      }
    }
  }

  async chooseReportee(reportee: string) {
    await this.retrySearchBoxTyping(this.searchBox, reportee);

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
    await this.page.click("'Autentiser'");
  }

  private async verifyLoginSuccess() {
    await expect(this.velgAktoerHeading).toBeVisible();
  }

  private async retrySearchBoxTyping(input: Locator, text: string) {
    try {
      await expect(input).toBeVisible();
      await expect(input).toBeEnabled();
      await input.click();
      await input.type(text, { delay: 0 });
    } catch (error) {
      console.log(`Retrying input after reload due to: ${error}`);
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await expect(input).toBeVisible();
      await expect(input).toBeEnabled();
      await input.click();
      await input.type(text, { delay: 0 });
    }
  }
}

export async function loginNotChoosingActor(page: Page, pid: string) {
  const testIdLink = page.getByRole('link', { name: 'TestID Lag din egen' });
  const pidInput = page.locator("input[name='pid']");

  await testIdLink.click();
  await pidInput.fill(pid);
  await page.click("'Autentiser'");
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

export async function loginAs(page: Page, pid: string, orgnummer: string) {
  const baseUrl = process.env.BASE_URL as string;
  await page.goto(baseUrl);
  await page.click("'Logg inn/Min profil'");
  await page.getByText('TestID Lag din egen').click();
  await page.locator("input[name='pid']").fill(pid);
  await page.click("'Autentiser'");

  await expect(page.getByRole('heading', { level: 1, name: 'Velg aktør' })).toBeVisible();

  const searchbox = page.getByRole('searchbox', { name: 'Søk etter aktør' });
  await retrySearchBoxTyping(searchbox, orgnummer);

  const aktorPartial = `${orgnummer.slice(0, 3)} ${orgnummer.slice(3, 6)}`;
  await page.getByRole('button', { name: new RegExp(`Org\\.nr\\. ${aktorPartial}`) }).click();
}

// Shared function reused by both loginAs and class above
async function retrySearchBoxTyping(input: Locator, text: string) {
  const page = input.page();

  try {
    await tryTypingInSearchbox(input, text);
  } catch (error) {
    console.log(`Retrying input after reload due to: ${error}`);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await tryTypingInSearchbox(input, text);
  }
}

async function tryTypingInSearchbox(input: Locator, text: string) {
  await expect(input).toBeVisible();
  await expect(input).toBeEnabled();
  await input.click();
  await input.type(text, { delay: 0 });
}
