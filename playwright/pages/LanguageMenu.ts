import { type Locator, type Page } from '@playwright/test';

import no_nb from '../../src/localizations/no_nb.json';
import no_nn from '../../src/localizations/no_nn.json';
import en from '../../src/localizations/en.json';

export enum Language {
  NB = 'NB',
  EN = 'EN',
  NN = 'NN',
}

/** Localization dictionary shape (bokmål is the canonical/complete one). */
export type Dict = typeof no_nb;

/**
 * The frontend localization file for each language, keyed by the test's language.
 * nn/en are cast to the bokmål shape (the canonical/complete one); the keys the
 * tests reference exist in all three files.
 */
export const DICTIONARIES: Record<Language, Dict> = {
  [Language.NB]: no_nb,
  [Language.NN]: no_nn as unknown as Dict,
  [Language.EN]: en as unknown as Dict,
};

/**
 * The value the app writes to `<html lang>` per language
 * (see useHeader.tsx: no_nn -> 'nn', en -> 'en', otherwise 'nb').
 */
export const HTML_LANG: Record<Language, string> = {
  [Language.NB]: 'nb',
  [Language.NN]: 'nn',
  [Language.EN]: 'en',
};

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
