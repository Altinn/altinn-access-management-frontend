import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const FOCUSABLE_SELECTOR = 'button:not([disabled]), a[href]';

export interface RestoreFocus {
  // Call when navigating back to request focus on the item with the given id.
  requestFocus: (id: string) => void;
  focusRequestId: string | null;
  clearRequest: () => void;
}

const RestoreFocusContext = createContext<
  (RestoreFocus & { containerElement: HTMLElement | null }) | undefined
>(undefined);

// Owns the "which id should receive focus" state. Pass the result to <RestoreFocusProvider>
// and call requestFocus(id) when navigating back to the view containing the target.
export const useRestoreFocus = (): RestoreFocus => {
  const [focusRequestId, setFocusRequestId] = useState<string | null>(null);

  const requestFocus = useCallback((id: string) => setFocusRequestId(id), []);
  const clearRequest = useCallback(() => setFocusRequestId(null), []);

  return useMemo(
    () => ({ focusRequestId, requestFocus, clearRequest }),
    [clearRequest, focusRequestId, requestFocus],
  );
};

// Wraps the area containing the focus targets. Target lookups are scoped to this subtree,
// so a duplicate id elsewhere on the page (e.g. the same list behind a modal) is never focused.
export const RestoreFocusProvider = ({
  restoreFocus,
  children,
}: {
  restoreFocus: RestoreFocus;
  children: ReactNode;
}) => {
  const [containerElement, setContainerElement] = useState<HTMLElement | null>(null);

  const value = useMemo(
    () => ({ ...restoreFocus, containerElement }),
    [containerElement, restoreFocus],
  );

  return (
    <RestoreFocusContext.Provider value={value}>
      <div
        style={{ display: 'contents' }}
        ref={setContainerElement}
      >
        {children}
      </div>
    </RestoreFocusContext.Provider>
  );
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

    const focusable = target.matches(FOCUSABLE_SELECTOR)
      ? target
      : target.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);

    if (focusable) {
      focusable.focus();
    } else {
      // Targets without anything focusable (e.g. a processed, non-interactive row) are made
      // programmatically focusable for this call only, so the user lands on the row itself.
      const hadTabIndex = target.hasAttribute('tabindex');
      if (!hadTabIndex) {
        target.tabIndex = -1;
      }
      target.focus();
      if (!hadTabIndex) {
        target.removeAttribute('tabindex');
      }
    }

    clearRequest();
  }, [clearRequest, containerElement, id, isRequested]);
};

export const RestoreFocusTarget = ({ id, children }: { id: string; children?: ReactNode }) => {
  useRestoreFocusTarget(id);
  return children;
};
