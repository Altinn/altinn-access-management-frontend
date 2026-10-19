import React from 'react';

import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import type { ActionError } from '@/resources/hooks/useActionError';
import type {
  AddAgentAccessPackagesFn,
  AddAgentResourcesFn,
  Client,
  RemoveAgentAccessPackagesFn,
  RemoveAgentResourcesFn,
} from '@/rtk/features/clientApi';

import { ClientAccessList } from '../common/ClientAccessList/ClientAccessList';
import { useClientResourceActions } from '../common/ClientResourceList/useClientResourceActions';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ClientBulkActions } from '../common/ClientBulkDelegation/ClientBulkActions';
import { useClientBulkDelegation } from '../common/ClientBulkDelegation/ClientBulkDelegation';

import { useAgentDetailsAccessPackageActions } from './useAgentDetailsAccessPackageActions';

type AgentDetailsClientsListProps = {
  clients: Client[];
  agentAccessPackages: Client[];
  agentResources?: Client[];
  isLoading: boolean;
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
  const bulk = useClientBulkDelegation();
  const actionDisabled = isLoading || !!bulk?.activeRun || !toPartyUuid || !actingPartyUuid;

  const { addAgentAccessPackage, removeAgentAccessPackage } = useAgentDetailsAccessPackageActions({
    toPartyUuid,
    actingPartyUuid,
    addAgentAccessPackages,
    removeAgentAccessPackages,
  });
  const { addClientResource, removeClientResource } = useClientResourceActions({
    actingPartyUuid,
    addAgentResources,
    removeAgentResources,
  });
  const { toParty } = usePartyRepresentation();
  const agentName = formatEntityDisplayName(toParty);

  return (
    <ClientAccessList
      clients={clients}
      accessStateClients={agentAccessPackages}
      resourceAccessClients={agentResources}
      addDisabled={actionDisabled}
      removeDisabled={actionDisabled}
      searchString={searchString}
      emptyText={emptyText}
      expandedIds={expandedIds}
      onToggleExpanded={onToggleExpanded}
      restoreFocusFallbackId={restoreFocusFallbackId}
      renderClientActions={(client) => {
        const items = bulk?.getClientItems(client);
        if (!items || (items.missing.length === 0 && items.held.length === 0)) return null;
        return (
          <ClientBulkActions
            client={client}
            items={items}
          />
        );
      }}
      isAccessPending={bulk?.isAccessPending}
      onAddAccessPackage={(
        { clientId, roleCode, packageId, accessPackageName },
        onSuccess?: () => void,
        onError?: () => void,
      ) =>
        addAgentAccessPackage(
          clientId,
          roleCode,
          packageId,
          agentName,
          accessPackageName,
          onSuccess,
          onError,
        )
      }
      onRemoveAccessPackage={(
        { clientId, roleCode, packageId, accessPackageName },
        onSuccess?: () => void,
        onError?: () => void,
      ) =>
        removeAgentAccessPackage(
          clientId,
          roleCode,
          packageId,
          agentName,
          accessPackageName,
          onSuccess,
          onError,
        )
      }
      onAddResource={(
        { clientId, roleCode, resourceId, resourceName },
        onSuccess?: () => void,
        onError?: (error?: ActionError) => void,
      ) =>
        addClientResource(
          {
            clientId,
            agentId: toPartyUuid ?? '',
            roleCode,
            resourceId,
            agentName,
            resourceName,
          },
          onSuccess,
          onError,
        )
      }
      onRemoveResource={(
        { clientId, roleCode, resourceId, resourceName },
        onSuccess?: () => void,
        onError?: (error?: ActionError) => void,
      ) =>
        removeClientResource(
          {
            clientId,
            agentId: toPartyUuid ?? '',
            roleCode,
            resourceId,
            agentName,
            resourceName,
          },
          onSuccess,
          onError,
        )
      }
    />
  );
};
