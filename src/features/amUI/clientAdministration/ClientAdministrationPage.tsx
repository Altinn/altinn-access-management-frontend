import React from 'react';

import { PageWrapper } from '@/components/PageWrapper/PageWrapper';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { ClientAdministrationPageContent } from './ClientAdministrationPageContent';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';

export const ClientAdministrationPage = () => {
  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={getCookie('AltinnPartyUuid')}
          actingPartyUuid={getCookie('AltinnPartyUuid')}
          errorOnPriv={true}
        >
          <Breadcrumbs items={['root', 'client_administration']} />
          <ClientAdministrationPageContent />
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
