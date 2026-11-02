import React from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

import { PageWrapper } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useGetClientsQuery } from '@/rtk/features/clientApi';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import { ClientDetails } from './ClientDetails';

export const ClientDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  useDocumentTitle(t('client_administration_page.client_page_title'));

  const { data: clients } = useGetClientsQuery();
  const selectedClient = clients?.find((item) => item.client.id === id);

  const clientParty = selectedClient?.client;

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
