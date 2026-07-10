import { type Locator, type Page } from '@playwright/test';

import no_nb from '../../src/localizations/no_nb.json';
import no_nn from '../../src/localizations/no_nn.json';
import en from '../../src/localizations/en.json';

export enum Language {
  NB = 'NB',
  EN = 'EN',
  NN = 'NN',
}

/** Localization dictionary shape — bokmål is the canonical, complete file. */
export type Dict = typeof no_nb;

/**
 * no_nn/en are partially untranslated, so TS won't accept them as `Dict` without
 * a cast. We treat bokmål as the schema. The nn/en text a test actually depends
 * on is covered by the tests that run in those languages (consent runs NB/NN/EN,
 * selectSystemVendor runs NN) — a missing key there fails loudly. Almost all
 * other tests run in bokmål, so a broader guard isn't worth the complexity.
 */
const asDict = (localization: unknown): Dict => localization as Dict;

/** The frontend localization file for each language, keyed by the test's language. */
export const LANGUAGE_DICTIONARIES: Record<Language, Dict> = {
  [Language.NB]: no_nb,
  [Language.NN]: asDict(no_nn),
  [Language.EN]: asDict(en),
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
 * The `languageCode` the backend settings API expects
 * (PUT /accessmanagement/api/v1/settings/language/selectedLanguage), matching
 * the i18n resource keys in src/localizations.
 */
export const LANGUAGE_CODE: Record<Language, string> = {
  [Language.NB]: 'no_nb',
  [Language.NN]: 'no_nn',
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
