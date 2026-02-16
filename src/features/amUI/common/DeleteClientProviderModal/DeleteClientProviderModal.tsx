import React, { useCallback, useRef, useState } from 'react';
import { DsAlert, DsButton, DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { TrashIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import classes from './DeleteClientProviderModal.module.css';

interface DeleteClientProviderModalProps {
  triggerLabel: string;
  heading: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  disabled?: boolean;
  errorMessage?: string;
}

export const DeleteClientProviderModal = ({
  triggerLabel,
  heading,
  body,
  confirmLabel,
  onConfirm,
  disabled = false,
  errorMessage,
}: DeleteClientProviderModalProps) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const onConfirmDelete = useCallback(async () => {
    setHasError(false);
    setIsSubmitting(true);

    try {
      await onConfirm();
      dialogRef.current?.close();
    } catch {
      setHasError(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [onConfirm]);

  return (
    <DsDialog.TriggerContext>
      <DsDialog.Trigger
        variant='tertiary'
        data-size='sm'
        disabled={disabled}
        onClick={() => {
          setHasError(false);
          dialogRef.current?.showModal();
        }}
      >
        <TrashIcon />
        {triggerLabel}
      </DsDialog.Trigger>
      <DsDialog
        ref={dialogRef}
        closedby='any'
        className={classes.modal}
      >
        <div className={classes.content}>
          <DsHeading data-size='sm'>{heading}</DsHeading>
          <DsParagraph>{body}</DsParagraph>
          {hasError && (
            <DsAlert data-color='danger'>
              <DsParagraph>{errorMessage ?? t('common.general_error_paragraph')}</DsParagraph>
            </DsAlert>
          )}
          <div className={classes.buttons}>
            <DsButton
              data-color='danger'
              onClick={onConfirmDelete}
              loading={isSubmitting}
            >
              {confirmLabel}
            </DsButton>
            <DsButton
              variant='secondary'
              onClick={() => dialogRef.current?.close()}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </DsButton>
          </div>
        </div>
      </DsDialog>
    </DsDialog.TriggerContext>
  );
};
