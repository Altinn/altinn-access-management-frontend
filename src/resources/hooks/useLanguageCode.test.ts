import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { toLanguageCode, useLanguageCode } from './useLanguageCode';

const i18nState: { language: string; resolvedLanguage?: string } = { language: 'no_nb' };

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: i18nState }),
}));

describe('toLanguageCode', () => {
  it.each([
    ['no_nb', 'nb'],
    ['no_nn', 'nn'],
    ['en', 'en'],
    ['en-US', 'nb'],
    [undefined, 'nb'],
  ])('maps %s to %s', (input, expected) => {
    expect(toLanguageCode(input)).toBe(expected);
  });
});

describe('useLanguageCode', () => {
  it('uses the resolved language when i18next has one', () => {
    i18nState.language = 'en-US';
    i18nState.resolvedLanguage = 'en';
    expect(renderHook(() => useLanguageCode()).result.current).toBe('en');
  });

  it('falls back to the raw language when nothing is resolved yet', () => {
    i18nState.language = 'no_nn';
    i18nState.resolvedLanguage = undefined;
    expect(renderHook(() => useLanguageCode()).result.current).toBe('nn');
  });
});
