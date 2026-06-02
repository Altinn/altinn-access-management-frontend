import type { Locator, Page } from '@playwright/test';

export class SystemUserConfirmPage {
  readonly page: Page;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.approveButton = this.page.getByRole('button', { name: 'Godkjenn' });
    this.rejectButton = this.page.getByRole('button', { name: 'Avvis' });
  }

  async approve() {
    await this.approveButton.click();
  }

  async reject() {
    await this.rejectButton.click();
  }
}
