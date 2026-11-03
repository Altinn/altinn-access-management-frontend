import { useCallback } from 'react';
import { useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { ActionError } from '@/resources/hooks/useActionError';

import type { ClientBulkItem } from './getClientBulkItems';
import {
  useClientAccessDelegation,
  type ClientAccessTarget,
  type UseClientAccessDelegationParams,
} from './useClientAccessDelegation';

export type ClientSingleAccessMode = 'delegate' | 'remove';

export type ClientSingleAccessNames = { agentName: string; accessName: string };

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

export const useClientSingleAccessAction = (params: UseClientAccessDelegationParams) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { delegate, revoke } = useClientAccessDelegation(params);

  return useCallback(
    async (
      mode: ClientSingleAccessMode,
      target: ClientAccessTarget,
      item: ClientBulkItem,
      { agentName, accessName }: ClientSingleAccessNames,
      onSuccess?: () => void,
      onError?: (error?: ActionError) => void,
    ) => {
      const { failed, error } = await (mode === 'delegate' ? delegate : revoke)(target, [item]);

      const succeeded = failed.length === 0;
      const messages = MESSAGES[mode];
      openSnackbar({
        message: t(succeeded ? messages.success : messages.error, { name: agentName, accessName }),
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
};
