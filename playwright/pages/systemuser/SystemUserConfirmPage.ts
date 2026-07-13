import type { Locator, Page } from '@playwright/test';

import { LANGUAGE_DICTIONARIES, Language } from '../LanguageMenu';

export class SystemUserConfirmPage {
  readonly page: Page;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;

  constructor(page: Page, language: Language = Language.NB) {
    this.page = page;
    const texts = LANGUAGE_DICTIONARIES[language];
    this.approveButton = this.page.getByRole('button', {
      name: texts.request_page.approve_request,
    });
    this.rejectButton = this.page.getByRole('button', { name: texts.systemuser_request.reject });
  }

  async approve() {
    await this.approveButton.click();
  }

  async reject() {
    await this.rejectButton.click();
  }
}
