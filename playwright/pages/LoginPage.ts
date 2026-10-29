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
    this.velgAktoerHeading = this.page.getByRole('heading', { level: 1, name: 'Velg aktør' });
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
    // Aktørvalget rendres som hovedinnhold når det er påtvunget rett etter innlogging,
    // og som dialog når det åpnes fra kontomenyen i headeren.
    const hasMenu = { has: this.page.getByRole('menu') };
    const accountSelector = this.page
      .getByRole('dialog')
      .filter(hasMenu)
      .or(this.page.getByRole('main').filter(hasMenu))
      .first();
    const menu = accountSelector.getByRole('menu');
    await expect(menu).toBeVisible();

    const searchBox = accountSelector.getByRole('searchbox');
    const item = menu.getByRole('menuitem', { name: targetReportee }).first();

    // Dersom flere enn 5 kan man søke i aktørene
    if (antallAktoerer > 5) {
      await searchBox.fill(targetReportee);
    }

    await item.click();
    await expect(menu).toBeHidden();
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
