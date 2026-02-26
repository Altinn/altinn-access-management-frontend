import { useCallback, useState, useEffect, useRef } from 'react';

import type { ActionError } from '@/resources/hooks/useActionError';
import { usePartyRepresentation } from '@/features/amUI/common/PartyRepresentationContext/PartyRepresentationContext';
import {
  useDelegateRightsMutation,
  useGetSingleRightsForRightholderQuery,
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

const extractDetails = (error: unknown): ActionError['details'] | undefined => {
  if (error && typeof error === 'object' && 'data' in error) {
    return error.data as ActionError['details'];
  }
  return undefined;
};

const getErrorInfo = (status: string, details?: ActionError['details']): ActionError => {
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
  const { isFetching } = useGetSingleRightsForRightholderQuery(
    {
      actingParty: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid || '',
      to: toParty?.partyUuid || '',
    },
    { skip: !toParty || !fromParty || !actingParty },
  );

  const [loadingByResourceId, setLoadingByResourceId] = useState<Record<string, boolean>>({});
  const waitingForRefetchRef = useRef<Set<string>>(new Set());
  const isResourceLoading = useCallback(
    (resourceId: string) => loadingByResourceId[resourceId] ?? false,
    [loadingByResourceId],
  );

  const setResourceLoading = useCallback((resourceId: string, isLoading: boolean) => {
    setLoadingByResourceId((prev) => ({ ...prev, [resourceId]: isLoading }));
  }, []);

  useEffect(() => {
    if (!isFetching && waitingForRefetchRef.current.size > 0) {
      // Clear loading state for all resources that were waiting for refetch
      waitingForRefetchRef.current.forEach((resourceId) => {
        console.log('Clearing loading state after refetch for resource', resourceId);
        setResourceLoading(resourceId, false);
      });
      waitingForRefetchRef.current.clear();
    }
  }, [isFetching, setResourceLoading]);

  const delegateFromList = useCallback(
    async (resource: ServiceResource) => {
      if (resource.delegable === false) {
        onActionError?.(resource, getErrorInfo('403'));
        return;
      }

      setResourceLoading(resource.identifier, true);
      const result = await runDelegationCheck(resource.identifier);
      if (result.isError) {
        onActionError?.(
          resource,
          getErrorInfo(extractStatus(result.error), extractDetails(result.error)),
        );
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
              // Add to waiting set - loading will be cleared when automatic refetch completes
              waitingForRefetchRef.current.add(resource.identifier);
            })
            .catch((error) => {
              onActionError?.(resource, getErrorInfo(extractStatus(error), extractDetails(error)));
              setResourceLoading(resource.identifier, false);
            });
          return;
        }
      }
      const canDelegateSomeActions = result.data && result.data.some((action) => action.result);

      if (canDelegateSomeActions) {
        onPartialDelegation?.(resource);
      } else {
        onActionError?.(resource, getErrorInfo('403'));
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
      setResourceLoading,
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
          // Add to waiting set - loading will be cleared when automatic refetch completes
          waitingForRefetchRef.current.add(resource.identifier);
        })
        .catch((error) => {
          onActionError?.(resource, getErrorInfo(extractStatus(error), extractDetails(error)));
          setResourceLoading(resource.identifier, false);
        });
    },
    [actingParty, fromParty, onActionError, onSuccess, revokeResource, setResourceLoading, toParty],
  );

  return {
    delegateFromList,
    revokeFromList,
    isResourceLoading,
  };
};
