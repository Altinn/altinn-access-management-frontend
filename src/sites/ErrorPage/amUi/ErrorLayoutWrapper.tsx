import { InfoModal } from '@/features/amUI/common/PageLayoutWrapper/InfoModal';
import { useFooter } from '@/features/amUI/common/PageLayoutWrapper/useFooter';
import { useHeader } from '@/features/amUI/common/PageLayoutWrapper/useHeader';
import { GeneralPath } from '@/routes/paths';
import { LanguageCode, Layout, RootProvider, Snackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

export const ErrorLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const { pathname, search } = useLocation();

  const { header, languageCode } = useHeader({ openAccountMenu: false, hideAccountSelector: true });
  const footer = useFooter();

  return (
    <RootProvider languageCode={languageCode as LanguageCode}>
      <Layout
        useGlobalHeader
        color={'neutral'}
        theme='default'
        header={header}
        skipLink={{
          href:
            pathname === '/'
              ? `${GeneralPath.BasePath}${search}#main-content`
              : `${GeneralPath.BasePath}${pathname}${search}#main-content`,
          color: 'inherit',
          size: 'xs',
          children: t('common.skiplink'),
        }}
        content={{ color: 'neutral' }}
        footer={footer}
        sidebar={{ hidden: true }}
      >
        {children}
        <InfoModal />
      </Layout>
      <Snackbar />
    </RootProvider>
  );
};
