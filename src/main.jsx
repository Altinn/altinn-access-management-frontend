import { React } from 'react';
import { ReactDOM } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { initReactI18next } from 'react-i18next';
import i18next from 'i18next';
import { QueryClient, QueryClientProvider } from 'react-query';

import { ErrorPage } from './resources/ErrorPage/ErrorPage';
import { ApiDelegation } from './routes/ApiDelegation';
import LoadLocalizations from './resources/LoadLocalizations';
import { getConfig } from './config/config';
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
    errorElement: <ErrorPage />,
  },
  {
    path: 'api-delegation/1',
    element: <ApiDelegation />,
  },
]);

// Initialise i18next; start application when ready
i18next.use(initReactI18next).init(
  {
    lng: getConfig('defaultLocale'),
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
