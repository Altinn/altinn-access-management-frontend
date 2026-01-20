import React from 'react';
import { Navigate, useParams } from 'react-router';

import { PageWrapper } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { clientAdministrationPageEnabled } from '@/resources/utils/featureFlagUtils';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { ClientAdministrationClientDetails } from './ClientAdministrationClientDetails';

export const ClientAdministrationClientDetailsPage = () => {
  const { id } = useParams();
  const pageIsEnabled = clientAdministrationPageEnabled();

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
          fromPartyUuid={id}
          actingPartyUuid={getCookie('AltinnPartyUuid')}
          toPartyUuid={getCookie('AltinnPartyUuid')}
          errorOnPriv={true}
        >
          <ClientAdministrationClientDetails />
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
