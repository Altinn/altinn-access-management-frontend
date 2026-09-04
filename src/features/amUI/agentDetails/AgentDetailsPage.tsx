import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';

import { AgentDetails } from './AgentDetails';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetAgentsQuery } from '@/rtk/features/clientApi';
import { type Party } from '@/rtk/features/lookupApi';
import { PartyType } from '@/rtk/features/userInfoApi';

export const AgentDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  useDocumentTitle(t('client_administration_page.agent_page_title'));

  const { data: agents } = useGetAgentsQuery();
  const selectedAgent = agents?.find((item) => item.agent.id === id);

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
