import { useEffect, useRef } from 'react';
import { Snackbar, useSnackbar } from '@altinn/altinn-components';

import classes from './TopLayerSnackbar.module.css';

/**
 * A wrapper around the Snackbar component that renders it in the browser's top layer
 * using the Popover API. This ensures snackbars appear above modal dialogs
 * which also use the top layer via showModal().
 *
 * The popover is only shown when there are snackbar messages, ensuring it gets
 * added to the top layer AFTER any dialogs that triggered the snackbar.
 */
export const TopLayerSnackbar = () => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { storedMessages } = useSnackbar();
  const hasMessages = storedMessages && storedMessages.length > 0;

  useEffect(() => {
    if (!popoverRef.current) return;

    if (hasMessages) {
      // Show popover when messages appear - this adds it to the top of the top layer
      if (!popoverRef.current.matches(':popover-open')) {
        popoverRef.current.showPopover();
      }
    } else {
      // Hide popover when no messages
      if (popoverRef.current.matches(':popover-open')) {
        popoverRef.current.hidePopover();
      }
    }
  }, [hasMessages]);

  return (
    <div
      ref={popoverRef}
      popover='manual'
      className={classes.topLayerSnackbar}
    >
      <Snackbar />
    </div>
  );
};
