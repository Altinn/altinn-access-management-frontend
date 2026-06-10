import { useCallback, useEffect, useState } from 'react';

// Matches the interactive descendants we can safely move focus back to after UI changes.
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const findElementByIdInContainer = (containerElement: HTMLElement, focusTargetId: string) => {
  if (containerElement.id === focusTargetId) {
    return containerElement;
  }

  const target = containerElement.ownerDocument.getElementById(focusTargetId);
  return target instanceof HTMLElement && containerElement.contains(target) ? target : null;
};

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
  onFocusRestored?: () => void;
}

// Returns a callback ref for a container; focuses the element matching focusTargetId once enabled.
// The target must already be in the DOM when focus is restored, so callers should gate
// shouldRestoreFocus until the relevant content has rendered.
export const useRestoreFocusRef = <T extends HTMLElement = HTMLElement>(
  focusTargetId?: string | null,
  { shouldRestoreFocus = true, onFocusRestored }: UseRestoreFocusOptions = {},
) => {
  // Tracking the container as state (rather than a ref) lets the effect below re-run when the
  // container mounts/remounts, which is the trigger for views that unmount while a detail is open.
  const [containerElement, setContainerElement] = useState<T | null>(null);

  useEffect(() => {
    if (!containerElement || !focusTargetId || !shouldRestoreFocus) {
      return;
    }

    const target = findElementByIdInContainer(containerElement, focusTargetId);
    if (!target) {
      return;
    }

    const targetElement = target.matches(FOCUSABLE_SELECTOR)
      ? target
      : (target.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? target);

    focusElement(targetElement);
    onFocusRestored?.();
  }, [containerElement, focusTargetId, shouldRestoreFocus, onFocusRestored]);

  return useCallback((node: T | null) => setContainerElement(node), []);
};
