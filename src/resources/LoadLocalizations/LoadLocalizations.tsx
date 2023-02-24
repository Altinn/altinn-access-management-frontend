import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import i18next from 'i18next';
import axios from 'axios';
import * as React from 'react';

interface Props {
  children: React.ReactNode;
}

const LoadLocalizations = ({ children }: Props) => {
  const { i18n } = useTranslation('common');
  const baseUrl = import.meta.env.BASE_URL;
  const localizationsFilePath = `${baseUrl}src/localizations/${i18n.language}.json`;
  const localizationsFileUrl = new URL(localizationsFilePath, import.meta.url).href;

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

  useQuery(
    'Localizations',
    async () => {
      const data = await fetch(localizationsFileUrl);
      const resource = await data.json();
      i18next.addResourceBundle(i18n.language, 'common', resource);
    },
    {
      staleTime: Infinity,
      suspense: true,
    },
  );

  return <>{children}</>;
};

export default LoadLocalizations;
