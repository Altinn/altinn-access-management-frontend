import { useTranslation } from 'react-i18next';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { useRef, useState } from 'react';
import { DsButton, DsDialog, DsHeading, DsParagraph, DsSpinner } from '@altinn/altinn-components';
import classes from './DeletePoaConfirmation.module.css';

export interface DeletePoaConfirmationProps {
  warningText: string;
  handleDeletion: () => void;
  isDeleteLoading?: boolean;
  loadingAriaLabel: string;
  color?: 'danger' | 'neutral';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'tertiary';
  icon?: boolean;
  disabled?: boolean;
}

export const DeletePoaConfirmation = ({
  warningText,
  handleDeletion,
  isDeleteLoading = false,
  loadingAriaLabel,
  color = 'danger',
  size = 'sm',
  variant = 'secondary',
  icon = false,
  disabled = false,
}: DeletePoaConfirmationProps) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const closeDialog = () => {
    dialogRef.current?.close();
    setOpen(false);
  };

  return (
    <div className={classes.container}>
      <DsDialog.Trigger
        data-color={color}
        data-size={size}
        variant={variant}
        disabled={isDeleteLoading || disabled}
        onClick={() => {
          if (!open) {
            setOpen(true);
            requestAnimationFrame(() => dialogRef.current?.showModal());
          }
        }}
      >
        {icon && <MinusCircleIcon />}
        {t('common.delete_poa')}
      </DsDialog.Trigger>
      {open && (
        <DsDialog
          ref={dialogRef}
          onClose={() => setOpen(false)}
        >
          <div className={classes.dialogContent}>
            <DsHeading level={3}>{t('common.confirm_delete_heading')}</DsHeading>
            <DsParagraph>{warningText}</DsParagraph>
            <div className={classes.dialogButtons}>
              <DsButton
                data-color='danger'
                onClick={() => {
                  handleDeletion();
                  closeDialog();
                }}
              >
                {t('common.yes_delete')}
              </DsButton>
              <DsButton
                variant='secondary'
                onClick={closeDialog}
              >
                {t('common.cancel')}
              </DsButton>
            </div>
          </div>
        </DsDialog>
      )}
      {isDeleteLoading && (
        <DsSpinner
          aria-label={loadingAriaLabel}
          data-size='sm'
        />
      )}
    </div>
  );
};
