import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';

interface MaskinportenDeleteDialogProps {
  heading: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}

export const MaskinportenDeleteDialog = forwardRef<
  HTMLDialogElement,
  MaskinportenDeleteDialogProps
>(({ heading, body, confirmLabel, onConfirm, onClose, isLoading }, ref) => {
  const { t } = useTranslation();

  const handleCancel = () => {
    if (ref && 'current' in ref) {
      ref.current?.close();
    }
  };

  return (
    <DsDialog
      ref={ref}
      closedby='any'
      onClose={onClose}
    >
      <DsHeading data-size='sm'>{heading}</DsHeading>
      <DsParagraph>{body}</DsParagraph>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <DsButton
          data-color='danger'
          onClick={onConfirm}
          loading={isLoading}
        >
          {confirmLabel}
        </DsButton>
        <DsButton
          variant='secondary'
          onClick={handleCancel}
          disabled={isLoading}
        >
          {t('common.cancel')}
        </DsButton>
      </div>
    </DsDialog>
  );
});
