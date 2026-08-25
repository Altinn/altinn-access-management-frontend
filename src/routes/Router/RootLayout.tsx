import { Outlet, useLocation } from 'react-router';
import { SkyraSurvey, useConsent, useSkyraReload } from '@altinn/altinn-components';

/**
 * Loads the Skyra survey SDK once for the whole application, gated on the statistics
 * category of the shared Altinn cookie consent. Skyra evaluates survey targeting per URL,
 * so it must also be told when the route changes.
 */
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
