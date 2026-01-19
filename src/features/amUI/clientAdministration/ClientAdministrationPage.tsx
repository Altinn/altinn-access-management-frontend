import React from 'react';

import { PageWrapper } from '@/components/PageWrapper/PageWrapper';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { ClientAdministrationPageContent } from './ClientAdministrationPageContent';

export const ClientAdministrationPage = () => {
  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={getCookie('AltinnPartyUuid')}
          actingPartyUuid={getCookie('AltinnPartyUuid')}
          errorOnPriv={true}
        >
          <ClientAdministrationPageContent />
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
