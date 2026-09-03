import React from 'react';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';

import { SettingsPageContent } from './SettingsPageContent';

import { amUIPath } from '@/routes/paths';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { PageWrapper } from '@/components/PageWrapper/PageWrapper';

export const SettingsPage = () => {
  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={getCookie('AltinnPartyUuid')}
          actingPartyUuid={getCookie('AltinnPartyUuid')}
        >
          <Breadcrumbs items={['root', 'settings']} />
          <SettingsPageContent />
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
