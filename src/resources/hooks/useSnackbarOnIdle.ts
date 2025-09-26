import { useEffect, useRef, useState } from 'react';
import { SnackbarColor, useSnackbar } from '@altinn/altinn-components';

interface PendingSnackbar {
  message: string;
  color?: SnackbarColor;
}

interface UseSnackbarOnIdleProps {
  isBusy: boolean;
  showPendingOnUnmount?: boolean;
}

/**
 * Defers showing a snackbar until an external "busy" flag transitions from true to false.
 * Useful when you want to display a snackbar message after the UI has finished a refresh.
 */
export const useSnackbarOnIdle = ({
  isBusy,
  showPendingOnUnmount = true,
}: UseSnackbarOnIdleProps) => {
  const { openSnackbar } = useSnackbar();
  const [pending, setPending] = useState<PendingSnackbar | null>(null);
  const prevIsBusyRef = useRef<boolean>(isBusy);

  // Refs to avoid stale closures in unmount cleanup
  const pendingRef = useRef<PendingSnackbar | null>(null);
  const showOnUnmountRef = useRef<boolean>(showPendingOnUnmount);

  useEffect(() => {
    showOnUnmountRef.current = showPendingOnUnmount;
  }, [showPendingOnUnmount]);
  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(() => {
    if (pending && prevIsBusyRef.current && !isBusy) {
      openSnackbar({
        message: pending.message,
        color: pending.color ?? 'success',
      });
      setPending(null);
      pendingRef.current = null;
    }
    prevIsBusyRef.current = isBusy;
  }, [isBusy, pending, openSnackbar]);

  const queueSnackbar = (message: string, color: SnackbarColor = 'success') => {
    const next = { message, color } as PendingSnackbar;
    pendingRef.current = next;
    setPending(next);
  };

  useEffect(() => {
    return () => {
      if (showOnUnmountRef.current && pendingRef.current) {
        openSnackbar({
          message: pendingRef.current.message,
          color: pendingRef.current.color ?? 'success',
        });
      }
      pendingRef.current = null;
    };
  }, [openSnackbar]);

  const clearSnackbar = () => {
    pendingRef.current = null;
    setPending(null);
  };

  return {
    queueSnackbar,
    clearSnackbar,
    hasPending: !!pending,
  };
};
