import React from 'react';
import { useTranslation } from 'react-i18next';

import { AgentDetails } from './AgentDetails';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { Navigate, useParams } from 'react-router';
import { clientAdministrationPageEnabled } from '@/resources/utils/featureFlagUtils';
import { PageWrapper } from '@/components';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { useGetAgentsQuery } from '@/rtk/features/clientApi';
import { Party } from '@/rtk/features/lookupApi';
import { PartyType } from '@/rtk/features/userInfoApi';

export const AgentDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  useDocumentTitle(t('client_administration_page.agent_page_title'));

  const pageIsEnabled = clientAdministrationPageEnabled();
  const { data: agents } = useGetAgentsQuery();
  const selectedAgent = agents?.find((item) => item.agent.id === id);

  if (!pageIsEnabled) {
    return (
      <Navigate
        to='/not-found'
        replace
      />
    );
  }

  const agentParty: Party | undefined = selectedAgent
    ? {
        name: selectedAgent.agent.name,
        partyUuid: selectedAgent.agent.id,
        partyTypeName: PartyType.Person,
        partyId: Number(selectedAgent.agent.partyId ?? 0),
      }
    : undefined;

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={getCookie('AltinnPartyUuid')}
          actingPartyUuid={getCookie('AltinnPartyUuid')}
          toPartyOverride={agentParty}
          isLoading={!selectedAgent}
        >
          <AgentDetails />
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
