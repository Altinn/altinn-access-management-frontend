import { useCallback } from 'react';
import { useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { ActionError } from '@/resources/hooks/useActionError';
import type {
  AddAgentAccessPackagesFn,
  RemoveAgentAccessPackagesFn,
} from '@/rtk/features/clientApi';

import type { ClientAccessPackageAction } from '../common/ClientAccessList/ClientAccessList';
import { useClientAccessDelegation } from '../common/ClientBulkDelegation/useClientAccessDelegation';

type UseAgentDetailsAccessPackageActionsParams = {
  toPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackagesFn;
  removeAgentAccessPackages: RemoveAgentAccessPackagesFn;
};

type PackageActionInput = ClientAccessPackageAction & { agentName: string };

const MESSAGES = {
  delegate: {
    success: 'client_administration_page.delegate_success_snackbar',
    error: 'client_administration_page.delegate_error',
  },
  remove: {
    success: 'client_administration_page.remove_success_snackbar',
    error: 'client_administration_page.remove_error',
  },
} as const;

export const useAgentDetailsAccessPackageActions = ({
  toPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
  removeAgentAccessPackages,
}: UseAgentDetailsAccessPackageActionsParams) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { delegate, revoke } = useClientAccessDelegation({
    actingPartyUuid,
    addAgentAccessPackages,
    removeAgentAccessPackages,
  });

  const runPackage = useCallback(
    async (
      mode: keyof typeof MESSAGES,
      action: PackageActionInput,
      onSuccess?: () => void,
      onError?: (error?: ActionError) => void,
    ) => {
      const { failed, error } = await (mode === 'delegate' ? delegate : revoke)(
        { clientId: action.clientId, agentId: toPartyUuid },
        [{ kind: 'package', roleCode: action.roleCode, id: action.packageId }],
      );

      const succeeded = failed.length === 0;
      const messages = MESSAGES[mode];
      openSnackbar({
        message: t(succeeded ? messages.success : messages.error, {
          name: action.agentName,
          accessName: action.accessPackageName,
        }),
        color: succeeded ? 'success' : 'danger',
      });
      if (succeeded) {
        onSuccess?.();
      } else {
        onError?.(error);
      }
    },
    [delegate, openSnackbar, revoke, t, toPartyUuid],
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
