import { Outlet, useLocation } from 'react-router';
import { SkyraSurvey, useConsent, useSkyraReload } from '@altinn/altinn-components';

export const RootLayout = () => {
  const { consent } = useConsent();
  const { pathname } = useLocation();
  useSkyraReload(pathname);

  return (
    <>
      {window.featureFlags?.enableSkyra === true && <SkyraSurvey consent={consent.statistics} />}
      <Outlet />
    </>
  );
};
