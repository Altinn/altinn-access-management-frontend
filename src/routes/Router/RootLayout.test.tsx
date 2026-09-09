import { act, render, screen } from '@testing-library/react';
import i18next, { type i18n as I18n } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RootLayout } from './RootLayout';

/**
 * Mirrors the i18next setup in src/main.jsx: the language is detected synchronously from the
 * `selectedLanguage` cookie that the BFF sets from the user's profile before the app is served.
 */
const initI18n = (): I18n => {
  const instance = i18next.createInstance();
  instance
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      detection: { lookupCookie: 'selectedLanguage', order: ['cookie'], caches: [] },
      resources: {
        no_nb: { translation: {} },
        no_nn: { translation: {} },
        en: { translation: {} },
      },
      fallbackLng: 'no_nb',
      initImmediate: false,
    });
  return instance;
};

type SkyraStub = {
  setLanguage: ReturnType<typeof vi.fn>;
  setConsent: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  reload: ReturnType<typeof vi.fn>;
};

const stubSkyra = (): SkyraStub => {
  const skyra = { setLanguage: vi.fn(), setConsent: vi.fn(), on: vi.fn(), reload: vi.fn() };
  Object.assign(window, { skyra, featureFlags: { enableSkyra: true } });
  // Pretend the SDK script is already on the page so the component doesn't try to load it.
  const script = document.createElement('script');
  script.id = 'skyra-survey-sdk';
  document.head.appendChild(script);
  return skyra;
};

const renderRootLayout = () => {
  const router = createMemoryRouter(
    [{ path: '/', element: <RootLayout />, children: [{ index: true, element: <p>child</p> }] }],
    { initialEntries: ['/'] },
  );
  return render(<RouterProvider router={router} />);
};

describe('RootLayout', () => {
  beforeEach(() => {
    document.cookie = 'selectedLanguage=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  afterEach(() => {
    document.getElementById('skyra-survey-sdk')?.remove();
    Object.assign(window, { skyra: undefined, featureFlags: undefined });
  });

  it('hands the language from the cookie to Skyra on first render', () => {
    document.cookie = 'selectedLanguage=no_nn';
    initI18n();
    const skyra = stubSkyra();

    renderRootLayout();

    expect(screen.getByText('child')).toBeInTheDocument();
    expect(skyra.setLanguage).toHaveBeenCalledWith('nn');
    expect(skyra.setLanguage).not.toHaveBeenCalledWith('no');
  });

  it('defaults to Bokmål ("no" in Skyra) when no language cookie is set', () => {
    initI18n();
    const skyra = stubSkyra();

    renderRootLayout();

    expect(skyra.setLanguage).toHaveBeenCalledWith('no');
  });

  it('forwards a language change to Skyra', async () => {
    document.cookie = 'selectedLanguage=no_nb';
    const i18n = initI18n();
    const skyra = stubSkyra();

    renderRootLayout();
    skyra.setLanguage.mockClear();

    await act(async () => {
      await i18n.changeLanguage('en');
    });

    expect(skyra.setLanguage).toHaveBeenCalledWith('en');
  });

  it('does not load Skyra when the feature flag is off', () => {
    initI18n();
    const skyra = stubSkyra();
    Object.assign(window, { featureFlags: { enableSkyra: false } });

    renderRootLayout();

    expect(skyra.setLanguage).not.toHaveBeenCalled();
  });
});
