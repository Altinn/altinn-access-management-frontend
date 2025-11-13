import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useGetOrgDataQuery } from '@/rtk/features/altinnCdnApi';

type SupportedLanguage = 'en' | 'nb' | 'nn';

const mapLanguage = (locale: string | undefined): SupportedLanguage => {
  switch (locale) {
    case 'en':
      return 'en';
    case 'no_nn':
      return 'nn';
    case 'no_nb':
    default:
      return 'nb';
  }
};

/**
 * Hook that returns a resolver for provider/org names based on org code.
 * Falls back to Norwegian Bokmål, then English. Returns undefined while loading or if not found.
 */
export const useProviderName = () => {
  const { i18n } = useTranslation();
  const { data: orgData, isLoading } = useGetOrgDataQuery();

  const language = React.useMemo(() => mapLanguage(i18n.language), [i18n.language]);

  const getProviderName = React.useCallback(
    (orgCode: string): string | undefined => {
      if (!orgData || isLoading) return undefined;

      const key = orgCode.toLowerCase();
      const org = key ? orgData[key] : undefined;
      const names = org?.name ?? undefined;
      if (!names) return undefined;

      return names[language] ?? undefined;
    },
    [orgData, isLoading, language],
  );

  return { getProviderName, isLoading } as const;
};
