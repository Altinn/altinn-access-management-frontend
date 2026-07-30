import { useCallback } from 'react';
import { useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { AddAgentResourcesFn, RemoveAgentResourcesFn } from '@/rtk/features/clientApi';
import { getActionError, type ActionError } from '@/resources/hooks/useActionError';

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
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();

  const addClientResource = useCallback(
    async (
      input: ClientResourceDelegationInput,
      onSuccess?: () => void,
      onError?: (error?: ActionError) => void,
    ) => {
      if (!actingPartyUuid || !addAgentResources || !input.clientId || !input.agentId) {
        onError?.();
        return;
      }

      try {
        await addAgentResources({
          from: input.clientId,
          to: input.agentId,
          party: actingPartyUuid,
          payload: {
            values: [
              {
                role: input.roleCode,
                resources: [input.resourceId],
              },
            ],
          },
        }).unwrap();
        openSnackbar({
          message: t('client_administration_page.delegate_package_success_snackbar', {
            name: input.agentName,
            accessPackage: input.resourceName,
          }),
          color: 'success',
        });
        onSuccess?.();
      } catch (error) {
        openSnackbar({
          message: t('client_administration_page.delegate_package_error', {
            name: input.agentName,
            accessPackage: input.resourceName,
          }),
          color: 'danger',
        });
        onError?.(getActionError(error));
      }
    },
    [actingPartyUuid, addAgentResources, openSnackbar, t],
  );

  const removeClientResource = useCallback(
    async (
      input: ClientResourceDelegationInput,
      onSuccess?: () => void,
      onError?: (error?: ActionError) => void,
    ) => {
      if (!actingPartyUuid || !removeAgentResources || !input.clientId || !input.agentId) {
        onError?.();
        return;
      }

      try {
        await removeAgentResources({
          from: input.clientId,
          to: input.agentId,
          party: actingPartyUuid,
          payload: {
            values: [
              {
                role: input.roleCode,
                resources: [input.resourceId],
              },
            ],
          },
        }).unwrap();
        openSnackbar({
          message: t('client_administration_page.remove_package_success_snackbar', {
            name: input.agentName,
            accessPackage: input.resourceName,
          }),
          color: 'success',
        });
        onSuccess?.();
      } catch (error) {
        openSnackbar({
          message: t('client_administration_page.remove_package_error', {
            name: input.agentName,
            accessPackage: input.resourceName,
          }),
          color: 'danger',
        });
        onError?.(getActionError(error));
      }
    },
    [actingPartyUuid, openSnackbar, removeAgentResources, t],
  );

  return { addClientResource, removeClientResource };
};
