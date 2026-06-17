import { useCallback, useEffect, useRef, useState } from 'react';

interface UseRestoreFocusAfterSettledOptions<RestoreValue> {
  isSettling: boolean;
  onRestore: (value: RestoreValue) => void;
  requestWhen?: boolean;
  requestValue?: RestoreValue;
}

export const focusFirstEnabledButton = (container: HTMLElement | null) => {
  const focusTarget = container?.querySelector<HTMLButtonElement>('button:not([disabled])');
  if (!container || !focusTarget) {
    return;
  }

  const activeElement = focusTarget.ownerDocument.activeElement;
  const userMovedFocus =
    activeElement instanceof HTMLElement &&
    activeElement !== focusTarget.ownerDocument.body &&
    !container.contains(activeElement);
  if (userMovedFocus) {
    return;
  }

  focusTarget.focus();
};

// Registers a focus restore request and runs it after the relevant async/data state has settled.
// The hook intentionally does not inspect list data or DOM targets; RestoreFocusTarget/Fallback
// decides whether the requested id still exists or should fall back.
export const useRestoreFocusAfterSettled = <RestoreValue = undefined>({
  isSettling,
  onRestore,
  requestWhen = false,
  requestValue,
}: UseRestoreFocusAfterSettledOptions<RestoreValue>) => {
  const pendingRestoreRef = useRef<RestoreValue | undefined>(undefined);
  const hasPendingRestoreRef = useRef(false);
  const hasObservedSettlingRef = useRef(false);
  const wasRequestingRestoreRef = useRef(false);
  const [pendingVersion, setPendingVersion] = useState(0);

  const requestRestore = useCallback(
    (value: RestoreValue) => {
      pendingRestoreRef.current = value;
      hasPendingRestoreRef.current = true;
      hasObservedSettlingRef.current = isSettling;
      setPendingVersion((version) => version + 1);
    },
    [isSettling],
  );

  useEffect(() => {
    if (!requestWhen) {
      wasRequestingRestoreRef.current = false;
      return;
    }
    if (wasRequestingRestoreRef.current) {
      return;
    }

    wasRequestingRestoreRef.current = true;
    requestRestore(requestValue as RestoreValue);
  }, [requestRestore, requestValue, requestWhen]);

  useEffect(() => {
    if (!hasPendingRestoreRef.current) {
      return;
    }

    if (isSettling) {
      hasObservedSettlingRef.current = true;
      return;
    }

    if (!hasObservedSettlingRef.current) {
      return;
    }

    const restoreValue = pendingRestoreRef.current as RestoreValue;
    hasPendingRestoreRef.current = false;
    pendingRestoreRef.current = undefined;
    hasObservedSettlingRef.current = false;
    onRestore(restoreValue);
  }, [isSettling, onRestore, pendingVersion]);

  return requestRestore;
};
