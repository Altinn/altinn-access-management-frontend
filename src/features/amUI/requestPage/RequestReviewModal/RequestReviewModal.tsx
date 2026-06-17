import { useRef, useEffect, useCallback } from 'react';
import { DsDialog } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import type { Request, RequestReviewModalCloseOptions } from '../types';
import { RequestReviewModalContent } from './RequestReviewModalContent';
import classes from './RequestReviewModal.module.css';

interface RequestReviewModalProps {
  request: Request | null;
  onClose: (options?: RequestReviewModalCloseOptions) => void;
}

export const RequestReviewModal = ({ request, onClose }: RequestReviewModalProps) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const waitForRequestRemovalRef = useRef(false);

  // Open/close the dialog based on the request prop to allow for external control
  useEffect(() => {
    if (request) {
      waitForRequestRemovalRef.current = false;
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [request]);

  const handleClose = useCallback(
    (options?: RequestReviewModalCloseOptions) => {
      onClose({
        waitForRequestRemoval: options?.waitForRequestRemoval ?? waitForRequestRemovalRef.current,
      });
    },
    [onClose],
  );

  return (
    <DsDialog
      ref={modalRef}
      closedby='any'
      closeButton={t('common.close')}
      onClose={() => handleClose()}
      className={classes.reviewModal}
    >
      <RequestReviewModalContent
        request={request}
        onClose={handleClose}
        onAllRequestsProcessedChange={(allRequestsProcessed) => {
          waitForRequestRemovalRef.current = allRequestsProcessed;
        }}
      />
    </DsDialog>
  );
};
