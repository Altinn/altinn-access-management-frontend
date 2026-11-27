import { useState } from 'react';

import { getActionError, type ActionError } from '@/resources/hooks/useActionError';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

interface ActionCallbacks {
  onSuccess?: (resource: ServiceResource) => void;
  onError?: (resource: ServiceResource, error: ActionError) => void;
}

type ResourceAction = (resource: ServiceResource) => Promise<unknown>;

interface UseMaskinportenResourceActionsArgs {
  delegate?: ResourceAction;
  remove?: ResourceAction;
}

export const useMaskinportenResourceActions = ({
  delegate: delegateAction,
  remove: removeAction,
}: UseMaskinportenResourceActionsArgs) => {
  const [loadingByResourceId, setLoadingByResourceId] = useState<Record<string, boolean>>({});

  const isLoading = (resourceId: string) => loadingByResourceId[resourceId] ?? false;

  const setLoading = (resourceId: string, value: boolean) =>
    setLoadingByResourceId((prev) => ({ ...prev, [resourceId]: value }));

  const delegate = async (resource: ServiceResource, callbacks: ActionCallbacks = {}) => {
    if (!delegateAction || !resource.identifier) return;
    setLoading(resource.identifier, true);
    try {
      await delegateAction(resource);
      callbacks.onSuccess?.(resource);
    } catch (error) {
      callbacks.onError?.(resource, getActionError(error));
    } finally {
      setLoading(resource.identifier, false);
    }
  };

  const remove = async (resource: ServiceResource, callbacks: ActionCallbacks = {}) => {
    if (!removeAction || !resource.identifier) return;
    setLoading(resource.identifier, true);
    try {
      await removeAction(resource);
      callbacks.onSuccess?.(resource);
    } catch (error) {
      callbacks.onError?.(resource, getActionError(error));
    } finally {
      setLoading(resource.identifier, false);
    }
  };

  return { delegate, remove, isLoading };
};
