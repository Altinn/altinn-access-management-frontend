import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { initReactI18next } from 'react-i18next';
import { QueryClient, QueryClientProvider } from 'react-query';
import { use } from 'i18next';
import axios from 'axios';

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

const userProfile = async () => {
  await axios
    .get('/accessmanagement/api/v1/profile/user')
    .then((response) => {
      console.log('response.data', response.data);
      return response.data.profileSettingPreference.language;
    })
    .catch((error) => {
      console.error(error);
      throw new Error(String(error.response.status));
    });
};

const initLanguage = (lang) => {
  // get token here
  if (lang === 'en') {
    return 'en';
  } else if (lang === 'nn') {
    return 'no_nn';
  } else {
    return 'no_nb';
  }
};

// Initialise i18next; start application when ready
use(initReactI18next).init(
  {
    // TODO: replace no_nb below with result from backend call that checks which language is set
    lng: initLanguage('no_nb'),
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
