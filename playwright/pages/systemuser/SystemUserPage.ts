import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { env } from 'playwright/util/helper';
import { LANGUAGE_DICTIONARIES, Language } from '../LanguageMenu';

export class SystemUserPage {
  public readonly selectVendorLabel: Locator;
  public readonly continueButton: Locator;
  public readonly createSystemUserButton: Locator;
  public readonly createSystemUserLink: Locator;
  public readonly systemUserCreatedHeading: Locator;
  public readonly editSystemUserLink: Locator;
  public readonly deleteSystemUserButton: Locator;
  public readonly finalDeleteSystemUserButton: Locator;
  public readonly createNewSystemUserHeader: Locator;
  public readonly mainHeader: Locator;
  public readonly newSystemUserLabel: Locator;
  public readonly escalateConfirmButton: Locator;
  public readonly finish: Locator;
  public readonly requestsMenuItem: Locator;

  constructor(
    public page: Page,
    language: Language = Language.NB,
  ) {
    const texts = LANGUAGE_DICTIONARIES[language];
    this.selectVendorLabel = this.page.getByLabel(
      texts.systemuser_overviewpage.new_system_user_button,
    );

    this.newSystemUserLabel = page.locator('span', {
      hasText: texts.systemuser_overviewpage.new_system_user,
    });

    this.createSystemUserLink = page.getByRole('link', {
      name: texts.systemuser_overviewpage.new_system_user_button,
    });

    this.continueButton = this.page.getByRole('button', {
      name: texts.systemuser_creationpage.confirm_button,
    });
    this.createSystemUserButton = this.page.getByRole('button', {
      name: texts.systemuser_overviewpage.new_system_user_button,
    });
    this.systemUserCreatedHeading = this.page.getByRole('heading', {
      name: texts.systemuser_overviewpage.existing_system_users_title,
    });

    this.editSystemUserLink = this.page.getByRole('link', {
      name: texts.systemuser_overviewpage.edit_system_user,
    });

    this.deleteSystemUserButton = this.page.getByRole('button', {
      name: texts.systemuser_detailpage.delete_systemuser,
    });

    this.finalDeleteSystemUserButton = this.page
      .getByRole('button', {
        name: texts.systemuser_detailpage.delete_systemuser,
      })
      .nth(1);

    this.createNewSystemUserHeader = this.page.getByRole('heading', {
      name: texts.systemuser_overviewpage.sub_title_text,
    });

    this.mainHeader = this.page.getByRole('heading', {
      name: texts.systemuser_overviewpage.banner_title,
      level: 1,
    });

    this.escalateConfirmButton = this.page.getByRole('button', {
      name: texts.systemuser_request.escalate_confirm_button,
    });

    this.finish = this.page.getByRole('button', {
      name: texts.systemuser_request.escalate_close_button,
    });

    this.requestsMenuItem = this.page.getByText(texts.sidebar.requests, { exact: true });
  }

  requestLink(requestId: string) {
    return this.page.locator(`a[href*="${requestId}"]`);
  }

  systemUserLink(integrationTitle: string): Locator {
    return this.page.getByRole('link', { name: integrationTitle });
  }

  async openSystemUser(integrationTitle: string): Promise<void> {
    const link = this.systemUserLink(integrationTitle);
    await expect(link).toBeVisible();
    await link.click();
  }

  async deleteSystemUser(integrationTitle: string): Promise<void> {
    await this.deleteSystemUserButton.click();
    await this.finalDeleteSystemUserButton.click();
    await expect(this.page).toHaveURL(`${env('SYSTEMUSER_URL')}/overview`);
    await expect(this.systemUserLink(integrationTitle)).toHaveCount(0);
  }

  async selectSystem(system: string) {
    await this.page.getByPlaceholder('Velg').fill(system.slice(0, -1)); //If you type in the entire length it's auto selected
    await this.page.getByLabel(system).waitFor({ state: 'visible' });
    await this.page.getByLabel(system).click();
    await this.continueButton.click();
    await this.page.getByRole('button', { name: 'Opprett systemtilgang' }).click();
  }
}
