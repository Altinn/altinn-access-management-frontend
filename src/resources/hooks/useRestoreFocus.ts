import { type RefCallback, useEffect, useState } from 'react';

const RESTORE_FOCUS_SELECTOR = 'button:not([disabled])';

interface UseRestoreFocusOptions {
  shouldRestoreFocus?: boolean;
  focusNonInteractiveTarget?: boolean;
}

// Returns a container ref and a setter for the element id to focus once enabled.
// The target must already be in the DOM when focus is restored, so callers should gate
// shouldRestoreFocus until the relevant content has rendered.
export const useRestoreFocus = ({
  shouldRestoreFocus = true,
  focusNonInteractiveTarget = false,
}: UseRestoreFocusOptions = {}) => {
  const [containerElement, setContainerElement] = useState<HTMLElement | null>(null);
  const [focusTargetId, setFocusTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (!containerElement || !focusTargetId || !shouldRestoreFocus) {
      return;
    }

    const target = containerElement.ownerDocument.getElementById(focusTargetId);
    if (!(target instanceof HTMLElement) || !containerElement.contains(target)) {
      return;
    }

    const focusableTarget = target.matches(RESTORE_FOCUS_SELECTOR)
      ? target
      : target.querySelector<HTMLElement>(RESTORE_FOCUS_SELECTOR);

    const elementToFocus = focusableTarget ?? (focusNonInteractiveTarget ? target : null);
    if (elementToFocus) {
      const shouldRestoreTabIndex =
        !elementToFocus.matches(RESTORE_FOCUS_SELECTOR) && !elementToFocus.hasAttribute('tabindex');

      if (shouldRestoreTabIndex) {
        // Non-interactive fallback targets get tabindex=-1 temporarily so they can be focused
        // programmatically without being added to the normal tab order.
        elementToFocus.tabIndex = -1;
      }

      elementToFocus.focus();

      if (shouldRestoreTabIndex) {
        elementToFocus.removeAttribute('tabindex');
      }
    }

    setFocusTargetId(null);
  }, [containerElement, focusNonInteractiveTarget, focusTargetId, shouldRestoreFocus]);

  return {
    containerRef: setContainerElement as RefCallback<HTMLElement>,
    setFocusTargetId,
  };
};
