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

// Focuses the element, making it programmatically focusable for this call only when it is not
// natively focusable (e.g. a heading or a processed, non-interactive row).
export const focusElement = (element: HTMLElement) => {
  if (element.matches(FOCUSABLE_SELECTOR)) {
    element.focus();
    return;
  }

  const hadTabIndex = element.hasAttribute('tabindex');
  if (!hadTabIndex) {
    element.tabIndex = -1;
  }
  element.focus();
  if (!hadTabIndex) {
    element.removeAttribute('tabindex');
  }
};

// Focuses the first focusable element inside the element with the given id once focus has been
// requested for that id. No-op when rendered outside a RestoreFocusProvider.
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

// Catches focus when the requested id does not exist in the container, e.g. when the originating
// item was removed. Render one of these inside a provider, typically around the list heading.
// Focuses its first focusable descendant, otherwise its first child element.
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

    // Before the generic catch-all below, try the request's own fallback id.
    if (focusFallbackId) {
      const fallbackTarget = containerElement.querySelector(
        `[id="${CSS.escape(focusFallbackId)}"]`,
      );
      if (fallbackTarget instanceof HTMLElement) {
        const focusable = findFocusableElement(fallbackTarget, fallbackTarget);
        if (focusable) {
          if (focusHasBeenLost()) {
            focusElement(focusable);
          }
          clearRequest();
          return;
        }
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
