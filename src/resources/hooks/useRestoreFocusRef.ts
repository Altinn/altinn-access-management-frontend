import { useCallback, useEffect, useRef } from 'react';

// Matches the interactive descendants we can safely move focus back to after UI changes.
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const FOCUS_RESTORE_TIMEOUT_MS = 1000;

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

interface UseFocusTargetOptions {
  shouldRestoreFocus?: boolean;
  onFocusRestored?: () => void;
}

// Returns a callback ref that focuses focusTargetId, or waits for it to appear, once enabled.
export const useRestoreFocusRef = <T extends HTMLElement = HTMLElement>(
  focusTargetId?: string | null,
  { shouldRestoreFocus = true, onFocusRestored }: UseFocusTargetOptions = {},
) => {
  const containerRef = useRef<T | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const timeoutIdRef = useRef<number | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  // Captured when we schedule work, so cleanup can cancel it even after the container ref is detached.
  const viewRef = useRef<Window | null>(null);

  const cancelPendingFocusRestore = useCallback(() => {
    if (animationFrameIdRef.current !== null) {
      viewRef.current?.cancelAnimationFrame(animationFrameIdRef.current);
    }
    if (timeoutIdRef.current !== null) {
      viewRef.current?.clearTimeout(timeoutIdRef.current);
    }
    animationFrameIdRef.current = null;
    timeoutIdRef.current = null;
    observerRef.current?.disconnect();
    observerRef.current = null;
  }, []);

  const scheduleFocusRestore = useCallback(() => {
    const containerElement = containerRef.current;
    if (!containerElement || !focusTargetId || !shouldRestoreFocus) {
      cancelPendingFocusRestore();
      return;
    }

    const tryFocusTarget = () => {
      if (!containerElement.isConnected) {
        return true;
      }

      const target = findElementByIdInContainer(containerElement, focusTargetId);
      if (!target) {
        return false;
      }

      const targetElement = target.matches(FOCUSABLE_SELECTOR)
        ? target
        : (target.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? target);

      focusElement(targetElement);
      onFocusRestored?.();
      return true;
    };

    const view = containerElement.ownerDocument.defaultView;
    if (!view) {
      tryFocusTarget();
      return;
    }

    cancelPendingFocusRestore();
    viewRef.current = view;
    animationFrameIdRef.current = view.requestAnimationFrame(() => {
      animationFrameIdRef.current = null;
      if (tryFocusTarget()) {
        return;
      }

      observerRef.current = new view.MutationObserver(() => {
        if (tryFocusTarget()) {
          cancelPendingFocusRestore();
        }
      });
      observerRef.current.observe(containerElement, { childList: true, subtree: true });
      timeoutIdRef.current = view.setTimeout(cancelPendingFocusRestore, FOCUS_RESTORE_TIMEOUT_MS);
    });
  }, [cancelPendingFocusRestore, focusTargetId, onFocusRestored, shouldRestoreFocus]);

  useEffect(() => {
    scheduleFocusRestore();
    return cancelPendingFocusRestore;
  }, [cancelPendingFocusRestore, scheduleFocusRestore]);

  return useCallback(
    (containerElement: T | null) => {
      containerRef.current = containerElement;
      scheduleFocusRestore();
    },
    [scheduleFocusRestore],
  );
};
