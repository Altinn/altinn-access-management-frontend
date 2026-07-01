import type { Locator, Page } from '@playwright/test';

import { DICTIONARIES, Language, type Dict } from '../LanguageMenu';

export class SystemUserConfirmPage {
  readonly page: Page;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;

  constructor(page: Page, dict: Dict = DICTIONARIES[Language.NB]) {
    this.page = page;
    this.approveButton = this.page.getByRole('button', {
      name: dict.request_page.approve_request,
    });
    this.rejectButton = this.page.getByRole('button', { name: dict.systemuser_request.reject });
  }

  async approve() {
    await this.approveButton.click();
  }

  async reject() {
    await this.rejectButton.click();
  }
}
