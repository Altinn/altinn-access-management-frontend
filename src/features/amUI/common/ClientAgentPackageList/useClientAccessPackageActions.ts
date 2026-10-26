import { useCallback } from 'react';
import { useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type {
  AddAgentAccessPackagesFn,
  RemoveAgentAccessPackagesFn,
} from '@/rtk/features/clientApi';

import { useClientAccessDelegation } from '../ClientBulkDelegation/useClientAccessDelegation';

type UseClientAccessPackageActionsParams = {
  fromPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackagesFn;
  removeAgentAccessPackages: RemoveAgentAccessPackagesFn;
};

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

export const useClientAccessPackageActions = ({
  fromPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
  removeAgentAccessPackages,
}: UseClientAccessPackageActionsParams) => {
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
      agentId: string,
      roleCode: string,
      packageId: string,
      agentName: string,
      accessPackageName: string,
      onSuccess?: () => void,
      onError?: () => void,
    ) => {
      const { failed } = await (mode === 'delegate' ? delegate : revoke)(
        { clientId: fromPartyUuid, agentId },
        [{ kind: 'package', roleCode, id: packageId }],
      );

      const succeeded = failed.length === 0;
      const messages = MESSAGES[mode];
      openSnackbar({
        message: t(succeeded ? messages.success : messages.error, {
          name: agentName,
          accessName: accessPackageName,
        }),
        color: succeeded ? 'success' : 'danger',
      });
      if (succeeded) {
        onSuccess?.();
      } else {
        onError?.();
      }
    },
    [delegate, fromPartyUuid, openSnackbar, revoke, t],
  );

  const addClientAccessPackage = useCallback(
    (
      agentId: string,
      roleCode: string,
      packageId: string,
      agentName: string,
      accessPackageName: string,
      onSuccess?: () => void,
      onError?: () => void,
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
      onError?: () => void,
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
