import type { LanguageCode } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

/**
 * Maps an i18next language (`no_nb`, `no_nn`, `en`) to the `LanguageCode` used by altinn-components.
 * Anything unknown falls back to Bokmål, matching the app's default locale.
 */
export const toLanguageCode = (language: string | undefined): LanguageCode => {
  switch (language) {
    case 'no_nn':
      return 'nn';
    case 'en':
      return 'en';
    default:
      return 'nb';
  }
};

/**
 * The current UI language as an altinn-components `LanguageCode`.
 *
 * Prefers `resolvedLanguage`, which is the language i18next actually loaded translations for.
 * `language` can hold a detected value such as `en-US` that has no translation bundle, in which case
 * i18next silently falls back while `language` keeps the raw value.
 */
export const useLanguageCode = (): LanguageCode => {
  const { i18n } = useTranslation();
  return toLanguageCode(i18n.resolvedLanguage ?? i18n.language);
};
