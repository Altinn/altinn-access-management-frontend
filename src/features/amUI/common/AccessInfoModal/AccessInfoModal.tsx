import React, { useEffect, useRef } from 'react';
import { DsButton, DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { StatusSection } from '../StatusSection/StatusSection';
import type { InheritedStatusMessageType } from '../useInheritedStatus';

import classes from './AccessInfoModal.module.css';

export interface AccessInfoModalProps {
  open: boolean;
  onClose: () => void;
  /** Heading – name of the user or access package the action applies to. */
  name: string;
  /** Optional custom header replacing the default heading (e.g. `PackageHeader`). */
  header?: React.ReactNode;
  /** Optional context line shown under the heading (e.g. "via role X"). */
  description?: React.ReactNode;
  userHasAccess?: boolean;
  inheritedStatus?: InheritedStatusMessageType[];
  cannotDelegateHere?: boolean;
  showDelegationCheckWarning?: boolean;
  isPendingRequest?: boolean;
  /** Forwarded to StatusSection so its messages name the correct recipient. */
  toPartyName?: string;
  /** Extra content rendered after the status (e.g. `PackageMeta`). */
  children?: React.ReactNode;
  /** The clearly labelled action button(s) shown at the bottom of the modal. */
  actions: React.ReactNode;
}

/**
 * Small, self-contained modal that shows who/what an action applies to, the
 * current access status and inheritance info, plus a clearly labelled action.
 * Used to replace inline icon-only controls on small screens, following the
 * pattern of `AccessPackageInfo`/`ResourceInfo`.
 */
export const AccessInfoModal = ({
  open,
  onClose,
  name,
  header,
  description,
  userHasAccess,
  inheritedStatus,
  cannotDelegateHere,
  showDelegationCheckWarning,
  isPendingRequest,
  toPartyName,
  children,
  actions,
}: AccessInfoModalProps) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <DsDialog
      ref={dialogRef}
      className={classes.modalDialog}
      closedby='any'
      onClose={onClose}
    >
      <div className={classes.content}>
        {header ?? (
          <DsHeading
            level={2}
            data-size='xs'
          >
            {name}
          </DsHeading>
        )}

        {description && <DsParagraph data-size='sm'>{description}</DsParagraph>}

        <StatusSection
          userHasAccess={userHasAccess}
          inheritedStatus={inheritedStatus}
          cannotDelegateHere={cannotDelegateHere}
          showDelegationCheckWarning={showDelegationCheckWarning}
          isPendingRequest={isPendingRequest}
          toPartyName={toPartyName}
        />

        {children}

        {actions && <div className={classes.actions}>{actions}</div>}

        <DsButton
          variant='secondary'
          data-size='sm'
          className={classes.closeButton}
          onClick={onClose}
        >
          {t('common.close')}
        </DsButton>
      </div>
    </DsDialog>
  );
};
