import React from 'react';

import { ClientAdministrationAgentDetails } from './ClientAdministrationAgentDetails';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { Navigate, useParams } from 'react-router';
import { clientAdministrationPageEnabled } from '@/resources/utils/featureFlagUtils';
import { DsAlert, DsHeading, DsParagraph, DsSkeleton } from '@altinn/altinn-components';
import { t } from 'i18next';
import { useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';
import { PageWrapper } from '@/components';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';

export const ClientAdministrationAgentDetailsPage = () => {
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
          fromPartyUuid={getCookie('AltinnPartyUuid')}
          actingPartyUuid={getCookie('AltinnPartyUuid')}
          toPartyUuid={id}
          errorOnPriv={true}
        >
          <ClientAdministrationAgentDetails />
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
