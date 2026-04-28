import { useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { requestApi, type EnrichedResourceRequest } from '@/rtk/features/requestApi';

interface UseMultipleDraftRequestsResult {
  requests: EnrichedResourceRequest[];
  isLoading: boolean;
  loadError: boolean;
}

export const useMultipleDraftRequests = (ids: string[]): UseMultipleDraftRequestsResult => {
  const dispatch = useAppDispatch();
  const subscriptionsRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    const subscriptions = ids.map((id) =>
      dispatch(requestApi.endpoints.getEnrichedDraftRequest.initiate({ id })),
    );
    subscriptionsRef.current = subscriptions.map((sub) => sub.unsubscribe);

    return () => {
      subscriptionsRef.current.forEach((unsub) => unsub());
      subscriptionsRef.current = [];
    };
  }, [dispatch, ids]);

  const selectors = useMemo(
    () => ids.map((id) => requestApi.endpoints.getEnrichedDraftRequest.select({ id })),
    [ids],
  );

  const results = useAppSelector((state) => selectors.map((sel) => sel(state)));

  const requests = results
    .map((r) => r.data)
    .filter((d): d is EnrichedResourceRequest => d !== undefined);

  const isLoading = results.some((r) => (r.isLoading || r.isUninitialized) && !r.data);
  const loadError = results.every((r) => r.isError && !r.data); // Drop invalid IDs silently, but show error if all are invalid or fail to load

  return { requests, isLoading, loadError };
};
