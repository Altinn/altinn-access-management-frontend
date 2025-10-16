import type { Preview } from '@storybook/react-vite';

import '@/resources/css/Common.module.css';

import '@altinn/altinn-components/dist/global.css';

// Extend Window interface for feature flags
declare global {
  interface Window {
    featureFlags?: {
      displayPopularSingleRightsServices: boolean;
      displayConfettiPackage: boolean;
      displayLimitedPreviewLaunch: boolean;
      displayResourceDelegation: boolean;
      restrictPrivUse: boolean;
      displaySettingsPage: boolean;
      displayPoaOverviewPage: boolean;
      crossPlatformLinks: boolean;
      displayConsentGui: boolean;
    };
  }
}

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import no_nb from '../src/localizations/no_nb.json';
import no_nn from '../src/localizations/no_nn.json';
import en from '../src/localizations/en.json';
import { Suspense, useEffect } from 'react';
import React from 'react';
import { Router } from 'react-router';

import { worker } from '../.mock/browser';
worker.start();

// Set altinn cookies when Storybook starts
document.cookie = 'AltinnPartyUuid=mocked-party-uuid; path=/; SameSite=Lax';
document.cookie = 'AltinnPartyId=mocked-party-id; path=/; SameSite=Lax';
document.cookie = 'XSRF-TOKEN=mocked-xsrf-token; path=/; SameSite=Lax';

// Set feature flags for Storybook
window.featureFlags = {
  displayPopularSingleRightsServices: false,
  displayConfettiPackage: true,
  displayLimitedPreviewLaunch: false,
  displayResourceDelegation: true,
  restrictPrivUse: false,
  displaySettingsPage: true,
  displayPoaOverviewPage: true,
  crossPlatformLinks: false,
  displayConsentGui: false,
};

// Initialise i18next;
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    detection: { lookupCookie: 'selectedLanguage' },
    resources: {
      no_nb: { translation: no_nb },
      no_nn: { translation: no_nn },
      en: { translation: en },
    },
    fallbackLng: 'no_nb',
    keySeparator: '.',
    returnNull: false,
  });

// Create a global variable called locale in storybook
// and add a menu in the toolbar to change your locale
export const globalTypes = {
  locale: {
    name: 'Språk',
    description: 'Velg språk',
    toolbar: {
      icon: 'globe',
      items: [
        { value: 'no_nb', title: 'NB' },
        { value: 'no_nn', title: 'NN' },
        { value: 'en', title: 'EN' },
      ],
      showName: true,
    },
  },
};

// mock react router for components that use it
const mockNavigator = {
  push: () => {},
  replace: () => {},
  go: () => {},
  back: () => {},
  forward: () => {},
  createHref: () => '',
  block: () => () => {},
  listen: () => () => {},
};

const withI18next = (Story, context) => {
  const { locale } = context.globals;
  // When the locale global changes
  // Set the new locale in i18n
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <Suspense fallback={<div>loading translations...</div>}>
      <I18nextProvider i18n={i18n}>
        <Router
          navigator={mockNavigator}
          location={''}
        >
          <Story />
        </Router>
      </I18nextProvider>
    </Suspense>
  );
};

export const decorators = [withI18next];
