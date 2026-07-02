import { type ReactNode, useContext, useEffect, useRef } from 'react';

import { RestoreFocusContext } from './RestoreFocus';

const FOCUSABLE_SELECTOR = 'button:not([disabled]), a[href]';

const isOutsideScopeDialog = (element: HTMLElement, scope: HTMLElement) => {
  const elementDialog = element.closest('dialog');
  return elementDialog !== null && elementDialog !== scope.closest('dialog');
};

const isUnavailableForFocus = (element: HTMLElement, scope: HTMLElement) =>
  isOutsideScopeDialog(element, scope) ||
  Boolean(element.closest('dialog:not([open]), [hidden], [aria-hidden="true"], [inert]'));

export const findFocusableElement = (element: HTMLElement, scope: HTMLElement) => {
  if (element.matches(FOCUSABLE_SELECTOR) && !isUnavailableForFocus(element, scope)) {
    return element;
  }

  return Array.from(element.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).find(
    (candidate) => !isUnavailableForFocus(candidate, scope),
  );
};

// Restore focus only when it has been lost to the document body (e.g. the acted-on element was
// disabled during an async action, or removed). If the user has since moved focus to a real
// element, leave it alone so we never steal focus after the action settles.
export const focusHasBeenLost = () =>
  document.activeElement === null ||
  document.activeElement === document.body ||
  (document.activeElement instanceof HTMLElement &&
    isUnavailableForFocus(document.activeElement, document.activeElement));

// Moves focus to the element, including non-natively-focusable ones (e.g. a heading or a processed,
// non-interactive row).
export const focusElement = (element: HTMLElement) => {
  if (element.matches(FOCUSABLE_SELECTOR)) {
    element.focus();
    return;
  }

  // Give a non-natively-focusable element a temporary tabindex so it can take focus. It must stay set
  // while the element is focused: removing tabindex from the active element blurs it straight to
  // <body> in real browsers (jsdom does not, which masked this in tests). Defer removal until focus
  // actually leaves, via a one-shot blur listener.
  if (!element.hasAttribute('tabindex')) {
    element.tabIndex = -1;
    element.addEventListener('blur', () => element.removeAttribute('tabindex'), { once: true });
  }
  element.focus();
};

// Use this in any component that could be the destination of a requestFocus(id) call. Typical
// examples:
// - a list row
// - an inline action control with its own distinct id
//
// Focuses the first focusable element inside the matching DOM id once that id is requested. The
// request persists until it's consumed, so a target that mounts after the request (for example, a
// skeleton replaced by real data) still picks it up. Must be used within a RestoreFocusProvider.
export const useRestoreFocusTarget = (id: string) => {
  const context = useContext(RestoreFocusContext);
  const isRequested = context?.focusRequestId === id;
  const containerElement = context?.containerElement;
  const clearRequest = context?.clearRequest;

  useEffect(() => {
    if (!isRequested || !containerElement || !clearRequest) {
      return;
    }

    const target = containerElement.querySelector(`[id="${CSS.escape(id)}"]`);
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (focusHasBeenLost()) {
      const focusable = findFocusableElement(target, target);
      focusElement(focusable ?? target);
    }

    clearRequest();
  }, [clearRequest, containerElement, id, isRequested]);
};

// Use this to wrap something durable (a list heading, a modal's content area) that should catch
// focus when the requested id isn't present. This can happen if the originating item was removed,
// or sits in a currently-collapsed section. It tries fallbackId next, if one was given to
// requestFocus, then falls back to its own first focusable descendant. Render exactly one per
// zone.
export const RestoreFocusFallback = ({ children }: { children: ReactNode }) => {
  const context = useContext(RestoreFocusContext);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const focusRequestId = context?.focusRequestId;
  const focusFallbackId = context?.focusFallbackId;
  const containerElement = context?.containerElement;
  const clearRequest = context?.clearRequest;

  useEffect(() => {
    if (!focusRequestId || !containerElement || !clearRequest) {
      return;
    }

    // A target will handle it if the requested id is present in the container.
    const targetPresent = containerElement.querySelector(`[id="${CSS.escape(focusRequestId)}"]`);
    if (targetPresent) {
      return;
    }

    // Before the generic catch-all below, try the request's own fallback id. The fallback target
    // does not have to be interactive itself (e.g. a section heading): like useRestoreFocusTarget,
    // we focus its first focusable descendant if it has one, otherwise the element itself.
    if (focusFallbackId) {
      const fallbackTarget = containerElement.querySelector(
        `[id="${CSS.escape(focusFallbackId)}"]`,
      );
      if (
        fallbackTarget instanceof HTMLElement &&
        !isUnavailableForFocus(fallbackTarget, fallbackTarget)
      ) {
        if (focusHasBeenLost()) {
          focusElement(findFocusableElement(fallbackTarget, fallbackTarget) ?? fallbackTarget);
        }
        clearRequest();
        return;
      }
    }

    const wrapper = wrapperRef.current;
    const elementToFocus = wrapper
      ? (findFocusableElement(wrapper, wrapper) ??
        (Array.from(wrapper.children).find(
          (child): child is HTMLElement =>
            child instanceof HTMLElement && !isUnavailableForFocus(child, wrapper),
        ) ||
          null))
      : null;
    if (!elementToFocus) {
      return;
    }

    if (focusHasBeenLost()) {
      focusElement(elementToFocus);
    }
    clearRequest();
  }, [clearRequest, containerElement, focusFallbackId, focusRequestId]);

  return (
    <div
      ref={wrapperRef}
      style={{ display: 'contents' }}
    >
      {children}
    </div>
  );
};
