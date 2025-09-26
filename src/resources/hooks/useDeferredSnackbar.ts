import { useEffect, useRef, useState } from 'react';
import { useSnackbar } from '@altinn/altinn-components';

type SnackbarColor = 'success' | 'danger' | 'info' | 'warning';

interface PendingSnackbar {
  message: string;
  color?: SnackbarColor;
}

/**
 * Defers showing a snackbar until an external "busy" flag transitions from true to false.
 * Useful when you want to display a success message after the UI has finished a refresh/process.
 */
export const useDeferredSnackbar = (isBusy: boolean) => {
  const { openSnackbar } = useSnackbar();
  const [pending, setPending] = useState<PendingSnackbar | null>(null);
  const prevIsBusyRef = useRef<boolean>(isBusy);

  useEffect(() => {
    if (pending && prevIsBusyRef.current && !isBusy) {
      openSnackbar({
        message: pending.message,
        color: pending.color ?? 'success',
      });
      setPending(null);
    }
    prevIsBusyRef.current = isBusy;
  }, [isBusy, pending, openSnackbar]);

  const queueSnackbar = (message: string, color: SnackbarColor = 'success') => {
    setPending({ message, color });
  };

  const clearSnackbar = () => setPending(null);

  return {
    queueSnackbar,
    clearSnackbar,
    hasPending: !!pending,
  };
};

// Alias with a more descriptive name for broader use than just fetching.
export const useSnackbarOnIdle = useDeferredSnackbar;
