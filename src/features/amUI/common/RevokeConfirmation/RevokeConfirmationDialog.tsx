import { useId } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { DsButton, DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';

import classes from './RevokeConfirmationDialog.module.css';

/** Names the poa about to be deleted, so the dialog identifies the row the user clicked. */
export interface RevokedPoa {
  /** The access package or resource being deleted. */
  name: string;
  /** The party that loses the access. */
  toName: string;
}

interface RevokeConfirmationDialogProps {
  open: boolean;
  poa?: RevokedPoa;
  onConfirm: () => void;
  onCancel: () => void;
}

export const RevokeConfirmationDialog = ({
  open,
  poa,
  onConfirm,
  onCancel,
}: RevokeConfirmationDialogProps) => {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <DsDialog.TriggerContext>
      <DsDialog
        open={open}
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
            {poa ? (
              <Trans
                i18nKey='revoke_confirmation.heading_for'
                values={{ name: poa.name, to_name: poa.toName }}
                components={{ b: <strong /> }}
              />
            ) : (
              t('common.confirm_delete_heading')
            )}
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
