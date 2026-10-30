import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { env } from 'playwright/util/helper';
import { LANGUAGE_CODE, Language } from 'playwright/pages/LanguageMenu';
import type { ApiClient } from 'playwright/api-requests';

/** The only client LoginPage uses: language before login. */
type LoginApi = Pick<ApiClient, 'settings'>;

/**
 * Heading of the account selector. The text comes from AccountSelector in
 * @altinn/altinn-components, not from src/localizations, so it is not in the dict.
 */
const ACCOUNT_SELECTOR_HEADING: Record<Language, string> = {
  [Language.NB]: 'Hvem vil du bruke Altinn på vegne av?',
  [Language.NN]: 'Kven vil du bruke Altinn på vegner av?',
  [Language.EN]: 'Who do you want to use Altinn on behalf of?',
};

export class LoginPage {
  readonly page: Page;
  private readonly language: Language;
  private readonly api: LoginApi;
  readonly accountSearchBox: Locator;
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
    this.pidInput = this.page.getByRole('textbox', { name: 'Personidentifikator' });
    this.testIdLink = this.page.getByRole('link', { name: 'TestID Lag din egen' });
    this.loginButton = this.page.getByRole('button', { name: 'Logg inn', exact: true });
    this.profileLink = this.page.getByRole('link', { name: 'profil' });
    // Aktørvalget er en h1 i hovedinnholdet når det er påtvunget rett etter innlogging,
    // og en h2 i en dialog når det åpnes fra kontomenyen i headeren.
    const accountSelectorHeading = ACCOUNT_SELECTOR_HEADING[language];
    this.velgAktoerHeading = this.page.getByRole('heading', {
      name: accountSelectorHeading,
      exact: true,
    });
    // Søkefeltet er merket med overskriften (aria-labelledby)
    this.accountSearchBox = this.page.getByRole('searchbox', {
      name: accountSelectorHeading,
      exact: true,
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
  }

  async selectActor(targetReportee: string) {
    await expect(this.velgAktoerHeading).toBeVisible();

    // Søkefeltet vises bare når brukeren har flere enn 5 aktører. Det rendres sammen
    // med overskriften, så når overskriften er synlig kan vi lese det av som en bruker.
    if (await this.accountSearchBox.isVisible()) {
      await this.accountSearchBox.fill(targetReportee);
    }

    // Hoved- og underenhet har samme navn; den første er hovedenheten
    await this.accountOption(targetReportee).first().click();
    await expect(this.velgAktoerHeading).not.toBeVisible();
  }

  private accountOption(name: string): Locator {
    return this.page.getByRole('menuitem', { name });
  }

  private async navigateToLoginPage() {
    await this.page.goto(env('BASE_URL'));
    await expect(this.testIdLink).toBeVisible();
    await this.testIdLink.click();
  }

  private async authenticateUser(pid: string) {
    await this.pidInput.fill(pid);
    await this.autentiserButton.click();
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
