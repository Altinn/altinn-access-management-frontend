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

// Use this when you own a zone (a list, a modal, a section) and need to send focus somewhere
// specific later, for example:
// - a sub-view closes
// - an action settles
// - an item is removed
//
// Pass the result to <RestoreFocusProvider>. Call requestFocus(id, fallbackId?) once you know the
// destination. One per zone.
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

// Use this when a descendant needs to call requestFocus, for example from a button's onClick,
// without owning the controller itself. There should be exactly one useRestoreFocus() per zone,
// created by whichever component renders <RestoreFocusProvider>.
export const useRestoreFocusContext = () => useContext(RestoreFocusContext);

// Use this once per zone. Wrap the subtree that contains both the triggering elements and the
// RestoreFocusTarget/RestoreFocusFallback descendants. This scopes id lookups to that subtree, so
// a duplicate id elsewhere on the page (for example, a row hidden behind a modal) is never matched.
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
