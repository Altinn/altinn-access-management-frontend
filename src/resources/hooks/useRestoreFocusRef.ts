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
  focusNonInteractiveTarget?: boolean;
}

// Returns a container ref and a setter for the element id to focus once enabled.
// The target must already be in the DOM when focus is restored, so callers should gate
// shouldRestoreFocus until the relevant content has rendered.
export const useRestoreFocusRef = <T extends HTMLElement = HTMLElement>({
  shouldRestoreFocus = true,
  focusNonInteractiveTarget = false,
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

    const focusableTarget = target.matches(FOCUSABLE_SELECTOR)
      ? target
      : target.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);

    if (focusableTarget) {
      focusElement(focusableTarget);
      setFocusTargetId(null);
      return;
    }

    if (!focusNonInteractiveTarget) {
      setFocusTargetId(null);
      return;
    }

    // Processed request rows can become non-interactive after approve/reject, but focus should
    // still return to the row once so users keep their place. focusElement only adds tabindex=-1
    // temporarily, so the row is not added to the normal tab order.
    focusElement(target);
    setFocusTargetId(null);
  }, [containerElement, focusNonInteractiveTarget, focusTargetId, shouldRestoreFocus]);

  return {
    ref: setContainerElement as RefCallback<T>,
    setFocusTargetId,
  };
};
