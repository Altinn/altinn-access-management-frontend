import React from 'react';
import { SnackbarItem } from '@altinn/altinn-components';
import { BellFillIcon } from '@navikt/aksel-icons';

import styles from './snackbar.module.css';
import { useSnackbar } from './SnackbarProvider';

/**
 * Snackbar component. cf.`useSnackbar` for more info.
 * @returns {JSX.Element|null} The JSX element representing the snackbars or null if no messages are present.
 */

export const SnackbarContainer = (): JSX.Element | null => {
  const { storedMessages, closeSnackbarItem } = useSnackbar();
  return (
    <div
      className={styles.snackbarContainer}
      role='alert'
      aria-live='assertive'
    >
      {(storedMessages || []).map((item) => (
        <SnackbarItem
          key={item.id}
          as='div'
          color={item.variant}
          message={item.message}
          icon={item.icon ?? (BellFillIcon as unknown as SVGElement)}
          dismissable={item.dismissable}
          onDismiss={() => closeSnackbarItem(item.id)}
        />
      ))}
    </div>
  );
};
