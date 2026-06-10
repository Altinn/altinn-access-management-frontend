import { type RefCallback, useEffect, useState } from 'react';

// Matches the interactive descendants we can safely move focus back to after UI changes.
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const focusElement = (element: HTMLElement) => {
  const shouldRestoreTabIndex =
    !element.matches(FOCUSABLE_SELECTOR) && !element.hasAttribute('tabindex');

  if (shouldRestoreTabIndex) {
    element.tabIndex = -1;
  }

  element.focus();

  if (shouldRestoreTabIndex) {
    element.removeAttribute('tabindex');
  }
};

interface UseRestoreFocusOptions {
  shouldRestoreFocus?: boolean;
}

// Returns a container ref and a setter for the element id to focus once enabled.
// The target must already be in the DOM when focus is restored, so callers should gate
// shouldRestoreFocus until the relevant content has rendered.
export const useRestoreFocusRef = <T extends HTMLElement = HTMLElement>({
  shouldRestoreFocus = true,
}: UseRestoreFocusOptions = {}) => {
  // Tracking the container as state (rather than a ref) lets the effect below re-run when the
  // container mounts/remounts, which is the trigger for views that unmount while a detail is open.
  const [containerElement, setContainerElement] = useState<T | null>(null);
  const [focusTargetId, setFocusTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (!containerElement || !focusTargetId || !shouldRestoreFocus) {
      return;
    }

    const target = containerElement.ownerDocument.getElementById(focusTargetId);
    if (!(target instanceof HTMLElement) || !containerElement.contains(target)) {
      return;
    }

    focusElement(
      target.matches(FOCUSABLE_SELECTOR)
        ? target
        : (target.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? target),
    );
    setFocusTargetId(null);
  }, [containerElement, focusTargetId, shouldRestoreFocus]);

  return {
    ref: setContainerElement as RefCallback<T>,
    setFocusTargetId,
  };
};
