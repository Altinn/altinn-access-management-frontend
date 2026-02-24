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
  onActionError?: (resource: ServiceResource, errorInfo?: ActionError) => void;
}

const getErrorInfo = (action: 'delegate' | 'revoke', error: unknown): ActionError => {
  const status =
    typeof error === 'string' || typeof error === 'number'
      ? String(error)
      : typeof error === 'object' && error !== null && 'status' in error
        ? String(error.status as string | number)
        : '500';

  const detailsFromResponse =
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    error.data &&
    typeof error.data === 'object' &&
    !Array.isArray(error.data)
      ? (error.data as ActionError['details'])
      : undefined;

  return {
    httpStatus: status,
    details: { ...detailsFromResponse, detail: action },
    timestamp: new Date().toISOString(),
  };
};

export const useResourceListDelegation = ({
  onActionError,
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
      if (!actingParty || !fromParty || !toParty) {
        onActionError?.(resource, getErrorInfo('delegate', 500));
        return;
      }

      if (resource.delegable === false) {
        onActionError?.(resource, getErrorInfo('delegate', 403));
        return;
      }
      setResourceLoading(resource.identifier, true);
      const result = await runDelegationCheck(resource.identifier);

      if (result.error) {
        onActionError?.(resource, getErrorInfo('delegate', result.error));
        setResourceLoading(resource.identifier, false);
        return;
      }

      if (result.data) {
        const canDelegateAllActions =
          result.data.length > 0 && result.data.every((action) => action.result);

        if (canDelegateAllActions) {
          const allActionKeys = result.data.map((action) => action.rule.key);
          delegateRights({
            partyUuid: actingParty.partyUuid,
            fromUuid: fromParty.partyUuid,
            toUuid: toParty.partyUuid,
            resourceId: resource.identifier,
            actionKeys: allActionKeys,
          })
            .unwrap()
            .then(() => {})
            .catch((error) => {
              onActionError?.(resource, getErrorInfo('delegate', error));
            })
            .finally(() => {
              setResourceLoading(resource.identifier, false);
            });
          return;
        }
      }
      onActionError?.(resource, getErrorInfo('delegate', 403));
      setResourceLoading(resource.identifier, false);
    },
    [actingParty, delegateRights, fromParty, onActionError, runDelegationCheck, toParty],
  );

  const revokeFromList = useCallback(
    (resource: ServiceResource) => {
      if (!actingParty || !fromParty || !toParty) {
        onActionError?.(resource, getErrorInfo('revoke', 500));
        return;
      }
      setResourceLoading(resource.identifier, true);
      revokeResource({
        from: fromParty.partyUuid,
        to: toParty.partyUuid,
        party: actingParty.partyUuid,
        resourceId: resource.identifier,
      })
        .unwrap()
        .then(() => {})
        .catch((error) => {
          onActionError?.(resource, getErrorInfo('revoke', error));
        })
        .finally(() => {
          setResourceLoading(resource.identifier, false);
        });
    },
    [actingParty, fromParty, onActionError, revokeResource, toParty],
  );

  return {
    delegateFromList,
    revokeFromList,
    isResourceLoading: (resourceId: string) => isResourceLoading(resourceId),
  };
};
