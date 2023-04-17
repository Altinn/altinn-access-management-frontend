import { useQuery } from '@tanstack/react-query';
import i18next from 'i18next';
import * as React from 'react';

import { getCookie } from '../Cookie/CookieMethods';

interface Props {
  children: React.ReactNode;
}

const LoadLocalizations = ({ children }: Props) => {
  const getBackupLanguage = () => {
    const value = getCookie('i18next');
    if (value === 'no_nn') {
      return 'no_nn';
    } else if (value === 'en') {
      return 'en';
    } else {
      return 'no_nb';
    }
  };

  const backupLang = getBackupLanguage();
  const envUrl = import.meta.env.DEV ? 'src/' : 'accessmanagement/';
  const baseUrl = import.meta.env.BASE_URL + envUrl;
  const localizationsFilePath = `${baseUrl}localizations/${backupLang}.json`;
  const localizationsFileUrl = new URL(localizationsFilePath, import.meta.url).href;

  useQuery(
    ['Localizations'],
    async () => {
      const data = await fetch(localizationsFileUrl);
      const resource = await data.json();
      return i18next.addResourceBundle(backupLang, 'common', resource);
    },
    {
      staleTime: Infinity,
      suspense: true,
    },
  );

  return <>{children}</>;
};

export default LoadLocalizations;
