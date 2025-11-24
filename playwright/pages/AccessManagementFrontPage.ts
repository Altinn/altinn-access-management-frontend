import type { Locator, Page } from '@playwright/test';

export class AccessManagementFrontPage {
  readonly page: Page;
  readonly systemAccessLink: Locator;
  readonly usersLink: Locator;
  readonly powersOfAttorneyLink: Locator;
  readonly ourAccessAtOthersLink: Locator;
  readonly consentAndPowerOfAttorneyAgreementsLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.systemAccessLink = this.page
      .getByRole('group')
      .getByRole('link', { name: 'Systemtilganger' });

    this.usersLink = this.page.getByRole('link', { name: 'Brukere' });
    this.powersOfAttorneyLink = this.page.getByRole('link', { name: 'Fullmakter' });
    this.ourAccessAtOthersLink = this.page.getByRole('link', {
      name: 'Fullmakter hos andre',
    });
    this.consentAndPowerOfAttorneyAgreementsLink = this.page.getByRole('link', {
      name: 'Samtykke- og fullmaktsavtaler',
    });
  }
}
