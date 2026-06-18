import { useEffect, useRef } from 'react';

import { findFocusableElement, focusElement, focusHasBeenLost } from './RestoreFocusTarget';

interface UseRestoreFocusAfterSettledOptions {
  isSettling: boolean;
  requestWhen: boolean;
  onRestore: () => void;
}

export const focusFirstEnabledButton = (container: HTMLElement | null) => {
  if (!container || !focusHasBeenLost()) {
    return;
  }

  const focusable = findFocusableElement(container, container);
  if (focusable) {
    focusElement(focusable);
  }
};

// Calls onRestore once isSettling reads false after requestWhen has been true, whether isSettling
// was already false at that point or just flipped from true.
export const useRestoreFocusAfterSettled = ({
  isSettling,
  requestWhen,
  onRestore,
}: UseRestoreFocusAfterSettledOptions) => {
  const isPendingRef = useRef(false);

  useEffect(() => {
    if (requestWhen) {
      isPendingRef.current = true;
    }
  }, [requestWhen]);

  // No dependency array — runs after every render, including the one where the effect above just
  // set isPendingRef, so there is no need to force a re-check via extra state.
  useEffect(() => {
    if (isPendingRef.current && !isSettling) {
      isPendingRef.current = false;
      onRestore();
    }
  });
};
