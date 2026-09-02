import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';

import classes from './RevokeConfirmationDialog.module.css';

interface RevokeConfirmationDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmation shown before deleting a poa the user cannot give back again. */
export const RevokeConfirmationDialog = ({
  open,
  onConfirm,
  onCancel,
}: RevokeConfirmationDialogProps) => {
  const { t } = useTranslation();
  const headingId = useId();

  if (!open) return null;

  return (
    <DsDialog.TriggerContext>
      <DsDialog
        open
        closedby='any'
        closeButton={t('common.close')}
        onClose={onCancel}
        aria-labelledby={headingId}
      >
        <div className={classes.content}>
          <DsHeading
            id={headingId}
            level={2}
            data-size='xs'
          >
            {t('common.confirm_delete_heading')}
          </DsHeading>
          <DsParagraph data-size='sm'>{t('revoke_confirmation.cannot_redelegate')}</DsParagraph>
          <div className={classes.buttons}>
            <DsButton
              data-color='danger'
              onClick={onConfirm}
            >
              {t('common.yes_delete')}
            </DsButton>
            <DsButton
              variant='secondary'
              onClick={onCancel}
            >
              {t('common.cancel')}
            </DsButton>
          </div>
        </div>
      </DsDialog>
    </DsDialog.TriggerContext>
  );
};
