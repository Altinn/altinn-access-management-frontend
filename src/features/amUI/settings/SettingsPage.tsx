import { PageWrapper } from '@/components/PageWrapper/PageWrapper';
import React from 'react';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { amUIPath } from '@/routes/paths';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { SettingsPageContent } from './SettingsPageContent';
import { settingsPageEnabled } from '@/resources/utils/featureFlagUtils';
import { Navigate } from 'react-router';

export const SettingsPage = () => {
  const pageIsEnabled = settingsPageEnabled();
  if (!pageIsEnabled) {
    return (
      <Navigate
        to='/not-found'
        replace
      />
    );
  }

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={getCookie('AltinnPartyUuid')}
          actingPartyUuid={getCookie('AltinnPartyUuid')}
          returnToUrlOnError={`/${amUIPath.Users}`}
        >
          <SettingsPageContent />
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
