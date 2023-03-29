import { useQuery } from '@tanstack/react-query';
import i18next from 'i18next';
import axios from 'axios';
import * as React from 'react';

import { getCookie } from '../Cookie/CookieMethods';

interface Props {
  children: React.ReactNode;
}

const LoadLocalizations = ({ children }: Props) => {
  const backupLang = getCookie('i18next') ? getCookie('i18next') : 'no_nb';
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
