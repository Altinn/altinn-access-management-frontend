import { useCallback, useState } from 'react';

import type { ActionError } from '@/resources/hooks/useActionError';
import { usePartyRepresentation } from '@/features/amUI/common/PartyRepresentationContext/PartyRepresentationContext';
import {
  useDelegateRightsMutation,
  useLazyDelegationCheckQuery,
  useRevokeResourceMutation,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';

interface UseResourceListDelegationProps {
  onActionError?: (resource: ServiceResource, errorInfo: ActionError) => void;
  onSuccess?: (resource: ServiceResource) => void;
  onPartialDelegation?: (resource: ServiceResource) => void;
}

const extractStatus = (error: unknown): string => {
  if (error && typeof error === 'object' && 'status' in error) {
    return String((error as { status: unknown }).status);
  }
  return String(error);
};

const getErrorInfo = (
  action: 'delegate' | 'revoke',
  status: string,
  details?: ActionError['details'],
): ActionError => {
  return {
    httpStatus: status,
    details: details,
    timestamp: new Date().toISOString(),
  };
};

export const useResourceListDelegation = ({
  onActionError,
  onSuccess,
  onPartialDelegation,
}: UseResourceListDelegationProps = {}) => {
  const [runDelegationCheck] = useLazyDelegationCheckQuery();
  const [delegateRights] = useDelegateRightsMutation();
  const [revokeResource] = useRevokeResourceMutation();
  const { actingParty, fromParty, toParty } = usePartyRepresentation();

  const [loadingByResourceId, setLoadingByResourceId] = useState<Record<string, boolean>>({});
  const isResourceLoading = useCallback(
    (resourceId: string) => loadingByResourceId[resourceId] ?? false,
    [loadingByResourceId],
  );

  const setResourceLoading = useCallback((resourceId: string, isLoading: boolean) => {
    setLoadingByResourceId((prev) => ({ ...prev, [resourceId]: isLoading }));
  }, []);

  const delegateFromList = useCallback(
    async (resource: ServiceResource) => {
      if (resource.delegable === false) {
        onActionError?.(resource, getErrorInfo('delegate', '403'));
        return;
      }

      setResourceLoading(resource.identifier, true);
      const result = await runDelegationCheck(resource.identifier);
      if (result.error) {
        onActionError?.(resource, getErrorInfo('delegate', extractStatus(result.error)));
        setResourceLoading(resource.identifier, false);
        return;
      }

      if (result.data) {
        const canDelegateAllActions =
          result.data.length > 0 && result.data.every((action) => action.result);

        if (canDelegateAllActions) {
          const allActionKeys = result.data.map((action) => action.right.key);
          delegateRights({
            partyUuid: actingParty!.partyUuid,
            fromUuid: fromParty!.partyUuid,
            toUuid: toParty!.partyUuid,
            resourceId: resource.identifier,
            actionKeys: allActionKeys,
          })
            .unwrap()
            .then(() => {
              onSuccess?.(resource);
            })
            .catch((error) => {
              onActionError?.(resource, getErrorInfo('delegate', extractStatus(error)));
            })
            .finally(() => {
              setResourceLoading(resource.identifier, false);
            });
          return;
        }
      }
      const canDelegateSomeActions = result.data && result.data.some((action) => action.result);

      if (canDelegateSomeActions) {
        onPartialDelegation?.(resource);
      } else {
        onActionError?.(resource, getErrorInfo('delegate', '403'));
      }
      setResourceLoading(resource.identifier, false);
    },
    [
      actingParty,
      delegateRights,
      fromParty,
      onActionError,
      onPartialDelegation,
      onSuccess,
      runDelegationCheck,
      toParty,
    ],
  );

  const revokeFromList = useCallback(
    (resource: ServiceResource) => {
      setResourceLoading(resource.identifier, true);
      revokeResource({
        from: fromParty!.partyUuid,
        to: toParty!.partyUuid,
        party: actingParty!.partyUuid,
        resourceId: resource.identifier,
      })
        .unwrap()
        .then(() => {
          onSuccess?.(resource);
        })
        .catch((error) => {
          onActionError?.(resource, getErrorInfo('revoke', extractStatus(error)));
        })
        .finally(() => {
          setResourceLoading(resource.identifier, false);
        });
    },
    [actingParty, fromParty, onActionError, onSuccess, revokeResource, toParty],
  );

  return {
    delegateFromList,
    revokeFromList,
    isResourceLoading,
  };
};
