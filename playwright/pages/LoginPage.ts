import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { env } from 'playwright/util/helper';
import { LANGUAGE_CODE, Language } from 'playwright/pages/LanguageMenu';
import type { ApiClient } from 'playwright/api-requests';

/** The only clients LoginPage uses: language before login, actor count after. */
type LoginApi = Pick<ApiClient, 'settings' | 'authorizedParties'>;

export class LoginPage {
  readonly page: Page;
  private readonly language: Language;
  private readonly api: LoginApi;
  private loggedInPid?: string;
  readonly reporteeSearchBox: Locator;
  readonly pidInput: Locator;
  readonly testIdLink: Locator;
  readonly loginButton: Locator;
  readonly profileLink: Locator;
  readonly velgAktoerHeading: Locator;
  readonly autentiserButton: Locator;
  readonly tilgangsstyringLink: Locator;
  readonly testIdLinkText: Locator;

  constructor(page: Page, api: LoginApi, language: Language = Language.NB) {
    this.page = page;
    this.api = api;
    this.language = language;
    // Post-login "Velg aktør" page has a different (unnamed) searchbox — there is
    // only one searchbox role on that page, so a name is not needed to disambiguate.
    this.reporteeSearchBox = this.page.getByRole('searchbox');
    this.pidInput = this.page.getByRole('textbox', { name: 'Personidentifikator' });
    this.testIdLink = this.page.getByRole('link', { name: 'TestID Lag din egen' });
    this.loginButton = this.page.getByRole('button', { name: 'Logg inn', exact: true });
    this.profileLink = this.page.getByRole('link', { name: 'profil' });
    this.velgAktoerHeading = this.page.getByRole('heading', {
      level: 1,
      name: 'Hvem vil du bruke Altinn på vegne av?',
    });
    this.autentiserButton = this.page.getByRole('button', { name: 'Autentiser' });
    this.tilgangsstyringLink = this.page.getByRole('link', { name: 'Tilgangsstyring' });
    this.testIdLinkText = this.page.getByRole('link', {
      name: /TestID Lag din egen testbruker/i,
    });
  }

  async LoginToAccessManagement(pid: string) {
    // Setter språk med en gang i tilfelle noen har endret dette som kan brekke testen
    await this.api.settings.setSelectedLanguage(pid, LANGUAGE_CODE[this.language]);
    await this.navigateToLoginPage();
    await this.authenticateUser(pid);
  }

  /**
   * Logger inn fra en side som allerede har sendt brukeren til ID-porten (f.eks. samtykke).
   * Språket settes via API før innlogging, med mindre testen skal velge det i GUI.
   */
  async loginNotChoosingActor(pid: string, { setLanguage = true } = {}) {
    if (setLanguage) {
      await this.api.settings.setSelectedLanguage(pid, LANGUAGE_CODE[this.language]);
    }
    await this.testIdLink.click();
    await this.pidInput.fill(pid);
    await this.autentiserButton.click();
    this.loggedInPid = pid;
  }

  async selectActor(targetReportee: string) {
    if (!this.loggedInPid) {
      throw new Error('Log in before selecting an actor.');
    }
    const antallAktoerer = await this.api.authorizedParties.antallAktoererForbruker(
      this.loggedInPid,
    );
    await expect(this.velgAktoerHeading).toBeVisible();

    // Rett etter innlogging er velgeren en hel side; ellers ligger den i en dialog
    const dialog = this.page.getByRole('dialog');
    const root = (await dialog.count()) > 0 ? dialog : this.page;

    const searchBox = root.getByRole('searchbox');
    const item = root.getByRole('menuitem', { name: targetReportee }).first();

    // Dersom flere enn 5 kan man søke i aktørene
    if (antallAktoerer > 5) {
      await searchBox.fill(targetReportee);
    }

    await item.click();
    await expect(this.velgAktoerHeading).not.toBeVisible();
  }

  private async navigateToLoginPage() {
    await this.page.goto(env('BASE_URL'));
    await expect(this.testIdLink).toBeVisible();
    await this.testIdLink.click();
  }

  private async authenticateUser(pid: string) {
    await this.pidInput.fill(pid);
    await this.autentiserButton.click();
    this.loggedInPid = pid;
  }
}

export class logoutWithUser {
  constructor(public page: Page) {}

  async gotoLogoutPage(logoutReportee: string) {
    await this.page.goto(`${env('BASE_URL')}/ui/profile`);

    try {
      await expect(this.page.getByText('Oida, denne siden kjenner vi ikke til...')).toBeVisible({
        timeout: 1000,
      });
      await this.page.getByRole('link', { name: 'profil' }).click();
    } catch {
      // Profile page loaded directly, no fallback navigation needed
    }

    await this.page.getByRole('button', { name: logoutReportee }).click();
    await this.page.getByRole('link', { name: 'Logg ut' }).click();
  }
}
