import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

export interface RestoreFocus {
  // Call when navigating back to request focus on the item with the given id.
  // When that id is gone, a <RestoreFocusFallback> in the provider catches it instead.
  requestFocus: (id: string) => void;
  // Call when the fallback is the intended next focus target, e.g. after an inline delete succeeds.
  requestFallbackFocus: () => void;
  focusRequestId: string | null;
  isFallbackFocusRequested: boolean;
  clearRequest: () => void;
}

export interface RestoreFocusContextValue extends RestoreFocus {
  containerElement: HTMLElement | null;
}

export const RestoreFocusContext = createContext<RestoreFocusContextValue | undefined>(undefined);

// Owns the "which id should receive focus" state. Pass the result to <RestoreFocusProvider>
// and call requestFocus(id) when navigating back to the view containing the target.
export const useRestoreFocus = (): RestoreFocus => {
  const [focusRequestId, setFocusRequestId] = useState<string | null>(null);
  const [isFallbackFocusRequested, setIsFallbackFocusRequested] = useState(false);

  const requestFocus = useCallback((id: string) => {
    setIsFallbackFocusRequested(false);
    setFocusRequestId(id);
  }, []);
  const requestFallbackFocus = useCallback(() => {
    setFocusRequestId(null);
    setIsFallbackFocusRequested(true);
  }, []);
  const clearRequest = useCallback(() => {
    setFocusRequestId(null);
    setIsFallbackFocusRequested(false);
  }, []);

  return useMemo(
    () => ({
      focusRequestId,
      isFallbackFocusRequested,
      requestFocus,
      requestFallbackFocus,
      clearRequest,
    }),
    [clearRequest, focusRequestId, isFallbackFocusRequested, requestFallbackFocus, requestFocus],
  );
};

export const useRestoreFocusContext = () => useContext(RestoreFocusContext);

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
