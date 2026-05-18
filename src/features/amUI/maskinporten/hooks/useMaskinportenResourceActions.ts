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

  const setLoading = (resourceId: string, isLoading: boolean) => {
    setLoadingByResourceId((prev) => ({ ...prev, [resourceId]: isLoading }));
  };

  const isLoading = (resourceId: string) => loadingByResourceId[resourceId] ?? false;

  const run = async (
    resource: ServiceResource,
    action: ResourceAction,
    callbacks: ActionCallbacks,
  ) => {
    if (!resource.identifier) return;
    setLoading(resource.identifier, true);
    try {
      await action(resource);
      callbacks.onSuccess?.(resource);
    } catch (error) {
      callbacks.onError?.(resource, getActionError(error));
    } finally {
      setLoading(resource.identifier, false);
    }
  };

  const delegate = (resource: ServiceResource, callbacks: ActionCallbacks = {}) => {
    if (!delegateAction) return;
    return run(resource, delegateAction, callbacks);
  };

  const remove = (resource: ServiceResource, callbacks: ActionCallbacks = {}) => {
    if (!removeAction) return;
    return run(resource, removeAction, callbacks);
  };

  return { delegate, remove, isLoading };
};
