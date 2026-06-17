import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { env } from 'playwright/util/helper';

export class LoginPage {
  readonly page: Page;
  readonly searchBox: Locator;
  readonly reporteeSearchBox: Locator;
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
    this.newSolutionHeading = this.page.getByRole('heading', {
      name: 'Du er nå i den nye løsningen',
    });
  }

  async LoginToAccessManagement(pid: string) {
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
    await expect(dialog).toBeVisible();

    // Søkefeltet vises bare når brukeren har mange aktører (#2299). Vent en kort
    // stund på at det dukker opp — finnes det, filtrer på navnet. Dukker det ikke
    // opp (få aktører) ligger aktøren allerede i en kort liste, og vi klikker den
    // direkte. waitFor retryer, så vi unngår race på et øyeblikks-snapshot.
    const searchBox = dialog.getByRole('searchbox');
    try {
      await searchBox.waitFor({ state: 'visible', timeout: 3000 });
      await searchBox.fill(targetReportee);
    } catch {
      // Ingen søkefelt – brukeren har få aktører.
    }

    await dialog.getByRole('menuitem', { name: targetReportee }).first().click();
    await expect(dialog).not.toBeVisible();
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
