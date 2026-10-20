import { useCallback } from 'react';
import { useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { AddAgentResourcesFn, RemoveAgentResourcesFn } from '@/rtk/features/clientApi';
import type { ActionError } from '@/resources/hooks/useActionError';

import { useClientAccessDelegation } from '../ClientBulkDelegation/useClientAccessDelegation';

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

export const useClientResourceActions = ({
  actingPartyUuid,
  addAgentResources,
  removeAgentResources,
}: UseClientResourceActionsParams) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { delegate, revoke } = useClientAccessDelegation({
    actingPartyUuid,
    addAgentResources,
    removeAgentResources,
  });

  const runResource = useCallback(
    async (
      mode: keyof typeof MESSAGES,
      input: ClientResourceDelegationInput,
      onSuccess?: () => void,
      onError?: (error?: ActionError) => void,
    ) => {
      const { failed, error } = await (mode === 'delegate' ? delegate : revoke)(
        { clientId: input.clientId, agentId: input.agentId },
        [{ kind: 'resource', roleCode: input.roleCode, id: input.resourceId }],
      );

      const succeeded = failed.length === 0;
      const messages = MESSAGES[mode];
      openSnackbar({
        message: t(succeeded ? messages.success : messages.error, {
          name: input.agentName,
          accessName: input.resourceName,
        }),
        color: succeeded ? 'success' : 'danger',
      });
      if (succeeded) {
        onSuccess?.();
      } else {
        onError?.(error);
      }
    },
    [delegate, openSnackbar, revoke, t],
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
