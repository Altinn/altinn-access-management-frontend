import React, { useState } from 'react';
import { DsButton, DsDialog } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { type EnrichedPackageRequest } from '@/rtk/features/requestApi';
import { PendingPackageRequestsListWithProviders } from './RequestsList';
import classes from './PendingPackageRequests.module.css';

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
      <PendingPackageRequestsListWithProviders
        isOpen={isModalOpen}
        heading={heading}
        selectedRequest={selectedRequest}
        setSelectedRequest={setSelectedRequest}
      />
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
