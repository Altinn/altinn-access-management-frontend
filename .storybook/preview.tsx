import type { Preview } from '@storybook/react';

import '@digdir/designsystemet-theme/altinn.css';
import '@digdir/designsystemet-css';
import '@/resources/css/Common.module.css';

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import no_nb from '../src/localizations/no_nb.json';
import no_nn from '../src/localizations/no_nn.json';
import en from '../src/localizations/en.json';
import { Suspense, useEffect } from 'react';
import React from 'react';
import { Router } from 'react-router-dom';

import { worker } from '../src/mock/browser';
worker.start();

// Initialise i18next; start application when ready
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
