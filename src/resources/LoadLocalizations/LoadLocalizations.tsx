import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import i18next from 'i18next';
import axios from 'axios';
import * as React from 'react';

import { getCookie } from '../Cookie/CookieMethods';

interface Props {
  children: React.ReactNode;
}

const LoadLocalizations = ({ children }: Props) => {
  const initLanguage = (lang: string) => {
    if (lang === 'en') {
      return 'en';
    } else if (lang === 'nn') {
      return 'no_nn';
    } else {
      return 'no_nb';
    }
  };

  const setLanguage = async () => {
    await axios
      .get('/accessmanagement/api/v1/profile/user')
      .then((response) => {
        const lang = response.data.profileSettingPreference.language.toString();
        document.cookie = 'i18next=' + initLanguage(lang);
      })
      .catch((error) => {
        console.error(error);
        throw new Error(String(error.response.status));
      });
  };

  void setLanguage();

  const backupLang = getCookie('i18next') ? getCookie('i18next') : 'no_nb';
  const envUrl = import.meta.env.DEV ? 'src/' : 'accessmanagement/';
  const baseUrl = import.meta.env.BASE_URL + envUrl;
  const localizationsFilePath = `${baseUrl}localizations/${backupLang}.json`;
  const localizationsFileUrl = new URL(localizationsFilePath, import.meta.url).href;

  useQuery(
    'Localizations',
    async () => {
      const data = await fetch(localizationsFileUrl);
      const resource = await data.json();
      i18next.addResourceBundle(backupLang, 'common', resource);
    },
    {
      staleTime: Infinity,
      suspense: true,
    },
  );

  return <>{children}</>;
};

export default LoadLocalizations;
