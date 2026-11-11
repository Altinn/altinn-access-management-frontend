import { useCallback } from 'react';

import type { ActionError } from '@/resources/hooks/useActionError';
import type {
  AddAgentAccessPackagesFn,
  RemoveAgentAccessPackagesFn,
} from '@/rtk/features/clientApi';

import type { ClientAccessPackageAction } from '../common/ClientAccessList/ClientAccessList';
import {
  useClientSingleAccessAction,
  type ClientSingleAccessMode,
} from '../common/ClientBulkDelegation/useClientSingleAccessAction';

type UseAgentDetailsAccessPackageActionsParams = {
  toPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackagesFn;
  removeAgentAccessPackages: RemoveAgentAccessPackagesFn;
};

type PackageActionInput = ClientAccessPackageAction & { agentName: string };

export const useAgentDetailsAccessPackageActions = ({
  toPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
  removeAgentAccessPackages,
}: UseAgentDetailsAccessPackageActionsParams) => {
  const runSingle = useClientSingleAccessAction({
    actingPartyUuid,
    addAgentAccessPackages,
    removeAgentAccessPackages,
  });

  const runPackage = useCallback(
    (
      mode: ClientSingleAccessMode,
      action: PackageActionInput,
      onSuccess?: () => void,
      onError?: (error?: ActionError) => void,
    ) =>
      runSingle(
        mode,
        { clientId: action.clientId, agentId: toPartyUuid },
        { kind: 'package', roleCode: action.roleCode, id: action.packageId },
        { agentName: action.agentName, accessName: action.accessPackageName },
        onSuccess,
        onError,
      ),
    [runSingle, toPartyUuid],
  );

  const addAgentAccessPackage = useCallback(
    (action: PackageActionInput, onSuccess?: () => void, onError?: (e?: ActionError) => void) =>
      runPackage('delegate', action, onSuccess, onError),
    [runPackage],
  );

  const removeAgentAccessPackage = useCallback(
    (action: PackageActionInput, onSuccess?: () => void, onError?: (e?: ActionError) => void) =>
      runPackage('remove', action, onSuccess, onError),
    [runPackage],
  );

  return { addAgentAccessPackage, removeAgentAccessPackage };
};
