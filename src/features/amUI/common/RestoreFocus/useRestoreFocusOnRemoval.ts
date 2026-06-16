import { useCallback, useEffect, useState } from 'react';

import type { RestoreFocus } from './RestoreFocus';

// Restores focus after an item is removed from a list (e.g. an inline delete). Call the returned
// callback with the item's id from the delete success handler. Once the item is gone from the list,
// focus is requested for that id; since the element no longer exists, a <RestoreFocusFallback> in
// the provider catches it and moves focus to the list heading instead of dropping it to the body.
//
// Reusable across any list that renders RestoreFocus targets and removes items in place.
export const useRestoreFocusOnRemoval = (
  restoreFocus: RestoreFocus,
  presentIds: string[],
  isSettling = false,
) => {
  const [pendingRemovedId, setPendingRemovedId] = useState<string | null>(null);

  useEffect(() => {
    // Wait until the data has settled and the item is actually gone before restoring focus.
    if (pendingRemovedId === null || isSettling || presentIds.includes(pendingRemovedId)) {
      return;
    }

    restoreFocus.requestFocus(pendingRemovedId);
    setPendingRemovedId(null);
  }, [presentIds, isSettling, pendingRemovedId, restoreFocus]);

  return useCallback((id: string) => setPendingRemovedId(id), []);
};
