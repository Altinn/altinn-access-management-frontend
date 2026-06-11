import React from 'react';
import { Navigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

import { PageWrapper } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { clientAdministrationPageEnabled } from '@/resources/utils/featureFlagUtils';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { ClientDetails } from './ClientDetails';
import { useGetClientsQuery } from '@/rtk/features/clientApi';
import { PartyType } from '@/rtk/features/userInfoApi';
import { Party } from '@/rtk/features/lookupApi';

export const ClientDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  useDocumentTitle(t('client_administration_page.client_page_title'));

  const pageIsEnabled = clientAdministrationPageEnabled();

  const { data: clients } = useGetClientsQuery();
  const selectedClient = clients?.find((item) => item.client.id === id);

  if (!pageIsEnabled) {
    return (
      <Navigate
        to='/not-found'
        replace
      />
    );
  }

  const clientParty: Party | undefined = selectedClient
    ? {
        name: selectedClient.client.name,
        partyUuid: selectedClient.client.id,
        partyTypeName: PartyType.Organization,
        partyId: Number(selectedClient.client.partyId ?? 0),
      }
    : undefined;

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyOverride={clientParty}
          actingPartyUuid={getCookie('AltinnPartyUuid')}
          toPartyUuid={getCookie('AltinnPartyUuid')}
          isLoading={!selectedClient}
        >
          <ClientDetails />
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
