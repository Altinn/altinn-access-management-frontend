import { useCallback } from 'react';

import type { ActionError } from '@/resources/hooks/useActionError';
import type {
  AddAgentAccessPackagesFn,
  RemoveAgentAccessPackagesFn,
} from '@/rtk/features/clientApi';

import {
  useClientSingleAccessAction,
  type ClientSingleAccessMode,
} from '../ClientBulkDelegation/useClientSingleAccessAction';

type UseClientAccessPackageActionsParams = {
  fromPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackagesFn;
  removeAgentAccessPackages: RemoveAgentAccessPackagesFn;
};

export const useClientAccessPackageActions = ({
  fromPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
  removeAgentAccessPackages,
}: UseClientAccessPackageActionsParams) => {
  const runSingle = useClientSingleAccessAction({
    actingPartyUuid,
    addAgentAccessPackages,
    removeAgentAccessPackages,
  });

  const runPackage = useCallback(
    (
      mode: ClientSingleAccessMode,
      agentId: string,
      roleCode: string,
      packageId: string,
      agentName: string,
      accessPackageName: string,
      onSuccess?: () => void,
      onError?: (error?: ActionError) => void,
    ) =>
      runSingle(
        mode,
        { clientId: fromPartyUuid, agentId },
        { kind: 'package', roleCode, id: packageId },
        { agentName, accessName: accessPackageName },
        onSuccess,
        onError,
      ),
    [fromPartyUuid, runSingle],
  );

  const addClientAccessPackage = useCallback(
    (
      agentId: string,
      roleCode: string,
      packageId: string,
      agentName: string,
      accessPackageName: string,
      onSuccess?: () => void,
      onError?: (error?: ActionError) => void,
    ) =>
      runPackage(
        'delegate',
        agentId,
        roleCode,
        packageId,
        agentName,
        accessPackageName,
        onSuccess,
        onError,
      ),
    [runPackage],
  );

  const removeClientAccessPackage = useCallback(
    (
      agentId: string,
      roleCode: string,
      packageId: string,
      agentName: string,
      accessPackageName: string,
      onSuccess?: () => void,
      onError?: (error?: ActionError) => void,
    ) =>
      runPackage(
        'remove',
        agentId,
        roleCode,
        packageId,
        agentName,
        accessPackageName,
        onSuccess,
        onError,
      ),
    [runPackage],
  );

  return { addClientAccessPackage, removeClientAccessPackage };
};
