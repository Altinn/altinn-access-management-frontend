import React from 'react';
import { Navigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

import { PageWrapper } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { clientAdministrationPageEnabled } from '@/resources/utils/featureFlagUtils';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { ClientAdministrationClientDetails } from './ClientAdministrationClientDetails';

export const ClientAdministrationClientDetailsPage = () => {
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
