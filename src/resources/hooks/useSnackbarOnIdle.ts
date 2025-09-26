import { useEffect, useRef, useState } from 'react';
import { SnackbarColor, useSnackbar } from '@altinn/altinn-components';


interface PendingSnackbar {
  message: string;
  color?: SnackbarColor;
}

/**
 * Defers showing a snackbar until an external "busy" flag transitions from true to false.
 * Useful when you want to display a success message after the UI has finished a refresh/process.
 */
export const useSnackbarOnIdle = (isBusy: boolean) => {
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

