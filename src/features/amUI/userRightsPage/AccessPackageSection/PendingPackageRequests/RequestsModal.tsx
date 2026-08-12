import React, { useState } from 'react';
import { type EnrichedPackageRequest } from '@/rtk/features/requestApi';
import { PendingPackageRequestsList } from './RequestsList';
import { useRestoreFocus } from '../../../common/RestoreFocus';
import { TwoStepDialog } from '../../../common/TwoStepDialog';

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
  const [selectedRequest, setSelectedRequest] = useState<EnrichedPackageRequest | null>(null);
  const restoreFocus = useRestoreFocus();

  return (
    <TwoStepDialog
      ref={modalRef}
      title={heading}
      isDetailView={!!selectedRequest}
      onBack={() => {
        if (selectedRequest?.package?.id) {
          restoreFocus.requestFocus(selectedRequest.package.id);
        }
        setSelectedRequest(null);
      }}
      onClose={() => {
        setSelectedRequest(null);
        onClose();
      }}
      restoreFocus={restoreFocus}
    >
      {isModalOpen && (
        <PendingPackageRequestsList
          selectedRequest={selectedRequest}
          setSelectedRequest={setSelectedRequest}
        />
      )}
    </TwoStepDialog>
  );
};
