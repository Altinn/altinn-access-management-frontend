import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { env } from 'playwright/util/helper';
import { LANGUAGE_CODE, Language } from 'playwright/pages/LanguageMenu';
import { SettingsApiRequests } from 'playwright/api-requests/SettingsApiRequests';

export class LoginPage {
  readonly page: Page;
  private readonly language: Language;
  private readonly settings: SettingsApiRequests;
  readonly reporteeSearchBox: Locator;
  readonly pidInput: Locator;
  readonly testIdLink: Locator;
  readonly loginButton: Locator;
  readonly profileLink: Locator;
  readonly velgAktoerHeading: Locator;
  readonly autentiserButton: Locator;
  readonly tilgangsstyringLink: Locator;
  readonly testIdLinkText: Locator;

  constructor(page: Page, language: Language = Language.NB) {
    this.page = page;
    this.language = language;
    this.settings = new SettingsApiRequests();
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
    // Pin the UI language server-side BEFORE login, so the app seeds the
    // selectedLanguage cookie from the profile at login. Keeps the session in
    // the fixture's language (default no_nb) regardless of the user's profile.
    await this.settings.setSelectedLanguage(pid, LANGUAGE_CODE[this.language]);
    await this.navigateToLoginPage();
    await this.authenticateUser(pid);
  }

  async loginNotChoosingActor(pid: string) {
    await this.testIdLink.click();
    await this.pidInput.fill(pid);
    await this.autentiserButton.click();
  }

  async selectMainUnitBySearching(targetReportee: string) {
    const dialog = this.page.getByRole('dialog');
    const searchBox = dialog.getByRole('searchbox');
    const menuitem = dialog.getByRole('menuitem', { name: targetReportee }).first();
    // Forsiden viser den aktive aktørens navn som H1. Det er et pålitelig signal
    // på at riktig aktør er valgt – enten automatisk (kun én aktør ⇒ ingen
    // dialog) eller etter at vi har valgt i kontovelgeren.
    const frontPage = this.page.getByRole('heading', { level: 1, name: targetReportee });

    // Etter «Autentiser» sendes en bruker med bare én aktør rett til forsiden
    // (ingen «Velg aktør»-dialog – som kan blinke innom og forsvinne igjen),
    // mens en bruker med flere aktører må velge i kontovelgeren. Vi prøver derfor
    // til vi står på forsiden: er vi ikke der, velger vi aktøren i dialogen.
    // Kontovelgeren re-rendrer mens aktørene lastes, så vi prøver på nytt om
    // klikket bommer (menyelementet detacher).
    await expect(async () => {
      if (await frontPage.isVisible().catch(() => false)) return; // aktør allerede aktiv
      // Søkefeltet vises bare når brukeren har mange aktører (#2299).
      if (await searchBox.isVisible().catch(() => false)) {
        await searchBox.fill(targetReportee);
      }
      await expect(menuitem).toBeVisible({ timeout: 5000 });
      await menuitem.click();
      await expect(frontPage).toBeVisible({ timeout: 5000 });
    }).toPass({ timeout: 30000 });
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
