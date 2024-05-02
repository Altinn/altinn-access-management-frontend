import { useQuery } from '@tanstack/react-query';
import i18next from 'i18next';
import * as React from 'react';

import { getCookie } from '../Cookie/CookieMethods';

interface Props {
  children: React.ReactNode;
}

const LoadLocalizations = ({ children }: Props) => {
  const getLanguageFile = async () => {
    const value = getCookie('i18next');
    if (value === 'no_nn') {
      return [await import('../../localizations/no_nn.json'), 'no_nn'] as const;
    } else if (value === 'en') {
      return [await import('../../localizations/en.json'), 'en'] as const;
    } else {
      return [await import('../../localizations/no_nb.json'), 'no_nb'] as const;
    }
  };

  useQuery(
    ['Localizations'],
    async () => {
      const [data, language] = await getLanguageFile();
      return i18next.addResourceBundle(language, 'common', data.default);
    },
    {
      staleTime: Infinity,
      suspense: true,
    },
  );

  return <>{children}</>;
};

export default LoadLocalizations;
