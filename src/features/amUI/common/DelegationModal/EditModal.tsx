import * as React from 'react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DsDialog } from '@altinn/altinn-components';

import type { ActionError } from '@/resources/hooks/useActionError';

import classes from './DelegationModal.module.css';
import { useDelegationModalContext } from './DelegationModalContext';

export enum DelegationAction {
  DELEGATE = 'DELEGATE',
  REQUEST = 'REQUEST',
  REVOKE = 'REVOKE',
  APPROVE = 'APPROVE',
}

export interface EditModalProps {
  ref?: React.Ref<HTMLDialogElement>;
  /** Accessible name of the dialog, e.g. t('delegation_modal.aria_label.access_package'). */
  ariaLabel: string;
  openWithError?: ActionError | null;
  onClose?: () => void;
  children?: React.ReactNode;
}

/**
 * Dialog shell shared by all "edit access" modals. The caller decides what to show inside it,
 * e.g. <ResourceInfo />, <AccessPackageInfo />, <InstanceInfo />, <ScopeInfo /> or <RoleInfo />.
 */
export const EditModal = ({ ref, ariaLabel, openWithError, onClose, children }: EditModalProps) => {
  const { t } = useTranslation();
  const { setActionError, reset } = useDelegationModalContext();
  const ownDialogRef = useRef<HTMLDialogElement | null>(null);

  const setDialogRef = (node: HTMLDialogElement | null) => {
    ownDialogRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  useEffect(() => {
    if (openWithError) {
      setActionError(openWithError);
    } else {
      setActionError(null);
    }
  }, [openWithError, setActionError]);

  return (
    <DsDialog
      ref={setDialogRef}
      className={classes.modalDialog}
      closedby='any'
      onClose={(event) => {
        // To prevent the close event from bubbling up to the parent dialog when the user clicks the backdrop.
        // @digdir/designsystemet-react >= 1.15 has this buildt in, so remove this guard once @altinn/altinn-components bundles that version.
        if (event.target !== ownDialogRef.current) return;
        onClose?.();
        reset();
      }}
      aria-label={ariaLabel}
      aria-description={t('delegation_modal.aria_description')}
    >
      <div className={classes.content}>{children}</div>
    </DsDialog>
  );
};
