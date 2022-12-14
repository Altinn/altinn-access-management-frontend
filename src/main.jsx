import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { initReactI18next } from 'react-i18next';
import { QueryClient, QueryClientProvider } from 'react-query';

import { use } from 'i18next';
import { Router } from '@/routes/Router';

import { getConfig } from '../config';

import LoadLocalizations from './resources/LoadLocalizations';
import BaseLocalizations from './resources/BaseLocalizations/BaseLocalizations.json';
import store from './rtk/app/store';

/**
 * Special behaviour for react-query in dev environment
 */
const queryClientDevDefaults = {
  queries: {
    retry: false, // Don't retry failed requests
  },
};

const initLanguage = (lang) => {
  // get token here
  if (lang === 'no_nb') {
    return 'no_nb';
  } else if (lang === 'en') {
    return 'en';
  } else if (lang === 'no_nn') {
    return 'no_nn';
  }
};

// Initialise i18next; start application when ready
use(initReactI18next).init(
  {
    lng: initLanguage('no_nb'),
    fallbackLng: getConfig('defaultLocale'),
    ns: ['common', 'basic'],
    defaultNS: 'common',
    resources: BaseLocalizations,
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
              <RouterProvider router={Router} />
            </LoadLocalizations>
          </QueryClientProvider>
        </Provider>
      </React.StrictMode>,
    );
  },
);
