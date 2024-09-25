import { BellIcon, XMarkIcon } from '@navikt/aksel-icons';
import cx from 'classnames';
import React from 'react';

import styles from './snackbar.module.css';
import type { SnackbarMessage } from './SnackbarProvider';
import { useSnackbar } from './SnackbarProvider';

interface SnackbarItemProps {
  item: SnackbarMessage;
  closeSnackbarItem: (id: string) => void;
}

const SnackbarItem = ({ item, closeSnackbarItem }: SnackbarItemProps): JSX.Element => {
  return (
    <div
      className={cx(styles.snackbarItem, styles.bottomLeft, styles[item.variant])}
      key={item.id}
      role='status'
      aria-live='polite'
    >
      <div className={styles.snackbarItemContent}>
        <span
          className={styles.leftIcon}
          onClick={() => closeSnackbarItem(item.id)}
          onKeyUp={(e) => e.key === 'Enter' && closeSnackbarItem(item.id)}
          tabIndex={0}
          role='button'
        >
          <BellIcon />
        </span>
        <span className={styles.message}>{item.message}</span>
        {item.dismissable && (
          <span
            className={styles.closeIcon}
            onClick={() => closeSnackbarItem(item.id)}
            onKeyUp={(e) => e.key === 'Enter' && closeSnackbarItem(item.id)}
            tabIndex={0}
            role='button'
          >
            <XMarkIcon />
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Snackbar component. cf.`useSnackbar` for more info.
 * @returns {JSX.Element|null} The JSX element representing the snackbar or null if no messages are present.
 */
export const Snackbar = (): JSX.Element | null => {
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
          item={item}
          closeSnackbarItem={closeSnackbarItem}
        />
      ))}
    </div>
  );
};
