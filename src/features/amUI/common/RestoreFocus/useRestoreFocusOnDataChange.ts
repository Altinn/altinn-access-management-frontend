import { useEffect, useRef } from 'react';

import { useRestoreFocusContext } from './RestoreFocus';

interface PendingFocus<T> {
  focusId: string;
  fallbackId?: string;
  dataAtRequest: T;
}

// Use this when an action moves an item between two lists backed by the same query cache. For
// example, revoke moves a package from an "assigned" bucket to an "available" one, and the focus
// target only exists once that refetch lands.
//
// Call the returned requestFocusOnDataChange(id, fallbackId?) right after the action succeeds. It
// defers the actual requestFocus until `data` is a different reference than it was at request
// time. In other words, it waits until the query has refetched and React has committed the new
// DOM. This way it never matches a stale or outgoing element that shares an id with the one about
// to replace it.
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
