import { useTranslation } from 'react-i18next';
import { DsButton, DsDialog, DsHeading, DsParagraph, DsSpinner } from '@altinn/altinn-components';
import classes from './DeletePoaConfirmation.module.css';
import { MinusCircleIcon } from '@navikt/aksel-icons';

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
  const closeDialog = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    const dialog = (event.currentTarget as HTMLElement).closest('dialog');
    dialog?.close();
  };

  return (
    <div className={classes.container}>
      <DsDialog.TriggerContext>
        <DsDialog.Trigger
          data-color={color}
          data-size={size}
          variant={variant}
          disabled={isDeleteLoading || disabled}
        >
          {icon && <MinusCircleIcon />}
          {t('common.delete_poa')}
        </DsDialog.Trigger>
        <DsDialog>
          <div className={classes.dialogContent}>
            <DsHeading level={3}>{t('common.confirm_delete_heading')}</DsHeading>
            <DsParagraph>{warningText}</DsParagraph>
            <div className={classes.dialogButtons}>
              <DsButton
                data-color='danger'
                onClick={(event) => {
                  handleDeletion();
                  closeDialog(event);
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
      </DsDialog.TriggerContext>
      {isDeleteLoading && (
        <DsSpinner
          aria-label={loadingAriaLabel}
          data-size='sm'
        />
      )}
    </div>
  );
};
