import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { initReactI18next } from 'react-i18next';
import { use } from 'i18next';
import { QueryClient, QueryClientProvider } from 'react-query';

import { ErrorPage } from './resources/ErrorPage/ErrorPage';
import { ApiDelegationOverview } from './routes/ApiDelegationOverview';
import LoadLocalizations from './resources/LoadLocalizations';
import { getConfig } from './config/config';
import BaseLocalizations from './resources/BaseLocalizations/BaseLocalizations.json';
import { NewApiDelegations } from './routes/NewApiDelegations';
import store from './rtk/app/store';

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
    errorElement: <ErrorPage />,
  },
  {
    path: 'api-delegations/overview',
    element: <ApiDelegationOverview />,
  },
  {
    path: 'api-delegations/delegate-new',
    element: <NewApiDelegations />,
    errorElement: <ErrorPage />,
  },
]);

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
              <RouterProvider router={router} />
            </LoadLocalizations>
          </QueryClientProvider>
        </Provider>
      </React.StrictMode>,
    );
  },
);
