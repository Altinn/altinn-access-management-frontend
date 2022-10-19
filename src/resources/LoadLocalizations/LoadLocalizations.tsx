import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';

type Props = {
  children: React.ReactNode;
};

const LoadLocalizations = ({ children }: Props) => {
  const { i18n } = useTranslation('common');
  const baseUrl = import.meta.env.BASE_URL;
  const localizationsFilePath = `${baseUrl}localizations/${i18n.language}.json`;
  const localizationsFileUrl = new URL(localizationsFilePath, import.meta.url).href;

  useQuery(
    'Locales',
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