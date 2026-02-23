import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDisplayName } from '@altinn/altinn-components';

import type {
  AddAgentAccessPackagesFn,
  Client,
  RemoveAgentAccessPackagesFn,
} from '@/rtk/features/clientApi';
import { ClientAccessList } from '../common/ClientAccessList/ClientAccessList';

import { useAgentDetailsAccessPackageActions } from './useAgentDetailsAccessPackageActions';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { PartyType } from '@/rtk/features/userInfoApi';

type AgentDetailsClientsListProps = {
  clients: Client[];
  agentAccessPackages: Client[];
  isLoading: boolean;
  toPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackagesFn;
  removeAgentAccessPackages: RemoveAgentAccessPackagesFn;
};

export const AgentDetailsClientsList = ({
  clients,
  agentAccessPackages,
  isLoading,
  toPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
  removeAgentAccessPackages,
}: AgentDetailsClientsListProps) => {
  const { t } = useTranslation();

  const delegateDisabled = isLoading || !toPartyUuid || !actingPartyUuid;
  const removeDisabled = isLoading || !toPartyUuid || !actingPartyUuid;

  const { addAgentAccessPackage, removeAgentAccessPackage } = useAgentDetailsAccessPackageActions({
    toPartyUuid,
    actingPartyUuid,
    addAgentAccessPackages,
    removeAgentAccessPackages,
  });
  const { toParty } = usePartyRepresentation();
  const agentName = formatDisplayName({
    fullName: toParty?.name || '',
    type: toParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
  });

  return (
    <ClientAccessList
      clients={clients}
      accessStateClients={agentAccessPackages}
      addDisabled={delegateDisabled}
      removeDisabled={removeDisabled}
      onAddAccessPackage={({ clientId, roleCode, packageId, accessPackageName }) =>
        addAgentAccessPackage(clientId, roleCode, packageId, agentName, accessPackageName)
      }
      onRemoveAccessPackage={({ clientId, roleCode, packageId, accessPackageName }) =>
        removeAgentAccessPackage(clientId, roleCode, packageId, agentName, accessPackageName)
      }
      searchPlaceholder={t('client_administration_page.client_search_placeholder')}
    />
  );
};
