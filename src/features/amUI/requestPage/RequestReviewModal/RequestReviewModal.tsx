import { useRef, useEffect } from 'react';
import { DsDialog, Snackbar, SnackbarProvider } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import type { Request } from '../types';
import { RequestReviewModalContent } from './RequestReviewModalContent';
import classes from './RequestReviewModal.module.css';

interface RequestReviewModalProps {
  request: Request | null;
  onClose: () => void;
}

export const RequestReviewModal = ({ request, onClose }: RequestReviewModalProps) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);

  // Open/close the dialog based on the request prop to allow for external control
  useEffect(() => {
    if (request) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [request]);

  return (
    <DsDialog
      ref={modalRef}
      closedby='any'
      closeButton={t('common.close')}
      onClose={onClose}
      className={classes.reviewModal}
    >
      <SnackbarProvider>
        <RequestReviewModalContent
          request={request}
          onClose={onClose}
        />
        <Snackbar />
      </SnackbarProvider>
    </DsDialog>
  );
};
