import { useEffect, useRef } from 'react';

import { useRestoreFocusContext } from './RestoreFocus';

interface PendingFocus<T> {
  focusId: string;
  fallbackId?: string;
  dataAtRequest: T;
}

// Defers a focus request until `data` is a different reference than it was when the request was
// made — i.e. until a query cache has actually refetched and React has committed the new DOM.
// Use this when focusing immediately could match a stale/outgoing element sharing an id with the
// one that's about to replace it.
export const useRestoreFocusOnDataChange = <T>(data: T) => {
  const restoreFocus = useRestoreFocusContext();
  const pendingRef = useRef<PendingFocus<T> | null>(null);

  const requestFocusOnDataChange = (focusId: string, fallbackId?: string) => {
    pendingRef.current = { focusId, fallbackId, dataAtRequest: data };
  };

  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending || !restoreFocus || data === pending.dataAtRequest) {
      return;
    }

    pendingRef.current = null;
    const frame = requestAnimationFrame(() =>
      restoreFocus.requestFocus(pending.focusId, pending.fallbackId),
    );
    return () => cancelAnimationFrame(frame);
  }, [data, restoreFocus]);

  return requestFocusOnDataChange;
};
