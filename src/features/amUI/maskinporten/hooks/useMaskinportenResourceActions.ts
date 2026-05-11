import { useState } from 'react';

import { getActionError, type ActionError } from '@/resources/hooks/useActionError';
import {
  useAddMaskinportenResourceMutation,
  useRemoveMaskinportenResourceMutation,
} from '@/rtk/features/maskinportenApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

interface ActionCallbacks {
  onSuccess?: (resource: ServiceResource) => void;
  onError?: (resource: ServiceResource, error: ActionError) => void;
}

interface UseMaskinportenResourceActionsArgs {
  party: string | undefined;
  supplier: string | undefined;
}

export const useMaskinportenResourceActions = ({
  party,
  supplier,
}: UseMaskinportenResourceActionsArgs) => {
  const [addResource] = useAddMaskinportenResourceMutation();
  const [removeResource] = useRemoveMaskinportenResourceMutation();
  const [loadingByResourceId, setLoadingByResourceId] = useState<Record<string, boolean>>({});

  const setLoading = (resourceId: string, isLoading: boolean) => {
    setLoadingByResourceId((prev) => ({ ...prev, [resourceId]: isLoading }));
  };

  const isLoading = (resourceId: string) => loadingByResourceId[resourceId] ?? false;

  const run = async (
    resource: ServiceResource,
    action: () => Promise<unknown>,
    callbacks: ActionCallbacks,
  ) => {
    if (!party || !supplier || !resource.identifier) return;
    setLoading(resource.identifier, true);
    try {
      await action();
      callbacks.onSuccess?.(resource);
    } catch (error) {
      callbacks.onError?.(resource, getActionError(error));
    } finally {
      setLoading(resource.identifier, false);
    }
  };

  const delegate = (resource: ServiceResource, callbacks: ActionCallbacks = {}) =>
    run(
      resource,
      () =>
        addResource({
          party: party!,
          supplier: supplier!,
          resource: resource.identifier,
        }).unwrap(),
      callbacks,
    );

  const remove = (resource: ServiceResource, callbacks: ActionCallbacks = {}) =>
    run(
      resource,
      () =>
        removeResource({
          party: party!,
          supplier: supplier!,
          resource: resource.identifier,
        }).unwrap(),
      callbacks,
    );

  return { delegate, remove, isLoading };
};
