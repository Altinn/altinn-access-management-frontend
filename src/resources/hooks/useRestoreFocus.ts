import { type RefCallback, useCallback, useEffect, useRef, useState } from 'react';

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
  const focusTargetIdRef = useRef<string | null>(null);
  const [restoreRequest, setRestoreRequest] = useState(0);

  const containerRef = useCallback<RefCallback<HTMLElement>>((node) => {
    setContainerElement(node);
  }, []);

  const setFocusTargetId = useCallback((targetId: string | null) => {
    focusTargetIdRef.current = targetId;
    setRestoreRequest((previous) => previous + 1);
  }, []);

  useEffect(() => {
    const focusTargetId = focusTargetIdRef.current;

    if (!containerElement || !focusTargetId || !shouldRestoreFocus) {
      return;
    }

    const target = containerElement.querySelector(`[id="${CSS.escape(focusTargetId)}"]`);
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const focusableTarget = target.matches(RESTORE_FOCUS_SELECTOR)
      ? target
      : target.querySelector<HTMLElement>(RESTORE_FOCUS_SELECTOR);

    const elementToFocus = focusableTarget ?? (focusNonInteractiveTarget ? target : null);

    if (!elementToFocus) {
      focusTargetIdRef.current = null;
      return;
    }

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

    focusTargetIdRef.current = null;
  }, [containerElement, focusNonInteractiveTarget, restoreRequest, shouldRestoreFocus]);

  return {
    containerRef,
    setFocusTargetId,
  };
};
