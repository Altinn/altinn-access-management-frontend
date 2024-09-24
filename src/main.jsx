/* eslint-disable @typescript-eslint/no-floating-promises */
import '@digdir/designsystemet-theme/altinn.css';
import '@digdir/designsystemet-css';
import '@/resources/css/Common.module.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { initReactI18next } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { use } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { RefreshToken } from '@/resources/Token/RefreshToken';
import { Router } from '@/routes/Router/Router';

import { getConfig } from '../config';

import no_nb from './localizations/no_nb.json';
import no_nn from './localizations/no_nn.json';
import en from './localizations/en.json';
import store from './rtk/app/store';

/**
 * Special behaviour for react-query in dev environment
 */
const queryClientDevDefaults = {
  queries: {
    retry: false, // Don't retry failed requests
  },
};

// Initialise i18next; start application when ready
use(LanguageDetector)
  .use(initReactI18next)
  .init({
    detection: { lookupCookie: 'selectedLanguage' },
    resources: {
      no_nb: { translation: no_nb },
      no_nn: { translation: no_nn },
      en: { translation: en },
    },
    fallbackLng: getConfig('defaultLocale'),
    keySeparator: '.',
    returnNull: false,
  });

// Configure react-query
const queryClient = new QueryClient({
  defaultOptions: import.meta.env.DEV ? queryClientDevDefaults : undefined,
});

createRoot(document.getElementById('root')).render(
  // if you ever wonder why the components render twice it's because of React.StrictMode
  // comment it out if it causes trouble: https://react.dev/reference/react/StrictMode
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RefreshToken />
        <RouterProvider router={Router}></RouterProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);
