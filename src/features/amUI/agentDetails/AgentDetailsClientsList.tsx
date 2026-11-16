import React from 'react';

import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import type {
  AddAgentAccessPackagesFn,
  AddAgentResourcesFn,
  Client,
  RemoveAgentAccessPackagesFn,
  RemoveAgentResourcesFn,
} from '@/rtk/features/clientApi';

import { ClientAccessList } from '../common/ClientAccessList/ClientAccessList';
import { useClientAccessAction } from '../common/ClientAccess/useClientAccessAction';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

type AgentDetailsClientsListProps = {
  clients: Client[];
  agentAccessPackages: Client[];
  agentResources?: Client[];
  isLoading: boolean;
  renderClientActions: (client: Client, restoreFocusFallbackId?: string) => React.ReactNode;
  toPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackagesFn;
  removeAgentAccessPackages: RemoveAgentAccessPackagesFn;
  addAgentResources?: AddAgentResourcesFn;
  removeAgentResources?: RemoveAgentResourcesFn;
  searchString?: string;
  emptyText?: string;
  expandedIds?: string[];
  onToggleExpanded?: (id: string) => void;
  restoreFocusFallbackId?: string;
};

export const AgentDetailsClientsList = ({
  clients,
  agentAccessPackages,
  agentResources,
  isLoading,
  renderClientActions,
  toPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
  removeAgentAccessPackages,
  addAgentResources,
  removeAgentResources,
  searchString,
  emptyText,
  expandedIds,
  onToggleExpanded,
  restoreFocusFallbackId,
}: AgentDetailsClientsListProps) => {
  const actionDisabled = isLoading || !toPartyUuid || !actingPartyUuid;
  const { toParty } = usePartyRepresentation();

  const runAction = useClientAccessAction({
    actingPartyUuid,
    addAgentAccessPackages,
    removeAgentAccessPackages,
    addAgentResources,
    removeAgentResources,
  });

  return (
    <ClientAccessList
      clients={clients}
      accessStateClients={agentAccessPackages}
      resourceAccessClients={agentResources}
      recipient={{
        id: toPartyUuid ?? '',
        name: formatEntityDisplayName(toParty),
        type: toParty?.type,
      }}
      runAction={runAction}
      addDisabled={actionDisabled}
      removeDisabled={actionDisabled}
      searchString={searchString}
      emptyText={emptyText}
      expandedIds={expandedIds}
      onToggleExpanded={onToggleExpanded}
      restoreFocusFallbackId={restoreFocusFallbackId}
      renderClientActions={renderClientActions}
    />
  );
};
