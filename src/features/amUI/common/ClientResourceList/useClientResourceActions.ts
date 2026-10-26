import { useCallback } from 'react';

import type { AddAgentResourcesFn, RemoveAgentResourcesFn } from '@/rtk/features/clientApi';
import type { ActionError } from '@/resources/hooks/useActionError';

import {
  useClientSingleAccessAction,
  type ClientSingleAccessMode,
} from '../ClientBulkDelegation/useClientSingleAccessAction';

export type ClientResourceDelegationInput = {
  clientId: string;
  agentId: string;
  roleCode: string;
  resourceId: string;
  agentName: string;
  resourceName: string;
};

type UseClientResourceActionsParams = {
  actingPartyUuid?: string;
  addAgentResources?: AddAgentResourcesFn;
  removeAgentResources?: RemoveAgentResourcesFn;
};

export const useClientResourceActions = ({
  actingPartyUuid,
  addAgentResources,
  removeAgentResources,
}: UseClientResourceActionsParams) => {
  const runSingle = useClientSingleAccessAction({
    actingPartyUuid,
    addAgentResources,
    removeAgentResources,
  });

  const runResource = useCallback(
    (
      mode: ClientSingleAccessMode,
      input: ClientResourceDelegationInput,
      onSuccess?: () => void,
      onError?: (error?: ActionError) => void,
    ) =>
      runSingle(
        mode,
        { clientId: input.clientId, agentId: input.agentId },
        { kind: 'resource', roleCode: input.roleCode, id: input.resourceId },
        { agentName: input.agentName, accessName: input.resourceName },
        onSuccess,
        onError,
      ),
    [runSingle],
  );

  const addClientResource = useCallback(
    (
      input: ClientResourceDelegationInput,
      onSuccess?: () => void,
      onError?: (error?: ActionError) => void,
    ) => runResource('delegate', input, onSuccess, onError),
    [runResource],
  );

  const removeClientResource = useCallback(
    (
      input: ClientResourceDelegationInput,
      onSuccess?: () => void,
      onError?: (error?: ActionError) => void,
    ) => runResource('remove', input, onSuccess, onError),
    [runResource],
  );

  return { addClientResource, removeClientResource };
};
