import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { initReactI18next } from 'react-i18next';
import { QueryClient, QueryClientProvider } from 'react-query';
import { use } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { Router, RouterPath } from '@/routes/Router';

import { getConfig } from '../config';

import LoadLocalizations from './resources/LoadLocalizations';
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
  .init(
    {
      fallbackLng: getConfig('defaultLocale'),
      ns: ['common'],
      defaultNS: 'common',
      returnNull: false,
    },

    () => {
      // Configure react-query
      const queryClient = new QueryClient({
        defaultOptions: import.meta.env.DEV ? queryClientDevDefaults : undefined,
      });

      ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
          <Provider store={store}>
            <QueryClientProvider client={queryClient}>
              <LoadLocalizations>
                <BrowserRouter basename={RouterPath.BasePath}>
                  <Router />
                </BrowserRouter>
              </LoadLocalizations>
            </QueryClientProvider>
          </Provider>
        </React.StrictMode>,
      );
    },
  );
