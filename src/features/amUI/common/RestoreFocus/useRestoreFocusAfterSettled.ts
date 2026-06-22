import { useEffect, useRef } from 'react';

import { findFocusableElement, focusElement, focusHasBeenLost } from './RestoreFocusTarget';

interface UseRestoreFocusAfterSettledOptions {
  isSettled: boolean;
  requestWhen: boolean;
  onRestore: () => void;
}

// Use this as the onRestore callback for useRestoreFocusAfterSettled when "restore focus" just
// means focusing whatever button is available again inside this container. No stable id needed.
// It's a no-op if focus hasn't actually been lost.
export const focusFirstEnabledButton = (container: HTMLElement | null) => {
  if (!container || !focusHasBeenLost()) {
    return;
  }

  const focusable = findFocusableElement(container, container);
  if (focusable) {
    focusElement(focusable);
  }
};

// Use this when an action replaces a button with a loading or success state in place, so there's
// no stable DOM id left to target with useRestoreFocusTarget.
//
// Calls onRestore once isSettled reads true after requestWhen has been true. This works whether
// isSettled was already true at that point (an instant settle) or just flipped from false.
export const useRestoreFocusAfterSettled = ({
  isSettled,
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
    if (isPendingRef.current && isSettled) {
      isPendingRef.current = false;
      onRestore();
    }
  });
};
