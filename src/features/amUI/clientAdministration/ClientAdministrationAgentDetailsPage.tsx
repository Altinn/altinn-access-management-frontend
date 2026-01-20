import React from 'react';

import { ClientAdministrationAgentDetails } from './ClientAdministrationAgentDetails';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useParams } from 'react-router';

export const ClientAdministrationAgentDetailsPage = () => {
  const { id } = useParams();
  return (
    <PartyRepresentationProvider
      fromPartyUuid={getCookie('AltinnPartyUuid')}
      actingPartyUuid={getCookie('AltinnPartyUuid')}
      toPartyUuid={id}
      errorOnPriv={true}
    >
      <ClientAdministrationAgentDetails />
    </PartyRepresentationProvider>
  );
};
