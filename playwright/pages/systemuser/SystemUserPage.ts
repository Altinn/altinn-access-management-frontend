import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import noNb from '../../../src/localizations/no_nb.json';
import { env } from 'playwright/util/helper';

export class SystemUserPage {
  public readonly SELECT_VENDOR_LABEL: Locator;
  public readonly CONTINUE_BUTTON: Locator;
  public readonly CREATE_SYSTEM_USER_BUTTON: Locator;
  public readonly CREATE_SYSTEM_USER_LINK: Locator;
  public readonly SYSTEMUSER_CREATED_HEADING: Locator;
  public readonly EDIT_SYSTEMUSER_LINK: Locator;
  public readonly DELETE_SYSTEMUSER_BUTTON: Locator;
  public readonly FINAL_DELETE_SYSTEMUSER_BUTTON: Locator;
  public readonly CREATE_NEW_SYSTEMUSER_HEADER: Locator;
  public readonly MAIN_HEADER: Locator;
  public readonly NEW_SYSTEMUSER_LABEL: Locator;
  public readonly escalateConfirmButton: Locator;
  public readonly finish: Locator;
  public readonly requestsMenuItem: Locator;

  constructor(public page: Page) {
    this.SELECT_VENDOR_LABEL = this.page.getByLabel(
      noNb.systemuser_overviewpage.new_system_user_button,
    );

    this.NEW_SYSTEMUSER_LABEL = page.locator('span', {
      hasText: noNb.systemuser_overviewpage.new_system_user,
    });

    this.CREATE_SYSTEM_USER_LINK = page.getByRole('link', {
      name: noNb.systemuser_overviewpage.new_system_user_button,
    });

    this.CONTINUE_BUTTON = this.page.getByRole('button', {
      name: noNb.systemuser_creationpage.confirm_button,
    });
    this.CREATE_SYSTEM_USER_BUTTON = this.page.getByRole('button', {
      name: noNb.systemuser_overviewpage.new_system_user_button,
    });
    this.SYSTEMUSER_CREATED_HEADING = this.page.getByRole('heading', {
      name: noNb.systemuser_overviewpage.existing_system_users_title,
    });

    this.EDIT_SYSTEMUSER_LINK = this.page.getByRole('link', {
      name: noNb.systemuser_overviewpage.edit_system_user,
    });

    this.DELETE_SYSTEMUSER_BUTTON = this.page.getByRole('button', {
      name: noNb.systemuser_detailpage.delete_systemuser,
    });

    this.FINAL_DELETE_SYSTEMUSER_BUTTON = this.page
      .getByRole('button', {
        name: noNb.systemuser_detailpage.delete_systemuser,
      })
      .nth(1);

    this.CREATE_NEW_SYSTEMUSER_HEADER = this.page.getByRole('heading', {
      name: noNb.systemuser_overviewpage.sub_title_text,
    });

    this.MAIN_HEADER = this.page.getByRole('heading', {
      name: noNb.systemuser_overviewpage.banner_title,
      level: 1,
    });

    this.escalateConfirmButton = this.page.getByRole('button', {
      name: noNb.systemuser_request.escalate_confirm_button,
    });

    this.finish = this.page.getByRole('button', {
      name: noNb.systemuser_request.escalate_close_button,
    });

    this.requestsMenuItem = this.page.getByText(noNb.sidebar.requests, { exact: true });
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
    await this.DELETE_SYSTEMUSER_BUTTON.click();
    await this.FINAL_DELETE_SYSTEMUSER_BUTTON.click();
    await expect(this.page).toHaveURL(`${env('SYSTEMUSER_URL')}/overview`);
    await expect(this.systemUserLink(integrationTitle)).toHaveCount(0);
  }

  async selectSystem(system: string) {
    await this.page.getByPlaceholder('Velg').fill(system.slice(0, -1)); //If you type in the entire length it's auto selected
    await this.page.getByLabel(system).waitFor({ state: 'visible' });
    await this.page.getByLabel(system).click();
    await this.CONTINUE_BUTTON.click();
    await this.page.getByRole('button', { name: 'Opprett systemtilgang' }).click();
  }
}
