import { Outlet, useLocation } from 'react-router';
import { RootProvider, SkyraSurvey, useConsent, useSkyraReload } from '@altinn/altinn-components';

import { useLanguageCode } from '@/resources/hooks/useLanguageCode';

export const RootLayout = () => {
  const { consent } = useConsent();
  const { pathname } = useLocation();
  const languageCode = useLanguageCode();
  useSkyraReload(pathname);

  // SkyraSurvey reads the language from the nearest RootProvider, so it must live inside one that
  // follows i18n. Layouts further down render their own RootProvider; nesting is harmless.
  return (
    <RootProvider languageCode={languageCode}>
      {window.featureFlags?.enableSkyra === true && <SkyraSurvey consent={consent.statistics} />}
      <Outlet />
    </RootProvider>
  );
};
