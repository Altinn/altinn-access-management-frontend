import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { initReactI18next } from 'react-i18next';
import i18next, { use } from 'i18next';
import { QueryClient, QueryClientProvider } from 'react-query';

import { ErrorPage } from './resources/ErrorPage/ErrorPage';
import { ApiDelegation } from './routes/ApiDelegation';
import LoadLocalizations from './resources/LoadLocalizations';
import { getConfig } from './config/config';
import { ExamplePage } from './components/ExamplePage/ExamplePage';
import BaseLocalizations from './resources/BaseLocalizations/BaseLocalizations.json';

/**
 * Special behaviour for react-query in dev environment
 */
const queryClientDevDefaults = {
  queries: {
    retry: false, // Don't retry failed requests
  },
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <ExamplePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: 'api-delegations',
    element: <ApiDelegation />,
  },
]);

const initLanguage = (lang) => {
  if (lang === 'no') {
    return 'no';
  } else if (lang === 'en') {
    return 'en';
  } else if (lang === 'nn') {
    return 'nn';
  }
};

// Initialise i18next; start application when ready
use(initReactI18next).init(
  {
    lng: initLanguage('no'),
    fallbackLng: getConfig('defaultLocale'),
    ns: ['common', 'basic'],
    defaultNS: 'common',
    resources: BaseLocalizations,
  },

  () => {
    // Configure react-query
    const queryClient = new QueryClient({
      defaultOptions: import.meta.env.DEV ? queryClientDevDefaults : undefined,
    });

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <LoadLocalizations>
            <RouterProvider router={router} />
          </LoadLocalizations>
        </QueryClientProvider>
      </React.StrictMode>,
    );
  },
);
