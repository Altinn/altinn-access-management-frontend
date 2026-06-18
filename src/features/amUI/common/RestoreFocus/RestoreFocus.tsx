import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

export interface RestoreFocus {
  // Requests focus on the element with the given id. If that id isn't found, a
  // <RestoreFocusFallback> tries fallbackId next, then its generic catch-all.
  requestFocus: (id: string, fallbackId?: string) => void;
  focusRequestId: string | null;
  focusFallbackId: string | null;
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
  const [focusFallbackId, setFocusFallbackId] = useState<string | null>(null);

  const requestFocus = useCallback((id: string, fallbackId?: string) => {
    setFocusRequestId(id);
    setFocusFallbackId(fallbackId ?? null);
  }, []);
  const clearRequest = useCallback(() => {
    setFocusRequestId(null);
    setFocusFallbackId(null);
  }, []);

  return useMemo(
    () => ({
      focusRequestId,
      focusFallbackId,
      requestFocus,
      clearRequest,
    }),
    [clearRequest, focusFallbackId, focusRequestId, requestFocus],
  );
};

export const useRestoreFocusContext = () => useContext(RestoreFocusContext);

// Wraps the area containing the focus targets. Target lookups are scoped to this container.
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
