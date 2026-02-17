import React from 'react';
import { useTranslation } from 'react-i18next';

import { ClientAdministrationAgentDetails } from './ClientAdministrationAgentDetails';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { Navigate, useParams } from 'react-router';
import { clientAdministrationPageEnabled } from '@/resources/utils/featureFlagUtils';
import { PageWrapper } from '@/components';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';

export const ClientAdministrationAgentDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  useDocumentTitle(t('client_administration_page.page_title'));

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
