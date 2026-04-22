import React, { useState } from 'react';
import { DsButton, DsDialog, Snackbar, SnackbarProvider } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { type EnrichedPackageRequest } from '@/rtk/features/requestApi';
import { PendingPackageRequestsList } from './RequestsList';
import classes from './Requests.module.css';

interface PendingPackageRequestsModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  isModalOpen: boolean;
  heading: string;
  onClose: () => void;
}

export const PendingPackageRequestsModal = ({
  modalRef,
  isModalOpen,
  heading,
  onClose,
}: PendingPackageRequestsModalProps) => {
  const { t } = useTranslation();
  const [selectedRequest, setSelectedRequest] = useState<EnrichedPackageRequest | null>(null);

  return (
    <DsDialog
      ref={modalRef}
      closedby='any'
      onClose={() => {
        setSelectedRequest(null);
        onClose();
      }}
      className={classes.dialog}
    >
      <SnackbarProvider>
        {isModalOpen && (
          <PendingPackageRequestsList
            heading={heading}
            selectedRequest={selectedRequest}
            setSelectedRequest={setSelectedRequest}
          />
        )}
        <Snackbar />
      </SnackbarProvider>
      {!selectedRequest && (
        <DsButton
          variant='primary'
          className={classes.closeButton}
          onClick={() => modalRef.current?.close()}
        >
          {t('common.close')}
        </DsButton>
      )}
    </DsDialog>
  );
};
