import { type Locator, type Page } from '@playwright/test';

export enum Language {
  NB = 'NB',
  EN = 'EN',
  NN = 'NN',
}

/**
 * The locale picker in the Altinn header / page menu. The three language
 * choices render as `menuitemradio` items labelled with their own
 * (untranslated) language names. Shared across the header components that
 * expose a language switcher (ConsentPage, AktorvalgHeader).
 */
export class LanguageMenu {
  readonly page: Page;
  readonly bokmal: Locator;
  readonly nynorsk: Locator;
  readonly english: Locator;

  constructor(page: Page) {
    this.page = page;

    this.bokmal = page.getByRole('menuitemradio', { name: 'Norsk (bokmål)' });
    this.nynorsk = page.getByRole('menuitemradio', { name: 'Norsk (nynorsk)' });
    this.english = page.getByRole('menuitemradio', { name: 'English' });
  }

  option(lang: Language): Locator {
    switch (lang) {
      case Language.EN:
        return this.english;
      case Language.NN:
        return this.nynorsk;
      case Language.NB:
      default:
        return this.bokmal;
    }
  }

  async select(lang: Language): Promise<void> {
    await this.option(lang).click();
  }
}
