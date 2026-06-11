import {
  createContext,
  type RefCallback,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const RESTORE_FOCUS_SELECTOR = 'button:not([disabled])';

interface RestoreFocusContextValue {
  focusRequestId: string | null;
  clearRequest: () => void;
  containerElement: HTMLElement | null;
  focusNonInteractiveTarget: boolean;
}

interface UseRestoreFocusOptions {
  focusNonInteractiveTarget?: boolean;
}

export interface RestoreFocusController {
  // Attach to the element that contains the focusable list items.
  containerRef: RefCallback<HTMLElement>;
  // Call when navigating back to request focus on the item with the given id.
  requestFocus: (id: string) => void;
  // Feed to <RestoreFocusProvider value> so list items can focus themselves on mount.
  contextValue: RestoreFocusContextValue;
}

const RestoreFocusContext = createContext<RestoreFocusContextValue | undefined>(undefined);

const escapeCssIdentifier = (id: string) => {
  if (typeof CSS !== 'undefined' && CSS.escape) {
    return CSS.escape(id);
  }

  return id.replace(/["\\]/g, '\\$&');
};

// Owns the focus-restore state. The owner uses containerRef/requestFocus directly and renders
// <RestoreFocusProvider value={contextValue}> around its list so nested items can self-focus.
export const useRestoreFocus = ({
  focusNonInteractiveTarget = false,
}: UseRestoreFocusOptions = {}): RestoreFocusController => {
  const [containerElement, setContainerElement] = useState<HTMLElement | null>(null);
  const [focusRequestId, setFocusRequestId] = useState<string | null>(null);

  const containerRef = useCallback<RefCallback<HTMLElement>>((node) => {
    setContainerElement(node);
  }, []);

  const requestFocus = useCallback((id: string) => {
    setFocusRequestId(id);
  }, []);

  const clearRequest = useCallback(() => {
    setFocusRequestId(null);
  }, []);

  const contextValue = useMemo<RestoreFocusContextValue>(
    () => ({
      focusRequestId,
      clearRequest,
      containerElement,
      focusNonInteractiveTarget,
    }),
    [clearRequest, containerElement, focusNonInteractiveTarget, focusRequestId],
  );

  return { containerRef, requestFocus, contextValue };
};

export const RestoreFocusProvider = ({
  value,
  children,
}: {
  value: RestoreFocusContextValue;
  children: ReactNode;
}) => <RestoreFocusContext.Provider value={value}>{children}</RestoreFocusContext.Provider>;

export const useRestoreFocusTarget = (id: string) => {
  const context = useContext(RestoreFocusContext);

  const containerElement = context?.containerElement;
  const focusRequestId = context?.focusRequestId;
  const clearRequest = context?.clearRequest;
  const focusNonInteractiveTarget = context?.focusNonInteractiveTarget ?? false;

  useEffect(() => {
    if (!containerElement || !clearRequest || focusRequestId !== id) {
      return;
    }

    const target = containerElement.querySelector(`[id="${escapeCssIdentifier(id)}"]`);
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const focusableTarget = target.matches(RESTORE_FOCUS_SELECTOR)
      ? target
      : target.querySelector<HTMLElement>(RESTORE_FOCUS_SELECTOR);
    const elementToFocus = focusableTarget ?? (focusNonInteractiveTarget ? target : null);

    if (!elementToFocus) {
      clearRequest();
      return;
    }

    const shouldRestoreTabIndex =
      !elementToFocus.matches(RESTORE_FOCUS_SELECTOR) && !elementToFocus.hasAttribute('tabindex');

    if (shouldRestoreTabIndex) {
      // Non-interactive fallback targets should be programmatically focusable only for this call.
      elementToFocus.tabIndex = -1;
    }

    elementToFocus.focus();

    if (shouldRestoreTabIndex) {
      elementToFocus.removeAttribute('tabindex');
    }

    clearRequest();
  }, [clearRequest, containerElement, focusNonInteractiveTarget, focusRequestId, id]);
};

export const RestoreFocusTarget = ({ id, children }: { id: string; children?: ReactNode }) => {
  useRestoreFocusTarget(id);
  return children;
};
